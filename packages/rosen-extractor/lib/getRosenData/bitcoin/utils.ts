import { decodeAddress, validateAddress } from '@rosen-bridge/address-codec';
import { SUPPORTED_CHAINS } from '../const';
import { OpReturnData } from './types';

/**
 * extracts rosen data from OP_RETURN box script pub key
 * @param scriptPubKeyHex
 */
export const parseRosenData = (scriptPubKeyHex: string): OpReturnData => {
  // check OP_RETURN opcode
  if (scriptPubKeyHex.slice(0, 2) !== '6a')
    throw Error(`script does not start with OP_RETURN opcode (6a)`);
  // check script length (should not use more than one OP_RETURN)
  const dataLength = scriptPubKeyHex.slice(2, 4);
  if (parseInt(dataLength, 16) + 2 !== scriptPubKeyHex.length / 2)
    throw Error(
      `script length is unexpected [${parseInt(dataLength, 16) + 3} !== ${
        scriptPubKeyHex.length / 2
      }]`
    );

  // parse toChain
  const toChainHex = scriptPubKeyHex.slice(4, 6);
  const toChainCode = parseInt(toChainHex, 16);
  if (toChainCode >= SUPPORTED_CHAINS.length)
    throw Error(
      `invalid toChain code, found [${toChainCode}] but only [${SUPPORTED_CHAINS.length}] chains are supported`
    );
  const toChain = SUPPORTED_CHAINS[toChainCode];

  // parse bridgeFee
  const bridgeFeeHex = scriptPubKeyHex.slice(6, 22);
  const bridgeFee = BigInt('0x' + bridgeFeeHex).toString();

  // parse networkFee
  const networkFeeHex = scriptPubKeyHex.slice(22, 38);
  const networkFee = BigInt('0x' + networkFeeHex).toString();

  // parse toAddress
  const addressLengthCode = scriptPubKeyHex.slice(38, 40);
  const addressHex = scriptPubKeyHex.slice(
    40,
    40 + parseInt(addressLengthCode, 16) * 2
  );
  const toAddress = decodeAddress(toChain, addressHex);
  validateAddress(toChain, toAddress);

  return {
    toChain,
    toAddress,
    bridgeFee,
    networkFee,
  };
};
