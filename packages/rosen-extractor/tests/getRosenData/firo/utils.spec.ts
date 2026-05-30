import {
  parseOpReturn,
  addressToOutputScript,
} from '../../../lib/getRosenData/firo/utils';
import * as testData from './utilsTestData';

describe('parseOpReturn', () => {
  /**
   * @target parseOpReturn should extract rosen data successfully
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
    const result = parseOpReturn(script);

    expect(result).toStrictEqual(testData.opReturnData);
  });

  /**
   * @target parseOpReturn should extract rosen data from OP_PUSHDATA1
   * @dependencies
   * @scenario
   * - mock utxo with OP_RETURN scriptPubKey that uses OP_PUSHDATA1
   * - run test
   * - check returned value
   * @expected
   * - it should return expected asset transformation
   */
  it('should extract rosen data from OP_PUSHDATA1', () => {
    const script = testData.opReturnScripts.validPushData1;
    const result = parseOpReturn(script);

    expect(result).toStrictEqual(testData.opReturnData);
  });

  /**
   * @target parseOpReturn should extract rosen data from supported pushdata encodings
   * @dependencies
   * @scenario
   * - mock OP_RETURN scriptPubKeys using OP_PUSHDATA1, OP_PUSHDATA2 and OP_PUSHDATA4
   * - run test for each script
   * - check returned value
   * @expected
   * - it should return expected asset transformation
   */
  [
    ['OP_PUSHDATA1 length 77', testData.opReturnScripts.validPushData1Length77],
    ['OP_PUSHDATA1 length 78', testData.opReturnScripts.validPushData1Length78],
    ['OP_PUSHDATA1 length 79', testData.opReturnScripts.validPushData1Length79],
    ['OP_PUSHDATA1 length 80', testData.opReturnScripts.validPushData1Length80],
    ['OP_PUSHDATA2', testData.opReturnScripts.validPushData2],
    ['OP_PUSHDATA4', testData.opReturnScripts.validPushData4],
  ].forEach(([pushDataEncoding, script]) => {
    it(`should extract rosen data from ${pushDataEncoding}`, () => {
      const result = parseOpReturn(script);

      expect(result).toStrictEqual(testData.opReturnData);
    });
  });

  /**
   * @target parseOpReturn should reject OP_RETURN data over Rosen 80-byte limit
   * @dependencies
   * @scenario
   * - mock OP_RETURN scriptPubKey with OP_PUSHDATA1 and 81-byte payload
   * - run test & check thrown exception
   * @expected
   * - it should throw error
   */
  it('should reject OP_RETURN data over Rosen 80-byte limit', () => {
    const script = testData.opReturnScripts.tooLongPushData1;

    expect(() => {
      parseOpReturn(script);
    }).toThrow('OP_RETURN data length exceeds Rosen limit [81 > 80]');
  });

  /**
   * @target parseOpReturn should throw error
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
      parseOpReturn(script);
    }).toThrow('script does not start with OP_RETURN opcode (6a)');
  });

  /**
   * @target parseOpReturn should throw error
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
      parseOpReturn(script);
    }).toThrow(/invalid toChain code/);
  });
});

describe('addressToOutputScript', () => {
  /**
   * @target addressToOutputScript should convert a Firocoin address to its corresponding output script
   * @dependencies
   * @scenario
   * - provide a valid Firocoin address
   * - run test
   * - check returned value
   * @expected
   * - it should return the correct output script
   */
  it('should convert a Firocoin address to its corresponding output script', () => {
    const address = testData.validFiroAddress;
    const result = addressToOutputScript(address);

    expect(result).toBe(testData.validFiroOutputScript);
  });

  /**
   * @target addressToOutputScript should throw an error for an invalid Firocoin address
   * @dependencies
   * @scenario
   * - provide an invalid Firocoin address
   * - run test & check thrown exception
   * @expected
   * - it should throw an error
   */
  it('should throw an error for an invalid Firocoin address', () => {
    const invalidAddress = testData.invalidFiroAddress;

    expect(() => {
      addressToOutputScript(invalidAddress);
    }).toThrow();
  });
});
