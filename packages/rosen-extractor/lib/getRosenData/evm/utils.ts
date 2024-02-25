import { SUPPORTED_CHAINS } from './../const';
import { decodeAddress } from '@rosen-bridge/address-codec';

interface CallDataRosenData {
  toChain: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
}

/**
 * extracts rosen data from transaction's remaining call data
 * @param scriptPubKeyHex
 */
export const parseRosenData = (callData: string): CallDataRosenData => {
  const toChainHex = callData.slice(0, 2);
  const toChainCode = parseInt(toChainHex, 16);
  if (toChainCode >= SUPPORTED_CHAINS.length) {
    throw Error(
      `invalid toChain code, found [${toChainCode}] but only [${SUPPORTED_CHAINS.length}] chains are supported`
    );
  }
  const toChain = SUPPORTED_CHAINS[toChainCode];
  // parse bridgeFee
  const bridgeFeeHex = callData.slice(2, 18);
  const bridgeFee = BigInt('0x' + bridgeFeeHex).toString();

  // parse networkFee
  const networkFeeHex = callData.slice(18, 34);
  const networkFee = BigInt('0x' + networkFeeHex).toString();

  // parse toAddress
  const addressLengthCode = callData.slice(34, 36);
  const addressHex = callData.slice(
    36,
    36 + parseInt(addressLengthCode, 16) * 2
  );
  const toAddress = decodeAddress(toChain, addressHex);

  return {
    toChain,
    toAddress,
    bridgeFee,
    networkFee,
  };
};
