import { isArray, isString, isPlainObject } from 'lodash-es';

/**
 * Parse and validate Rosen data encoded in transaction metadata
 * @param data
 * @returns Rosen data or undefined if metadata is invalid
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseRosenData = (data: any) => {
  if (
    data &&
    isPlainObject(data) &&
    isString(data.to) &&
    isString(data.networkFee) &&
    isString(data.bridgeFee) &&
    isString(data.toAddress) &&
    isArray(data.fromAddress) &&
    data.fromAddress.every(isString)
  ) {
    return {
      toChain: data.to,
      toAddress: data.toAddress,
      bridgeFee: data.bridgeFee,
      networkFee: data.networkFee,
      fromAddress: data.fromAddress.join(''),
    };
  }
  return undefined;
};

/**
 * @param policyId
 * @param assetName
 * @returns the concatenation of policyId and assetName by '.' which represents the token Id in Rosen packages and services
 */
export const getCardanoTokenId = (policyId: string, assetName: string) =>
  `${policyId}.${assetName}`;
