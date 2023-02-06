import { ERGO_NATIVE_TOKEN } from '../const';
import AbstractLogger from '../../logger/AbstractLogger';
import { ErgoRosenData, NodeOutputBox } from './types';
import { Constant } from 'ergo-lib-wasm-nodejs';

/**
 * returns rosenData object if the box format is like rosen bridge observations otherwise returns undefined
 * @param box the output box
 * @param logger logger object
 */
const getNodeRosenData = (
  box: NodeOutputBox,
  logger?: AbstractLogger
): ErgoRosenData | undefined => {
  try {
    if (box.additionalRegisters && box.additionalRegisters.R4) {
      const R4 = Constant.decode_from_base16(box.additionalRegisters.R4);
      if (R4) {
        const R4Serialized = R4.to_coll_coll_byte();
        const [assetId, amount] =
          box.assets && box.assets.length >= 1
            ? [box.assets[0].tokenId, box.assets[0].amount]
            : [ERGO_NATIVE_TOKEN, box.value];
        if (R4Serialized.length >= 5) {
          return {
            toChain: Buffer.from(R4Serialized[0]).toString(),
            toAddress: Buffer.from(R4Serialized[1]).toString(),
            networkFee: Buffer.from(R4Serialized[2]).toString(),
            bridgeFee: Buffer.from(R4Serialized[3]).toString(),
            fromAddress: Buffer.from(R4Serialized[4]).toString(),
            tokenId: assetId,
            amount: amount,
          };
        }
      }
    }
  } catch (e) {
    if (logger) {
      logger.debug(
        `An error occurred while getting Ergo rosen data from Explorer: ${e}`
      );
      const err = e as { stack?: string | undefined };
      if (err.stack) {
        logger.debug(err.stack);
      }
    }
    return undefined;
  }
  return undefined;
};

export { getNodeRosenData };
