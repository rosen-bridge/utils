import {
  CardanoRosenData,
  JsonObject,
  MetadataObject,
  CardanoMetadataRosenData,
} from './types';
import AbstractLogger from '../../logger/AbstractLogger';
import { AuxiliaryData } from '@cardano-ogmios/schema';
import { isArray, isPlainObject, isString } from 'lodash-es';
import Utils from '../Utils';

/**
 * checks metadata object value types for required keys
 * @param metadataObject
 */
const isCardanoRosenData = (
  metadataObject: MetadataObject
): metadataObject is JsonObject => {
  if (!isPlainObject(metadataObject)) return false;

  const assertedMetadataObject =
    metadataObject as Partial<CardanoMetadataRosenData>;

  const isToChainValid = isString(assertedMetadataObject.to);
  const isNetworkFeeValid = isString(assertedMetadataObject.networkFee);
  const isBridgeFeeValid = isString(assertedMetadataObject.bridgeFee);
  const isToAddressValid = isString(assertedMetadataObject.toAddress);
  const isFromAddressValid =
    isArray(assertedMetadataObject.fromAddress) &&
    assertedMetadataObject.fromAddress.every(isString);

  return (
    isToChainValid &&
    isNetworkFeeValid &&
    isBridgeFeeValid &&
    isToAddressValid &&
    isFromAddressValid
  );
};

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

      if (isCardanoRosenData(value)) {
        const rawRosenData = value as unknown as CardanoMetadataRosenData;
        return {
          toChain: rawRosenData.to,
          bridgeFee: rawRosenData.bridgeFee,
          networkFee: rawRosenData.networkFee,
          toAddress: rawRosenData.toAddress,
          fromAddress: rawRosenData.fromAddress.join(''),
        };
      }
    }
  } catch (e) {
    if (logger) {
      logger.debug(
        `An error occurred while getting Cardano rosen data from Ogmios: ${e}`
      );
      const err = e as { stack?: string | undefined };
      if (err.stack) {
        logger.debug(err.stack);
      }
    }
  }
  return undefined;
};

export { getOgmiosRosenData };
