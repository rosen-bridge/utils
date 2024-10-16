import { decodeAddress } from '@rosen-bridge/address-codec';
import { SUPPORTED_CHAINS } from '../const';
import { OpReturnData } from './types';
import { address, networks } from 'bitcoinjs-lib';

// Add the Dogecoin network parameters
const dogecoinNetwork = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'dc',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e,
};

/**
 * Converts a Dogecoin address to its corresponding output script
 * @param addr The Dogecoin address to convert
 * @returns The output script as a hex string
 */
export const addressToOutputScript = (addr: string): string => {
  return address.toOutputScript(addr, dogecoinNetwork).toString('hex');
};

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

  return {
    toChain,
    toAddress,
    bridgeFee,
    networkFee,
  };
};
