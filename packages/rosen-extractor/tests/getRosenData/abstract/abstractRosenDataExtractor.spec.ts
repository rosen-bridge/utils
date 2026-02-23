import * as addressCodec from '@rosen-bridge/address-codec';
import { TokenMap } from '@rosen-bridge/tokens';

import TestUtils from '../testUtils';
import { TestRosenDataExtractor } from './testRosenDataExtractor';

vi.mock('@rosen-bridge/address-codec', async () => {
  const actual = await vi.importActual('@rosen-bridge/address-codec');
  return {
    ...actual,
  };
});
describe('AbstractRosenDataExtractor', () => {
  const tokenMap = new TokenMap();

  beforeAll(async () => {
    await tokenMap.updateConfigByJson(TestUtils.multiDecimals);
  });

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
      const extractor = new TestRosenDataExtractor('', tokenMap);
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
    vi.spyOn(addressCodec, 'validateAddress').mockImplementation(() => {
      throw addressCodec.UnsupportedAddressError;
    });
    const extractor = new TestRosenDataExtractor('', tokenMap);
    const result = extractor.get('');

    expect(result).toBeUndefined();
  });
});
