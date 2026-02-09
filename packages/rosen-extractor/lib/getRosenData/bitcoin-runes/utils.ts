import { MinimalOnChainRosenData } from '../../types';
import { parseRosenData } from '../../utils';

/**
 * extracts rosen data from raw hex data
 * @param scriptPubKeyHex
 */
export const parseAggregatedData = (
  scriptPubKeyHex: string,
): MinimalOnChainRosenData => {
  return parseRosenData(scriptPubKeyHex);
};
