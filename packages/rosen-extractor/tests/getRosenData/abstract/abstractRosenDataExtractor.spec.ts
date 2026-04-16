import { AddressManager } from '@rosen-bridge/address-manager';
import { TokenMap } from '@rosen-bridge/tokens';

import TestUtils from '../testUtils';
import { TestRosenDataExtractor } from './testRosenDataExtractor';

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
     * - initialize RosenExtractor with Ergo chain
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
   * - initialize AddressManager with no validator
   * - run test
   * - check returned value
   * @expected
   * - to return undefined
   */
  it('should return undefined when validateAddress throws error', () => {
    AddressManager.init({}, {});
    const extractor = new TestRosenDataExtractor('', tokenMap);
    const result = extractor.get('');

    expect(result).toBeUndefined();
  });
});
