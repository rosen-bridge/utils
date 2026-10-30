import { rule } from '../rulesTestUtils';

describe('MinLengthRule', () => {
  describe('compare', () => {
    /**
     * @target MinLengthRule.compare should check that a string has at least the
     * length
     * @dependencies
     * @scenario
     * - validate strings of 0, 2 and 3 characters against `minLength` 2
     * @expected
     * - only the strings with at least 2 characters pass
     */
    it('should check that a string has at least the length', () => {
      const length = rule({ kind: 'minLength', length: 2 });
      for (const [value, passes] of [
        ['', false],
        ['ab', true],
        ['abc', true],
      ] as [string, boolean][])
        expect(length.validate(value) === undefined).toEqual(passes);
    });
  });
});
