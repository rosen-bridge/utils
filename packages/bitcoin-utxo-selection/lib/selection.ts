import { BoxInfo, BitcoinUtxo, CoveringBoxes } from './types';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

/**
 * extracts box id and assets of a utxo
 * @param utxo
 * @returns an object containing the box id and assets
 */
export const getUtxoInfo = (utxo: BitcoinUtxo): BoxInfo => {
  return {
    id: `${utxo.txId}.${utxo.index}`,
    assets: {
      nativeToken: BigInt(utxo.value),
      tokens: [],
    },
  };
};

/**
 * gets useful, allowable and last boxes for an address until required assets are satisfied
 * @param requiredBtc the required assets
 * @param forbiddenBoxIds the id of forbidden boxes
 * @param trackMap the mapping of a box id to it's next box
 * @param nextUtxo a generator function to get utxo
 * @param logger
 * @returns an object containing the selected boxes with a boolean showing if requirements covered or not
 */
export const selectBitcoinUtxos = async (
  requiredBtc: bigint,
  forbiddenBoxIds: Array<string>,
  trackMap: Map<string, BitcoinUtxo | undefined>,
  utxoIterator: Iterator<BitcoinUtxo, undefined>,
  minimumAllowedBtc: bigint,
  logger: AbstractLogger = new DummyLogger()
): Promise<CoveringBoxes<BitcoinUtxo>> => {
  let uncoveredNativeToken = requiredBtc;
  const selectedUtxos: Array<string> = [];

  const result: Array<BitcoinUtxo> = [];

  // get boxes until requirements are satisfied
  while (uncoveredNativeToken > 0n) {
    const iteratorResponse = utxoIterator.next();

    // end process if there are no more boxes
    if (iteratorResponse.done) break;
    const box = iteratorResponse.value;

    let trackedBox: BitcoinUtxo | undefined = box;
    let boxInfo = getUtxoInfo(box);
    logger.debug(`fetched [${boxInfo.id}]`);

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
    if (
      skipBox ||
      forbiddenBoxIds.includes(boxInfo.id) ||
      selectedUtxos.includes(boxInfo.id)
    ) {
      logger.debug(`box [${boxInfo.id}] is skipped`);
      continue;
    }

    // check if box value is sufficient
    if (boxInfo.assets.nativeToken < minimumAllowedBtc) {
      logger.debug(
        `box [${boxInfo.id}] is skipped due to insufficient value [${boxInfo.assets.nativeToken} < ${minimumAllowedBtc}]`
      );
      continue;
    }

    // check and add if box assets are useful to requirements
    uncoveredNativeToken -=
      uncoveredNativeToken >= boxInfo.assets.nativeToken
        ? boxInfo.assets.nativeToken
        : uncoveredNativeToken;
    result.push(trackedBox!);
    selectedUtxos.push(boxInfo.id);
    logger.debug(`box [${boxInfo.id}] is selected`);

    // end process if requirements are satisfied
    if (uncoveredNativeToken <= 0n) {
      logger.debug(`requirements satisfied`);
      break;
    }
  }

  return {
    covered: uncoveredNativeToken <= 0n,
    boxes: result,
  };
};
