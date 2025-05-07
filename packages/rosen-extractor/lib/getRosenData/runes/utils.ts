import { MinimalOnChainRosenData, parseRosenData } from '../../utils';

/**
 * extracts rosen data from raw hex data
 * @param scriptPubKeyHex
 */
export const parseAggregatedData = (
  scriptPubKeyHex: string
): MinimalOnChainRosenData => {
  return parseRosenData(scriptPubKeyHex);
};
