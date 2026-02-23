import { MinimalOnChainRosenData } from '../../types';
import { parseRosenData } from '../../utils';

/**
 * extracts rosen data from transaction's remaining call data
 * @param callData
 */
export const parseCallData = (callData: string): MinimalOnChainRosenData => {
  return parseRosenData(callData);
};
