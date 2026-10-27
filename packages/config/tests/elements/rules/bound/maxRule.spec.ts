import { rule } from '../rulesTestUtils';

describe('MaxRule', () => {
  describe('compare', () => {
    /**
     * @target MaxRule.compare should check that a number is at most the bound
     * @dependencies
     * @scenario
     * - validate 0, 1 and 2 against `max` 1
     * @expected
     * - only the numbers that are not at most 1 fail
     */
    it('should check that a number is at most the bound', () => {
      const bound = rule({ kind: 'max', bound: 1 }, 'number');
      for (const [value, expected] of [
        [0, undefined],
        [1, undefined],
        [2, 'must be at most 1'],
      ] as [number, string | undefined][])
        expect(bound.validate(value)).toEqual(expected);
    });
  });
});
