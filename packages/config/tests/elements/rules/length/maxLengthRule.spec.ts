import { rule } from '../rulesTestUtils';

describe('MaxLengthRule', () => {
  describe('compare', () => {
    /**
     * @target MaxLengthRule.compare should check that a string has at most the
     * length
     * @dependencies
     * @scenario
     * - validate strings of 0, 2 and 3 characters against `maxLength` 2
     * @expected
     * - only the strings with at most 2 characters pass
     */
    it('should check that a string has at most the length', () => {
      const length = rule({ kind: 'maxLength', length: 2 });
      for (const [value, passes] of [
        ['', true],
        ['ab', true],
        ['abc', false],
      ] as [string, boolean][])
        expect(length.validate(value) === undefined).toEqual(passes);
    });
  });
});
