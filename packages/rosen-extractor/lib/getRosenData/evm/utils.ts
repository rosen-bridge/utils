import { parseRosenData } from '../../utils';
import { MinimalOnChainRosenData } from '../../types';

/**
 * extracts rosen data from transaction's remaining call data
 * @param callData
 */
export const parseCallData = (callData: string): MinimalOnChainRosenData => {
  return parseRosenData(callData);
};
