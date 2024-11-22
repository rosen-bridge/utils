import { BoxInfo, DogeUtxo, CoveringBoxes } from './types';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  DOGE_INPUT_SIZE,
  DOGE_OUTPUT_SIZE,
  DOGE_TX_BASE_SIZE,
  MINIMUM_UTXO_VALUE,
} from './constants';
/**
 * calculates estimated transaction fee based on input and output counts
 * @param inputSize number of inputs
 * @param outputSize number of outputs
 * @param feePerByte network fee per byte
 * @returns estimated fee in satoshis
 */
export const estimateTxFee = (
  inputSize: number,
  outputSize: number,
  feePerByte: number
): bigint => {
  const inputSizeInBytes = inputSize * DOGE_INPUT_SIZE;
  const outputSizeInBytes = outputSize * DOGE_OUTPUT_SIZE;
  const txSizeInBytes =
    DOGE_TX_BASE_SIZE + inputSizeInBytes + outputSizeInBytes;
  return BigInt(Math.ceil(txSizeInBytes * feePerByte));
};

/**
 * extracts box id and assets of a utxo
 * @param utxo
 * @returns an object containing the box id and assets
 */
export const getUtxoInfo = (utxo: DogeUtxo): BoxInfo => {
  return {
    id: `${utxo.txId}.${utxo.index}`,
    assets: {
      nativeToken: utxo.value,
      tokens: [],
    },
  };
};

/**
 * gets useful, allowable and last boxes for an address until required assets are satisfied
 * @param requiredSatoshi the required DOGE in satoshi unit
 * @param forbiddenBoxIds the id of forbidden boxes
 * @param trackMap the mapping of a box id to its next box
 * @param utxoIterator a generator function to get utxo
 * @param feePerByte network fee per byte
 * @param logger
 * @returns an object containing the selected boxes with a boolean showing if requirements covered or not
 */
export const selectDogeUtxos = async (
  requiredSatoshi: bigint,
  forbiddenBoxIds: Array<string>,
  trackMap: Map<string, DogeUtxo | undefined>,
  utxoIterator:
    | AsyncIterator<DogeUtxo, undefined>
    | Iterator<DogeUtxo, undefined>,
  feePerByte: number,
  logger: AbstractLogger = new DummyLogger()
): Promise<CoveringBoxes<DogeUtxo>> => {
  let uncoveredNativeToken = requiredSatoshi + estimateTxFee(0, 2, feePerByte);
  const selectedUtxos: Array<string> = [];
  const result: Array<DogeUtxo> = [];

  // get boxes until requirements are satisfied
  while (uncoveredNativeToken > 0n) {
    const iteratorResponse = await utxoIterator.next();

    // end process if there are no more boxes
    if (iteratorResponse.done) break;
    const box = iteratorResponse.value;

    let trackedBox: DogeUtxo | undefined = box;
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
    if (boxInfo.assets.nativeToken < MINIMUM_UTXO_VALUE) {
      logger.debug(
        `box [${boxInfo.id}] is skipped due to insufficient value [${boxInfo.assets.nativeToken} < ${MINIMUM_UTXO_VALUE}]`
      );
      continue;
    }

    // check and add if box assets are useful to requirements
    result.push(trackedBox!);
    selectedUtxos.push(boxInfo.id);
    uncoveredNativeToken += estimateTxFee(1, 0, feePerByte);
    uncoveredNativeToken -=
      uncoveredNativeToken >= boxInfo.assets.nativeToken
        ? boxInfo.assets.nativeToken
        : uncoveredNativeToken;
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
