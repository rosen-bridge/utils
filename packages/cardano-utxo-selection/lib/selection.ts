import { AssetBalance, BoxInfo, CardanoUtxo, CoveringBoxes } from './types';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';

const GET_UTXO_API_LIMIT = 10;

/**
 * extracts box id and assets of a utxo
 * @param utxo
 * @returns an object containing the box id and assets
 */
export const getUtxoInfo = (utxo: CardanoUtxo): BoxInfo => {
  return {
    id: `${utxo.txId}.${utxo.index}`,
    assets: {
      nativeToken: BigInt(utxo.value),
      tokens: utxo.assets.map((asset) => ({
        id: `${asset.policyId}.${asset.assetName}`,
        value: BigInt(asset.quantity),
      })),
    },
  };
};

/**
 * gets useful, allowable and last boxes for an address until required assets are satisfied
 * @param address the address
 * @param requiredAssets the required assets
 * @param forbiddenBoxIds the id of forbidden boxes
 * @param trackMap the mapping of a box id to it's next box
 * @param getAddressBoxes a generator function to get utxos for an address using offset and limit
 * @param apiLimit the limit which is passing to generator function
 * @param logger
 * @returns an object containing the selected boxes with a boolean showing if requirements covered or not
 */
export const selectCardanoUtxos = async (
  address: string,
  requiredAssets: AssetBalance,
  forbiddenBoxIds: Array<string>,
  trackMap: Map<string, CardanoUtxo | undefined>,
  getAddressUtxos: (
    address: string,
    offset: number,
    limit: number
  ) => Promise<Array<CardanoUtxo>>,
  apiLimit = GET_UTXO_API_LIMIT,
  logger: AbstractLogger = new DummyLogger()
): Promise<CoveringBoxes<CardanoUtxo>> => {
  let uncoveredNativeToken = requiredAssets.nativeToken;
  const uncoveredTokens = requiredAssets.tokens.filter(
    (info) => info.value > 0n
  );

  const isRequirementRemaining = () => {
    return uncoveredTokens.length > 0 || uncoveredNativeToken > 0n;
  };

  let offset = 0;
  const result: Array<CardanoUtxo> = [];

  // get boxes until requirements are satisfied
  while (isRequirementRemaining()) {
    const boxes = await getAddressUtxos(address, offset, apiLimit);
    logger.debug(
      `fetched [${boxes.length}] new boxes for address [${address}]`
    );
    offset += apiLimit;

    // end process if there are no more boxes
    if (boxes.length === 0) break;

    // process received boxes
    for (const box of boxes) {
      let trackedBox: CardanoUtxo | undefined = box;
      let boxInfo = getUtxoInfo(box);

      // track boxes
      let skipBox = false;
      while (trackMap.has(boxInfo.id)) {
        trackedBox = trackMap.get(boxInfo.id);
        if (!trackedBox) {
          skipBox = true;
          logger.debug(`box [${boxInfo.id}] is tracked to nothing`);
          break;
        }
        const preId = boxInfo.id;
        boxInfo = getUtxoInfo(trackedBox);
        logger.debug(`box [${preId}] is tracked to box [${boxInfo.id}]`);
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

      // end process if requirements are satisfied
      if (!isRequirementRemaining()) {
        logger.debug(`requirements satisfied`);
        break;
      }
    }
  }

  return {
    covered: !isRequirementRemaining(),
    boxes: result,
  };
};
