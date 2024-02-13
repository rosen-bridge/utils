import { decodeAddress } from '@rosen-bridge/address-codec';
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
  // check OP_PUSHDATA1 opcode
  if (scriptPubKeyHex.slice(2, 4) !== '4c')
    throw Error(`script 2nd opcode is not OP_PUSHDATA1 (4c)`);
  // check script length (should not use more than one OP_RETURN)
  const dataLength = scriptPubKeyHex.slice(4, 6);
  if (parseInt(dataLength, 16) + 3 !== scriptPubKeyHex.length / 2)
    throw Error(
      `script length is unexpected [${parseInt(dataLength, 16) + 3} !== ${
        scriptPubKeyHex.length / 2
      }]`
    );

  // parse toChain
  const toChainHex = scriptPubKeyHex.slice(6, 8);
  const toChainCode = parseInt(toChainHex, 16);
  if (toChainCode >= SUPPORTED_CHAINS.length)
    throw Error(
      `invalid toChain code, found [${toChainCode}] but only [${SUPPORTED_CHAINS.length}] chains are supported`
    );
  const toChain = SUPPORTED_CHAINS[toChainCode];

  // parse bridgeFee
  const bridgeFeeHex = scriptPubKeyHex.slice(8, 24);
  const bridgeFee = BigInt('0x' + bridgeFeeHex).toString();

  // parse networkFee
  const networkFeeHex = scriptPubKeyHex.slice(24, 40);
  const networkFee = BigInt('0x' + networkFeeHex).toString();

  // parse toAddress
  const addressLengthCode = scriptPubKeyHex.slice(40, 42);
  const addressHex = scriptPubKeyHex.slice(
    42,
    42 + parseInt(addressLengthCode, 16) * 2
  );
  const toAddress = decodeAddress(toChain, addressHex);

  return {
    toChain,
    toAddress,
    bridgeFee,
    networkFee,
  };
};
