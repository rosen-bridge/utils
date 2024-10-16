import {
  parseRosenData,
  addressToOutputScript,
} from '../../../lib/getRosenData/doge/utils';
import * as testData from './testData';

describe('Dogecoin Utils', () => {
  describe('parseRosenData', () => {
    /**
     * @target parseRosenData should extract rosen data successfully
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
     * @target parseRosenData should throw error
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
      }).toThrow('script does not start with OP_RETURN opcode (6a)');
    });

    /**
     * @target parseRosenData should throw error
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
      }).toThrow(/invalid toChain code/);
    });
  });

  describe('addressToOutputScript', () => {
    /**
     * @target addressToOutputScript should convert a Dogecoin address to its corresponding output script
     * @dependencies
     * @scenario
     * - provide a valid Dogecoin address
     * - run test
     * - check returned value
     * @expected
     * - it should return the correct output script
     */
    it('should convert a Dogecoin address to its corresponding output script', () => {
      const address = testData.validDogeAddress;
      const result = addressToOutputScript(address);

      expect(result).toBe(testData.validDogeOutputScript);
    });

    /**
     * @target addressToOutputScript should throw an error for an invalid Dogecoin address
     * @dependencies
     * @scenario
     * - provide an invalid Dogecoin address
     * - run test & check thrown exception
     * @expected
     * - it should throw an error
     */
    it('should throw an error for an invalid Dogecoin address', () => {
      const invalidAddress = 'invalidDogeAddress';

      expect(() => {
        addressToOutputScript(invalidAddress);
      }).toThrow();
    });
  });
});
