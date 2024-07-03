import TestUtils from '../TestUtils';
import { TestRosenDataExtractor } from './TestRosenDataExtractor';

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

      expect(result?.amount).toEqual('123');
    });
  });
});
