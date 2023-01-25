import { CardanoRosenData, JsonObject, ListObject } from './types';
import AbstractLogger from '../../logger/AbstractLogger';
import { AuxiliaryData } from '@cardano-ogmios/schema';
import Utils from '../Utils';

/**
 * returns rosenData object if the box format is like rosen bridge observations otherwise returns undefined
 * @param metaData the transaction metadata (Ogmios format)
 * @param logger logger object
 */
const getOgmiosRosenData = (
  metaData: AuxiliaryData,
  logger?: AbstractLogger
): CardanoRosenData | undefined => {
  try {
    const blob = metaData.body.blob;
    if (blob && blob['0']) {
      const value = Utils.getDictValue(blob['0']);
      if (value && typeof value === 'object') {
        const jsonObject = value as JsonObject;
        const toChain = Utils.getObjectKeyAsStringOrUndefined(jsonObject, 'to');
        const bridgeFee = Utils.getObjectKeyAsStringOrUndefined(
          jsonObject,
          'bridgeFee'
        );
        const networkFee = Utils.getObjectKeyAsStringOrUndefined(
          jsonObject,
          'networkFee'
        );
        const toAddress = Utils.getObjectKeyAsStringOrUndefined(
          jsonObject,
          'toAddress'
        );
        const fromAddress = (
          (value as JsonObject).fromAddress as ListObject
        ).join('');
        if (toChain && bridgeFee && networkFee && toAddress && fromAddress) {
          return {
            toChain,
            bridgeFee,
            networkFee,
            toAddress,
            fromAddress,
          };
        }
      }
    }
  } catch (e) {
    if (logger)
      logger.debug(
        `An error occurred while getting Cardano rosen data from Koios: ${e}`
      );
  }
  return undefined;
};

export { getOgmiosRosenData };
