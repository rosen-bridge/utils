import TestUtils from '../TestUtils';
import * as addressCodec from '@rosen-bridge/address-codec';
import { TestRosenDataExtractor } from './TestRosenDataExtractor';

jest.mock('@rosen-bridge/address-codec', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@rosen-bridge/address-codec'),
  };
});

describe('AbstractRosenDataExtractor', () => {
  describe('get', () => {
    /**
     * @target `AbstractRosenDataExtractor.get` should wrap amount successfully
     * @dependencies
     * @scenario
     * - run test
     * - check returned value
     * @expected
     * - amount should have less digits
     */
    it('should wrap amount successfully', () => {
      const extractor = new TestRosenDataExtractor('', TestUtils.multiDecimals);
      const result = extractor.get('');

      expect(result?.amount).toEqual('124');
    });
  });

  /**
   * @target `AbstractRosenDataExtractor.get` should wrap amount successfully
   * @dependencies
   * @scenario
   * - mock `validateAddress` to throw error
   * - run test
   * - check returned value
   * @expected
   * - to return undefined
   */
  it('should return undefined when validateAddress throws error', () => {
    jest.spyOn(addressCodec, 'validateAddress').mockImplementation(() => {
      throw addressCodec.UnsupportedAddressError;
    });
    const extractor = new TestRosenDataExtractor('', TestUtils.multiDecimals);
    const result = extractor.get('');

    expect(result).toBeUndefined();
  });
});
