import { rule } from './rulesTestUtils';

describe('RequiredRule', () => {
  describe('evaluate', () => {
    /**
     * @target RequiredRule.evaluate should fail for a value that is not set
     * @dependencies
     * @scenario
     * - validate undefined and an empty string
     * @expected
     * - `must be set`, then no problem
     */
    it('should fail for a value that is not set', () => {
      const required = rule({ kind: 'required' });
      expect(required.validate(undefined)).toEqual('must be set');
      expect(required.validate('')).toEqual(undefined);
    });
  });
});
