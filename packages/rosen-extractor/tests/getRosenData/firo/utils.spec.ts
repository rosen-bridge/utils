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
