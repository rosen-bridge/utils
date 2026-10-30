import { rule } from '../rulesTestUtils';

describe('EqItemsRule', () => {
  describe('compare', () => {
    /**
     * @target EqItemsRule.compare should check that an array has exactly the
     * count
     * @dependencies
     * @scenario
     * - validate arrays of 0, 2 and 3 items against `eqItems` 2
     * @expected
     * - only the arrays with exactly 2 items pass
     */
    it('should check that an array has exactly the count', () => {
      const count = rule({ kind: 'eqItems', count: 2 }, 'array');
      for (const [size, passes] of [
        [0, false],
        [2, true],
        [3, false],
      ] as [number, boolean][])
        expect(count.validate(new Array(size).fill(0)) === undefined).toEqual(
          passes,
        );
    });
  });
});
