import { rule } from '../rulesTestUtils';

describe('MinRule', () => {
  describe('compare', () => {
    /**
     * @target MinRule.compare should check that a number is at least the bound
     * @dependencies
     * @scenario
     * - validate 0, 1 and 2 against `min` 1
     * @expected
     * - only the numbers that are not at least 1 fail
     */
    it('should check that a number is at least the bound', () => {
      const bound = rule({ kind: 'min', bound: 1 }, 'number');
      for (const [value, expected] of [
        [0, 'must be at least 1'],
        [1, undefined],
        [2, undefined],
      ] as [number, string | undefined][])
        expect(bound.validate(value)).toEqual(expected);
    });
  });
});
