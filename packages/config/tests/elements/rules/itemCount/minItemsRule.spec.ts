import { rule } from '../rulesTestUtils';

describe('MinItemsRule', () => {
  describe('compare', () => {
    /**
     * @target MinItemsRule.compare should check that an array has at least the
     * count
     * @dependencies
     * @scenario
     * - validate arrays of 0, 2 and 3 items against `minItems` 2
     * @expected
     * - only the arrays with at least 2 items pass
     */
    it('should check that an array has at least the count', () => {
      const count = rule({ kind: 'minItems', count: 2 }, 'array');
      for (const [size, passes] of [
        [0, false],
        [2, true],
        [3, true],
      ] as [number, boolean][])
        expect(count.validate(new Array(size).fill(0)) === undefined).toEqual(
          passes,
        );
    });
  });
});
