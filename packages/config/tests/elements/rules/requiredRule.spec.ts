import { rule } from './rulesTestUtils';

describe('RequiredRule', () => {
  describe('targets', () => {
    /**
     * @target RequiredRule.targets should list every type kind
     * @dependencies
     * - the type classes
     * @scenario
     * - read the targets of a `required` rule
     * @expected
     * - every built-in type kind
     */
    it('should list every type kind', () => {
      expect([...rule({ kind: 'required' }).targets].sort()).toEqual([
        'array',
        'bigint',
        'boolean',
        'literal',
        'number',
        'object',
        'ref',
        'string',
        'union',
      ]);
    });
  });

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

  describe('requires', () => {
    /**
     * @target RequiredRule.requires should hold unless it has a `when`
     * @dependencies
     * - ExistsCondition
     * @scenario
     * - check a plain and a conditional `required`
     * @expected
     * - true, then false
     */
    it('should hold unless it has a `when`', () => {
      expect(rule({ kind: 'required' }).requires()).toEqual(true);
      expect(
        rule({
          kind: 'required',
          when: { kind: 'exists', operand: { path: 'x' } },
        }).requires(),
      ).toEqual(false);
    });
  });
});
