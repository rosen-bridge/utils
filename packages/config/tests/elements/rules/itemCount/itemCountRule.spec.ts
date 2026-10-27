import { errorPaths, parseRule, rule } from '../rulesTestUtils';

describe('ItemCountRule', () => {
  describe('parseExtra', () => {
    /**
     * @target ItemCountRule.parseExtra should require a non-negative integer
     * count
     * @dependencies
     * - MinItemsRule
     * @scenario
     * - parse `minItems` with "1" for an array, then for a string
     * @expected
     * - a problem at `count`, then at `kind`
     */
    it('should require a non-negative integer count', () => {
      expect(
        errorPaths(parseRule({ kind: 'minItems', count: '1' }, 'array')),
      ).toEqual(['rule.count']);
      expect(errorPaths(parseRule({ kind: 'minItems', count: 1 }))).toEqual([
        'rule.kind',
      ]);
    });
  });

  describe('evaluate', () => {
    /**
     * @target ItemCountRule.evaluate should check the number of items
     * @dependencies
     * - MinItemsRule
     * @scenario
     * - validate an empty array, one with two items and no value against
     *   `minItems` 1 and 2
     * @expected
     * - the singular and plural messages; a missing value passes
     */
    it('should check the number of items', () => {
      expect(
        rule({ kind: 'minItems', count: 1 }, 'array').validate([]),
      ).toEqual('must have at least 1 item');
      const two = rule({ kind: 'minItems', count: 2 }, 'array');
      expect(two.validate([1])).toEqual('must have at least 2 items');
      expect(two.validate([1, 2])).toEqual(undefined);
      expect(two.validate(undefined)).toEqual(undefined);
    });
  });
});
