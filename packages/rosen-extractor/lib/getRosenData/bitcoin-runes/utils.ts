import { parseRosenData } from '../../utils';
import { MinimalOnChainRosenData } from '../../types';

/**
 * extracts rosen data from raw hex data
 * @param scriptPubKeyHex
 */
export const parseAggregatedData = (
  scriptPubKeyHex: string,
): MinimalOnChainRosenData => {
  return parseRosenData(scriptPubKeyHex);
};
