import {
  envName,
  expectedKinds,
  formatValue,
  indent,
  propertyKey,
  quote,
  typeName,
} from '../../lib/utils/format';

describe('format', () => {
  describe('formatValue', () => {
    /**
     * @target formatValue should show strings as JSON and other scalars as
     * written
     * @dependencies
     * @scenario
     * - format a string, a number, a bigint, a boolean and null
     * @expected
     * - the string quoted, the others as written
     */
    it('should show strings as JSON and other scalars as written', () => {
      expect(['a', 1.5, 10n, true, null].map(formatValue)).toEqual([
        '"a"',
        '1.5',
        '10',
        'true',
        'null',
      ]);
    });
  });

  describe('expectedKinds', () => {
    /**
     * @target expectedKinds should list the kinds, or nothing without any
     * @dependencies
     * @scenario
     * - list two kinds, then none
     * @expected
     * - `; expected one of a, b`, then an empty string
     */
    it('should list the kinds, or nothing without any', () => {
      expect(expectedKinds(['a', 'b'])).toEqual('; expected one of a, b');
      expect(expectedKinds([])).toEqual('');
    });
  });

  describe('quote', () => {
    /**
     * @target quote should write a single-quoted TypeScript string
     * @dependencies
     * @scenario
     * - quote strings with a single quote, a double quote and a line break
     * @expected
     * - single quotes escaped, double quotes kept, the break escaped
     */
    it('should write a single-quoted TypeScript string', () => {
      expect(quote("it's")).toEqual("'it\\'s'");
      expect(quote('a"b')).toEqual("'a\"b'");
      expect(quote('a\nb')).toEqual("'a\\nb'");
    });
  });

  describe('propertyKey', () => {
    /**
     * @target propertyKey should quote names that are not identifiers
     * @dependencies
     * @scenario
     * - write `port` and `x-api-key`
     * @expected
     * - `port` as it is, `x-api-key` quoted
     */
    it('should quote names that are not identifiers', () => {
      expect(propertyKey('port')).toEqual('port');
      expect(propertyKey('x-api-key')).toEqual("'x-api-key'");
    });
  });

  describe('typeName', () => {
    /**
     * @target typeName should capitalize and join the words of a name
     * @dependencies
     * @scenario
     * - convert `httpUrl`, `my-db` and `1st`
     * @expected
     * - `HttpUrl`, `MyDb` and `T1st`
     */
    it('should capitalize and join the words of a name', () => {
      expect(['httpUrl', 'my-db', '1st'].map(typeName)).toEqual([
        'HttpUrl',
        'MyDb',
        'T1st',
      ]);
    });
  });

  describe('indent', () => {
    /**
     * @target indent should indent every line after the first
     * @dependencies
     * @scenario
     * - indent a two-line text
     * @expected
     * - the second line indented by two spaces
     */
    it('should indent every line after the first', () => {
      expect(indent('a\nb')).toEqual('a\n  b');
    });
  });

  describe('envName', () => {
    /**
     * @target envName should write a name in UPPER_SNAKE_CASE
     * @dependencies
     * @scenario
     * - convert camelCase, an acronym, kebab-case and a name of symbols
     * @expected
     * - the words split and upper-cased; `''` without letters or digits
     */
    it('should write a name in UPPER_SNAKE_CASE', () => {
      expect(['apiToken', 'HTTPPort', 'new-ui', '--'].map(envName)).toEqual([
        'API_TOKEN',
        'HTTP_PORT',
        'NEW_UI',
        '',
      ]);
    });
  });
});
