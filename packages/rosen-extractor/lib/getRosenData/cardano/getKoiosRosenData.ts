import { CardanoRosenData, MetaData } from './types';
import AbstractLogger from '../../logger/AbstractLogger';

/**
 * returns rosenData object if the box format is like rosen bridge observations otherwise returns undefined
 * @param metaData the transaction metadata (Koios format)
 * @param logger logger object
 */
const getKoiosRosenData = (
  metaData: MetaData,
  logger?: AbstractLogger
): CardanoRosenData | undefined => {
  // Rosen data type exists with the '0' key on the cardano tx metadata
  if (metaData && Object.prototype.hasOwnProperty.call(metaData, '0')) {
    try {
      const data = metaData['0'];
      if (
        'to' in data &&
        'bridgeFee' in data &&
        'networkFee' in data &&
        'toAddress' in data &&
        'fromAddress' in data
      ) {
        const rosenData = data as unknown as {
          to: string;
          bridgeFee: string;
          networkFee: string;
          toAddress: string;
          fromAddress: Array<string>;
        };
        return {
          toChain: rosenData.to,
          bridgeFee: rosenData.bridgeFee,
          networkFee: rosenData.networkFee,
          toAddress: rosenData.toAddress,
          fromAddress: rosenData.fromAddress.join(''),
        };
      }
      return undefined;
    } catch (e) {
      if (logger)
        logger.debug(
          `An error occurred while getting Cardano rosen data from Koios: ${e}`
        );
      return undefined;
    }
  }
  return undefined;
};

export { getKoiosRosenData };
