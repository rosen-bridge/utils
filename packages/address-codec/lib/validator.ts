import { decodeAddress } from './decoder';

/**
 * validates address of a chain
 * @param chain
 * @param encodedAddress
 */
export const validateAddress = (
  chain: string,
  encodedAddress: string
): boolean => {
  try {
    decodeAddress(chain, encodedAddress);
    return true;
  } catch {
    return false;
  }
};
