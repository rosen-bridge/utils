import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import {
  AssetBalance,
  BoxInfo,
  CoveringBoxes,
  ErgoBoxProxy,
  TokenInfo,
} from './types';

/**
 * extracts box id and assets of a box
 * @param box the box
 * @returns an object containing the box id and assets
 */
const getBoxInfo = (box: ErgoBoxProxy): BoxInfo => {
  return {
    id: box.boxId,
    assets: {
      nativeToken: BigInt(box.value),
      tokens: box.assets.map((token) => ({
        id: token.tokenId,
        value: BigInt(token.amount),
      })),
    },
  };
};

/**
 * select useful boxes for an address until required assets are satisfied
 * @param address the address
 * @param requiredAssets the required assets
 * @param forbiddenBoxIds the id of forbidden boxes
 * @param trackMap the mapping of a box id to it's next box
 * @returns an object containing the selected boxes with a boolean showing if requirements covered or not
 */
export const selectErgoBoxes = async (
  requiredAssets: AssetBalance,
  forbiddenBoxIds: Array<string>,
  trackMap: Map<string, ErgoBoxProxy | undefined>,
  boxIterator:
    | AsyncIterator<ErgoBoxProxy, undefined>
    | Iterator<ErgoBoxProxy, undefined>,
  logger: AbstractLogger = new DummyLogger()
): Promise<CoveringBoxes<ErgoBoxProxy>> => {
  let uncoveredNativeToken = requiredAssets.nativeToken;
  const uncoveredTokens = requiredAssets.tokens.filter(
    (info) => info.value > 0n
  );
  const selectedBoxes: Array<string> = [];

  const isRequirementRemaining = () => {
    return uncoveredTokens.length > 0 || uncoveredNativeToken > 0n;
  };

  const result: Array<ErgoBoxProxy> = [];

  // get boxes until requirements are satisfied
  while (isRequirementRemaining()) {
    const iteratorResult = await boxIterator.next();

    // end process if there are no more boxes
    if (iteratorResult.done) break;

    let trackedBox: ErgoBoxProxy | undefined = iteratorResult.value;
    let boxInfo = getBoxInfo(trackedBox);
    logger.debug(`processing box [${boxInfo.id}] for covering`);

    // track boxes
    let skipBox = false;
    while (trackMap.has(boxInfo.id)) {
      trackedBox = trackMap.get(boxInfo.id);
      if (!trackedBox) {
        logger.debug(`box [${boxInfo.id}] is tracked to nothing`);
        skipBox = true;
        break;
      }
      const previousBoxId = boxInfo.id;
      boxInfo = getBoxInfo(trackedBox);
      logger.debug(`box [${previousBoxId}] is tracked to box [${boxInfo.id}]`);
    }

    // if tracked to no box or forbidden box, skip it
    if (
      skipBox ||
      forbiddenBoxIds.includes(boxInfo.id) ||
      selectedBoxes.includes(boxInfo.id)
    ) {
      logger.debug(`box [${boxInfo.id}] is skipped`);
      continue;
    }

    // check and add if box assets are useful to requirements
    let isUseful = false;
    boxInfo.assets.tokens.forEach((boxToken) => {
      const tokenIndex = uncoveredTokens.findIndex(
        (requiredToken) => requiredToken.id === boxToken.id
      );
      if (tokenIndex !== -1) {
        isUseful = true;
        const token = uncoveredTokens[tokenIndex];
        if (token.value > boxToken.value) token.value -= boxToken.value;
        else uncoveredTokens.splice(tokenIndex, 1);
        logger.debug(
          `box [${boxInfo.id}] is selected due to need of token [${token.id}]`
        );
      }
    });
    if (isUseful || uncoveredNativeToken > 0n) {
      uncoveredNativeToken -=
        uncoveredNativeToken >= boxInfo.assets.nativeToken
          ? boxInfo.assets.nativeToken
          : uncoveredNativeToken;
      result.push(trackedBox!);
      selectedBoxes.push(boxInfo.id);
      logger.debug(`box [${boxInfo.id}] is selected`);
    } else logger.debug(`box [${boxInfo.id}] is ignored`);
  }

  return {
    covered: !isRequirementRemaining(),
    boxes: result,
  };
};

/**
 * creates a change box with remaining Erg value and token amounts. returns
 * undefined if remaining value and amounts are zero.
 *
 * @export
 * @param {string} changeAddress
 * @param {number} height
 * @param {ErgoBoxProxy[]} inputBoxes
 * @param {ergoLib.ErgoBoxCandidate[]} outputBoxes
 * @param {bigint} txFee
 * @param {TokenInfo[]} tokensToBurn
 * @param {AbstractLogger} [logger=new DummyLogger()]
 * @return {(ergoLib.ErgoBoxCandidate | undefined)}
 */
export const createChangeBox = (
  changeAddress: string,
  height: number,
  inputBoxes: ErgoBoxProxy[],
  outputBoxes: ergoLib.ErgoBoxCandidate[],
  txFee: bigint,
  tokensToBurn: TokenInfo[],
  logger: AbstractLogger = new DummyLogger()
): ergoLib.ErgoBoxCandidate | undefined => {
  const value = calcChangeValue(inputBoxes, outputBoxes, txFee);
  logger.debug(`change value of change box: [${value}]`);

  if (value < 0) {
    throw new Error(
      `output boxes have ${-value} more nanoErgs than input boxes`
    );
  }

  const safeMinBoxValue = BigInt(
    ergoLib.BoxValue.SAFE_USER_MIN().as_i64().to_str()
  );
  if (value > 0 && value < safeMinBoxValue) {
    throw new Error(
      `change value is greater than zero but is less than safe value of ${safeMinBoxValue} nanoErgs`
    );
  }

  const tokens = calcTokenChange(inputBoxes, outputBoxes);
  tokensToBurn.forEach((token) =>
    tokens.set(token.id, (tokens.get(token.id) || 0n) - token.value)
  );
  logger.debug(
    `token change values to include in change box: [${[...tokens.entries()]}]`
  );

  for (const [id, amount] of tokens.entries()) {
    if (amount < 0n) {
      throw new Error(
        `output boxes have ${-amount} extra tokens with id=[${id}]`
      );
    }
  }

  if (value === 0n && [...tokens.values()].some((amount) => amount > 0n)) {
    throw new Error(
      `change value is zero but there are some tokens with amount > 0`
    );
  }

  if (value === 0n) {
    return undefined;
  }

  const boxBuilder = new ergoLib.ErgoBoxCandidateBuilder(
    ergoLib.BoxValue.from_i64(ergoLib.I64.from_str(value.toString())),
    ergoLib.Contract.pay_to_address(ergoLib.Address.from_base58(changeAddress)),
    height
  );

  tokens.forEach((amount, id) => {
    if (amount > 0) {
      boxBuilder.add_token(
        ergoLib.TokenId.from_str(id),
        ergoLib.TokenAmount.from_i64(ergoLib.I64.from_str(amount.toString()))
      );
    } else if (amount < 0) {
      throw new Error(
        `there is ${-amount} more tokens with id=${id} in outputs than inputs`
      );
    }
  });

  return boxBuilder.build();
};

/**
 * calculate difference between input and output box values
 *
 * @param {ErgoBoxProxy[]} inputBoxes
 * @param {ergoLib.ErgoBoxCandidate[]} outputBoxes
 * @return {bigint}
 */
export const calcChangeValue = (
  inputBoxes: ErgoBoxProxy[],
  outputBoxes: ergoLib.ErgoBoxCandidate[],
  txFee: bigint
): bigint => {
  const inputValue = inputBoxes
    .map((box) => BigInt(box.value))
    .reduce((sum, val) => sum + val, 0n);
  const outputValue = outputBoxes
    .map((box) => BigInt(box.value().as_i64().to_str()))
    .reduce((sum, val) => sum + val, 0n);
  return inputValue - outputValue - txFee;
};

/**
 * calculates token amount difference between input and output boxes
 *
 * @param {ErgoBoxProxy[]} inputBoxes
 * @param {ergoLib.ErgoBoxCandidate[]} outputBoxes
 * @return {Map<string, bigint>}
 */
export const calcTokenChange = (
  inputBoxes: ErgoBoxProxy[],
  outputBoxes: ergoLib.ErgoBoxCandidate[]
): Map<string, bigint> => {
  const tokens = new Map<string, bigint>();
  inputBoxes
    .flatMap((box) => box.assets)
    .forEach((token) =>
      tokens.set(
        token.tokenId,
        BigInt(token.amount) + (tokens.get(token.tokenId) || 0n)
      )
    );

  const outputTokens: Array<{ id: string; amount: bigint }> = [];
  outputBoxes.forEach((box) => {
    const tokens = box.tokens();
    const tokenCount = tokens.len();
    for (let i = 0; i < tokenCount; i++) {
      const token = tokens.get(i);
      outputTokens.push({
        id: token.id().to_str(),
        amount: BigInt(token.amount().as_i64().to_str()),
      });
    }
  });
  outputTokens.forEach((token) =>
    tokens.set(token.id, (tokens.get(token.id) || 0n) - token.amount)
  );

  return tokens;
};
