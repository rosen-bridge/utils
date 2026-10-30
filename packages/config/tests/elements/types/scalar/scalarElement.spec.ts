import { code, environment, type } from '../typesTestUtils';

describe('ScalarElement', () => {
  describe('environment', () => {
    /**
     * @target ScalarElement.environment should name only secret values
     * unless every value gets one
     * @dependencies
     * - StringElement
     * @scenario
     * - name a plain and a secret string, then a plain one with `all`
     * @expected
     * - none, `APP`, `APP`
     */
    it('should name only secret values unless every value gets one', () => {
      expect(environment(type({ type: 'string' }))).toEqual(undefined);
      expect(environment(type({ type: 'string', secret: true }))).toEqual(
        'APP',
      );
      expect(environment(type({ type: 'string' }), true)).toEqual('APP');
    });
  });

  describe('code', () => {
    /**
     * @target ScalarElement.code should write the type, or never for enums
     * with nothing in common
     * @dependencies
     * - NumberElement, EnumRule
     * @scenario
     * - generate a number, and one with two enums that share no value
     * @expected
     * - `number`, then `never`
     */
    it('should write the type, or never for enums with nothing in common', () => {
      expect(code(type({ type: 'number' })).name).toEqual('number');
      expect(
        code(
          type({
            type: 'number',
            rules: [
              { kind: 'enum', choices: [1] },
              { kind: 'enum', choices: [2] },
            ],
          }),
        ).name,
      ).toEqual('never');
    });
  });

  describe('defaultValue', () => {
    /**
     * @target ScalarElement.defaultValue should give the converted default
     * @dependencies
     * - BigintElement
     * @scenario
     * - read the default of a bigint with `default: "10"`, and of one without
     * @expected
     * - 10n, then undefined
     */
    it('should give the converted default', () => {
      expect(type({ type: 'bigint', default: '10' }).defaultValue()).toEqual(
        10n,
      );
      expect(type({ type: 'bigint' }).defaultValue()).toEqual(undefined);
    });
  });
});
