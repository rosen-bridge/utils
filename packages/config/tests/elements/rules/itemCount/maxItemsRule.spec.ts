import { rule } from '../rulesTestUtils';

describe('MaxItemsRule', () => {
  describe('compare', () => {
    /**
     * @target MaxItemsRule.compare should check that an array has at most the
     * count
     * @dependencies
     * @scenario
     * - validate arrays of 0, 2 and 3 items against `maxItems` 2
     * @expected
     * - only the arrays with at most 2 items pass
     */
    it('should check that an array has at most the count', () => {
      const count = rule({ kind: 'maxItems', count: 2 }, 'array');
      for (const [size, passes] of [
        [0, true],
        [2, true],
        [3, false],
      ] as [number, boolean][])
        expect(count.validate(new Array(size).fill(0)) === undefined).toEqual(
          passes,
        );
    });
  });
});
