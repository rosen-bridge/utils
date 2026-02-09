import { MinimalOnChainRosenData } from '../../types';
import { parseRosenData } from '../../utils';

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
