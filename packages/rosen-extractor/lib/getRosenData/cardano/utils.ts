import { isArray, isString, isPlainObject } from 'lodash-es';

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
