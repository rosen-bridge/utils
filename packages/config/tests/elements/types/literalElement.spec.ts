import { parseType } from '../../testUtils';
import {
  code,
  environment,
  errorPaths,
  errors,
  read,
  type,
} from './typesTestUtils';

describe('LiteralElement', () => {
  describe('parseExtra', () => {
    /**
     * @target LiteralElement.parseExtra should require a scalar value
     * @dependencies
     * @scenario
     * - parse a literal without a value, then with an object, and with a
     *   default
     * @expected
     * - problems at the type, `value` and `default`
     */
    it('should require a scalar value', () => {
      expect(errorPaths(parseType({ type: 'literal' }))).toEqual(['schema']);
      expect(errorPaths(parseType({ type: 'literal', value: {} }))).toEqual([
        'schema.value',
      ]);
      expect(
        errorPaths(parseType({ type: 'literal', value: 'a', default: 'a' })),
      ).toEqual(['schema.default']);
    });
  });

  describe('transform', () => {
    /**
     * @target LiteralElement.transform should accept the value and its string
     * form only
     * @dependencies
     * - NumberElement
     * @scenario
     * - read 8080, `"8080"` and 80 with the literal 8080
     * @expected
     * - 8080 twice, then a problem
     */
    it('should accept the value and its string form only', () => {
      const element = type({ type: 'literal', value: 8080 });
      expect(read(element, 8080)).toEqual({ ok: true, value: 8080 });
      expect(read(element, '8080')).toEqual({ ok: true, value: 8080 });
      expect(errors(read(element, 80))).toEqual([
        { path: 'value', message: 'must be 8080, got 80' },
      ]);
    });
  });

  describe('absent', () => {
    /**
     * @target LiteralElement.absent should fail for a missing value
     * @dependencies
     * @scenario
     * - read no value
     * @expected
     * - `must be set`
     */
    it('should fail for a missing value', () => {
      expect(
        errors(read(type({ type: 'literal', value: 'a' }), undefined)),
      ).toEqual([{ path: 'value', message: 'must be set' }]);
    });
  });

  describe('code', () => {
    /**
     * @target LiteralElement.code should write the value as a type
     * @dependencies
     * @scenario
     * - generate the literal `postgres`, and check it is never optional
     * @expected
     * - `'postgres'`, not optional, with no default
     */
    it('should write the value as a type', () => {
      const element = type({ type: 'literal', value: 'postgres' });
      expect(code(element).name).toEqual("'postgres'");
      expect(element.optional()).toEqual(false);
      expect(element.defaultValue()).toEqual(undefined);
    });
  });

  describe('environment', () => {
    /**
     * @target LiteralElement.environment should name secret values only
     * @dependencies
     * @scenario
     * - name a plain and a secret literal
     * @expected
     * - none, then `APP`
     */
    it('should name secret values only', () => {
      expect(environment(type({ type: 'literal', value: 1 }))).toEqual(
        undefined,
      );
      expect(
        environment(type({ type: 'literal', value: 1, secret: true })),
      ).toEqual('APP');
    });
  });
});
