import { addressToOutputScript } from '../../../lib/getRosenData/doge/utils';
import * as testData from './testData';

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
