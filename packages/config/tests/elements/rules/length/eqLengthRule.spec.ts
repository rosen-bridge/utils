import { rule } from '../rulesTestUtils';

describe('EqLengthRule', () => {
  describe('compare', () => {
    /**
     * @target EqLengthRule.compare should check that a string has exactly the
     * length
     * @dependencies
     * @scenario
     * - validate strings of 0, 2 and 3 characters against `eqLength` 2
     * @expected
     * - only the strings with exactly 2 characters pass
     */
    it('should check that a string has exactly the length', () => {
      const length = rule({ kind: 'eqLength', length: 2 });
      for (const [value, passes] of [
        ['', false],
        ['ab', true],
        ['abc', false],
      ] as [string, boolean][])
        expect(length.validate(value) === undefined).toEqual(passes);
    });
  });
});
