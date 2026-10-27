import { rule } from '../rulesTestUtils';

describe('EqRule', () => {
  describe('compare', () => {
    /**
     * @target EqRule.compare should check that a number is equal to the bound
     * @dependencies
     * @scenario
     * - validate 0, 1 and 2 against `eq` 1
     * @expected
     * - only the numbers that are not equal to 1 fail
     */
    it('should check that a number is equal to the bound', () => {
      const bound = rule({ kind: 'eq', bound: 1 }, 'number');
      for (const [value, expected] of [
        [0, 'must be equal to 1'],
        [1, undefined],
        [2, 'must be equal to 1'],
      ] as [number, string | undefined][])
        expect(bound.validate(value)).toEqual(expected);
    });
  });
});
