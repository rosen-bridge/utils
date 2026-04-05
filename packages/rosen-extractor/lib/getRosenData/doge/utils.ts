import { address } from 'bitcoinjs-lib';

import { MinimalOnChainRosenData } from '../../types';
import { parseRosenData } from '../../utils';

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
