import { isArray, isString, isPlainObject } from 'lodash-es';
import cbor from 'cbor';

/**
 * Parse and validate Rosen data encoded in transaction metadata
 * @param data
 * @returns Rosen data or undefined if metadata is invalid
 */
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

/**
 * @param data
 * @returns cbor base64 string
 */
export const convertToCborBase64 = (data: string | Object | undefined) => {
  return cbor
    .encodeCanonical(
      // reparse data to fix JsonBigint behavior
      JSON.parse(JSON.stringify(data)),
    )
    .toString('base64');
};
