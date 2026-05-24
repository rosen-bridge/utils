import { AddressManager } from '@rosen-bridge/address-manager';

import { SUPPORTED_CHAINS } from './getRosenData/const';
import { MinimalOnChainRosenData } from './types';

/**
 * extracts rosen data from raw hex data
 * @param scriptPubKeyHex
 */
export const parseRosenData = (
  scriptPubKeyHex: string,
): MinimalOnChainRosenData => {
  // parse toChain
  const toChainHex = scriptPubKeyHex.slice(0, 2);
  const toChainCode = parseInt(toChainHex, 16);
  if (toChainCode >= SUPPORTED_CHAINS.length)
    throw Error(
      `invalid toChain code, found [${toChainCode}] but only [${SUPPORTED_CHAINS.length}] chains are supported`,
    );
  const toChain = SUPPORTED_CHAINS[toChainCode];

  // parse bridgeFee
  const bridgeFeeHex = scriptPubKeyHex.slice(2, 18);
  const bridgeFee = BigInt('0x' + bridgeFeeHex).toString();

  // parse networkFee
  const networkFeeHex = scriptPubKeyHex.slice(18, 34);
  const networkFee = BigInt('0x' + networkFeeHex).toString();

  // parse toAddress
  const addressLengthCode = scriptPubKeyHex.slice(34, 36);
  const addressHexLength = parseInt(addressLengthCode, 16) * 2;
  const addressHex = scriptPubKeyHex.slice(36, 36 + addressHexLength);
  if (addressHex.length !== addressHexLength)
    throw Error(
      `invalid address length code, expected address hex string to be length of [${addressHexLength}] but found [${addressHex.length}]`,
    );
  const toAddress = AddressManager.getInstance().decodeAddress(
    toChain,
    addressHex,
  );

  return {
    toChain,
    toAddress,
    bridgeFee,
    networkFee,
  };
};
