import { parseRosenData } from '../../utils';
import { address } from 'bitcoinjs-lib';
import { MinimalOnChainRosenData } from '../../types';

const firoNetwork = {
  // Firo network parameters
  messagePrefix: '\x19Firo Signed Message:\n',
  bech32: 'firo',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x52, // Firo mainnet uses 0x52 (a addresses), testnet uses 0x41 (T addresses)
  scriptHash: 0x07,
  wif: 0xd2,
};

/**
 * Converts a Firocoin address to its corresponding output script
 * @param addr The Firocoin address to convert
 * @returns The output script as a hex string
 */
export const addressToOutputScript = (addr: string): string => {
  try {
    return address.toOutputScript(addr, firoNetwork).toString('hex');
  } catch (e) {
    throw new Error(
      `Failed to convert Firo address to output script: ${e}. Only transparent addresses (P2PKH, P2SH) are supported. Privacy addresses (RAP, Spark, Lelantus) are not supported.`,
    );
  }
};

/**
 * extracts rosen data from OP_RETURN box script pub key
 * @param scriptPubKeyHex
 */
export const parseOpReturn = (
  scriptPubKeyHex: string,
): MinimalOnChainRosenData => {
  // check OP_RETURN opcode
  if (scriptPubKeyHex.slice(0, 2) !== '6a')
    throw Error(`script does not start with OP_RETURN opcode (6a)`);

  // check script length (should not use more than one OP_RETURN)
  const dataLength = scriptPubKeyHex.slice(2, 4);
  if (parseInt(dataLength, 16) + 2 !== scriptPubKeyHex.length / 2)
    throw Error(
      `script length is unexpected [${parseInt(dataLength, 16) + 3} !== ${
        scriptPubKeyHex.length / 2
      }]`,
    );

  const remainingData = scriptPubKeyHex.slice(4);

  return parseRosenData(remainingData);
};
