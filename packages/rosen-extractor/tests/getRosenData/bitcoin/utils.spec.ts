import { parseRosenData } from '../../../lib/getRosenData/bitcoin/utils';
import * as testData from './testData';

describe('parseRosenData', () => {
  /**
   * @target `BitcoinEsploraRosenExtractor.parseRosenData` should extract rosen data successfully
   * @dependencies
   * @scenario
   * - mock utxo with scriptPubKey that contains valid rosen data
   * - run test
   * - check returned value
   * @expected
   * - it should return expected asset transformation
   */
  it('should extract rosen data successfully', () => {
    const script = testData.opReturnScripts.valid;
    const result = parseRosenData(script);

    expect(result).toStrictEqual(testData.opReturnData);
  });

  /**
   * @target `BitcoinEsploraRosenExtractor.parseRosenData` should throw error
   * when script does not start with OP_RETURN opcode
   * @dependencies
   * @scenario
   * - mock utxo with scriptPubKey that does not contain OP_RETURN opcode
   * - run test & check thrown exception
   * @expected
   * - it should throw error
   */
  it('should throw error when script does not start with OP_RETURN opcode', () => {
    const script = testData.opReturnScripts.noOpReturn;

    expect(() => {
      parseRosenData(script);
    }).toThrow(Error);
  });

  /**
   * @target `BitcoinEsploraRosenExtractor.parseRosenData` should throw error
   * when second opcode is not OP_PUSHDATA1 opcode
   * @dependencies
   * @scenario
   * - mock utxo with scriptPubKey that does not contain OP_PUSHDATA1 opcode
   * - run test & check thrown exception
   * @expected
   * - it should throw error
   */
  it('should throw error when second opcode is not OP_PUSHDATA1 opcode', () => {
    const script = testData.opReturnScripts.noPushData;

    expect(() => {
      parseRosenData(script);
    }).toThrow(Error);
  });

  /**
   * @target `BitcoinEsploraRosenExtractor.parseRosenData` should throw error
   * when toChain is invalid
   * @dependencies
   * @scenario
   * - mock utxo with scriptPubKey that contain rosen data with invalid toChain
   * - run test & check thrown exception
   * @expected
   * - it should throw error
   */
  it('should throw error when toChain is invalid', () => {
    const script = testData.opReturnScripts.invalidToChain;

    expect(() => {
      parseRosenData(script);
    }).toThrow(Error);
  });
});
