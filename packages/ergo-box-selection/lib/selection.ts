import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { AssetBalance, BoxInfo, CoveringBoxes, ErgoBoxProxy } from './types';

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
  boxIterator: Iterator<ErgoBoxProxy, undefined>,
  logger: AbstractLogger = new DummyLogger()
): Promise<CoveringBoxes<ErgoBoxProxy>> => {
  let uncoveredNativeToken = requiredAssets.nativeToken;
  const uncoveredTokens = requiredAssets.tokens.filter(
    (info) => info.value > 0n
  );

  const isRequirementRemaining = () => {
    return uncoveredTokens.length > 0 || uncoveredNativeToken > 0n;
  };

  const offset = 0;
  const result: Array<ErgoBoxProxy> = [];

  // get boxes until requirements are satisfied
  while (isRequirementRemaining()) {
    const iteratorResponse = boxIterator.next();

    // end process if there are no more boxes
    if (iteratorResponse.done) break;

    let trackedBox: ErgoBoxProxy | undefined = iteratorResponse.value;
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
    if (skipBox || forbiddenBoxIds.includes(boxInfo.id)) {
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
      logger.debug(`box [${boxInfo.id}] is selected`);
    } else logger.debug(`box [${boxInfo.id}] is ignored`);
  }

  return {
    covered: !isRequirementRemaining(),
    boxes: result,
  };
};
