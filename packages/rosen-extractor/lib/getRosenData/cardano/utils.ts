import { isArray, isString, isPlainObject } from 'lodash-es';
import { decodeAddress } from '@rosen-bridge/address-codec';

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
    const toAddress = decodeAddress(data.to, data.toAddress);
    return {
      toChain: data.to,
      toAddress: toAddress,
      bridgeFee: data.bridgeFee,
      networkFee: data.networkFee,
      fromAddress: data.fromAddress.join(''),
    };
  }
  return undefined;
};
