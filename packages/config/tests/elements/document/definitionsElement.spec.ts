import { parseDocument, unwrap } from '../../testUtils';

/**
 * The problems of parsing a document with `definitions`.
 * @param definitions - the definitions node
 */
const definitionErrors = (definitions: unknown) => {
  const result = parseDocument({ definitions });
  return result.ok ? [] : result.errors;
};

describe('DefinitionsElement', () => {
  describe('parseNode', () => {
    /**
     * @target DefinitionsElement.parseNode should require objects of
     * definitions
     * @dependencies
     * - SchemaDocument
     * @scenario
     * - parse definitions whose `types` and `rules` are lists
     * @expected
     * - a problem at each
     */
    it('should require objects of definitions', () => {
      expect(
        definitionErrors({ types: [], rules: [] }).map(({ path }) => path),
      ).toEqual(['definitions.rules', 'definitions.types']);
    });

    /**
     * @target DefinitionsElement.parseNode should parse definitions in any
     * order and reject loops
     * @dependencies
     * - SchemaDocument, RefElement
     * @scenario
     * - define `a` using `b` before `b`, then `c` and `d` using each other
     * @expected
     * - only `c` and `d` are reported
     */
    it('should parse definitions in any order and reject loops', () => {
      const errors = definitionErrors({
        types: {
          a: { type: 'ref', ref: 'b' },
          b: { type: 'string' },
          c: { type: 'ref', ref: 'd' },
          d: { type: 'ref', ref: 'c' },
        },
      });
      expect(errors.map(({ path }) => path)).toEqual([
        'definitions.types.d.ref',
        'definitions.types.c.ref',
      ]);
      expect(errors[0].message).toContain('refers to itself');
    });

    /**
     * @target DefinitionsElement.parseNode should reject unsafe names
     * @dependencies
     * - SchemaDocument
     * @scenario
     * - define a type and a rule with dotted names
     * @expected
     * - a problem at each name
     */
    it('should reject unsafe names', () => {
      expect(
        definitionErrors({
          types: { 'a.b': { type: 'string' } },
          rules: { 'c.d': { type: ['string'], rules: [{ kind: 'required' }] } },
        }).map(({ path }) => path),
      ).toEqual(['definitions.rules.c.d', 'definitions.types.a.b']);
    });
  });

  describe('parseDefinedRule', () => {
    /**
     * @target DefinitionsElement.parseDefinedRule should require a list of
     * kinds
     * @dependencies
     * - SchemaDocument
     * @scenario
     * - define rules that are not objects, without `type`, and with a string
     *   `type`
     * @expected
     * - problems at the rule, the rule and `type`
     */
    it('should require a list of kinds', () => {
      expect(
        definitionErrors({
          rules: { a: 5, b: { rules: [] }, c: { type: 'string', rules: [] } },
        }).map(({ path }) => path),
      ).toEqual([
        'definitions.rules.a',
        'definitions.rules.b',
        'definitions.rules.c.type',
      ]);
    });

    /**
     * @target DefinitionsElement.parseDefinedRule should check the rule for
     * each kind once
     * @dependencies
     * - SchemaDocument, MinRule
     * @scenario
     * - define a `min` rule for numbers, bigints and strings
     * @expected
     * - one problem, for the string kind
     */
    it('should check the rule for each kind once', () => {
      const errors = definitionErrors({
        rules: {
          a: {
            type: ['number', 'bigint', 'string'],
            extra: 1,
            rules: [{ kind: 'min', bound: 1 }],
          },
        },
      });
      expect(errors.map(({ path }) => path)).toEqual([
        'definitions.rules.a.extra',
        'definitions.rules.a.rules.0.kind',
      ]);
    });
  });

  describe('getType', () => {
    /**
     * @target DefinitionsElement.getType should parse the type again at each
     * use
     * @dependencies
     * - SchemaDocument
     * @scenario
     * - get a defined type at two locations
     * @expected
     * - two types at those locations, at the definition's pointer
     */
    it('should parse the type again at each use', () => {
      const document = unwrap(
        parseDocument({ definitions: { types: { port: { type: 'number' } } } }),
      );
      const a = unwrap(document.getType('port', ['a']));
      const b = unwrap(document.getType('port', ['b']));
      expect(a).not.toBe(b);
      expect([a.location, b.location, a.pointer]).toEqual([
        ['a'],
        ['b'],
        'definitions.types.port',
      ]);
      expect(document.getType('missing', []).ok).toEqual(false);
    });
  });

  describe('getRule', () => {
    /**
     * @target DefinitionsElement.getRule should parse the rule for the kind
     * of the use
     * @dependencies
     * - SchemaDocument, MinRule
     * @scenario
     * - get a rule for numbers and bigints for a bigint, then for a string
     * @expected
     * - a rule for bigints, then a problem naming the listed kinds
     */
    it('should parse the rule for the kind of the use', () => {
      const document = unwrap(
        parseDocument({
          definitions: {
            rules: {
              positive: {
                type: ['number', 'bigint'],
                rules: [{ kind: 'min', bound: 1 }],
              },
            },
          },
        }),
      );
      const rule = unwrap(document.getRule('positive', 'bigint'));
      expect(rule.target).toEqual('bigint');
      expect(rule.validate(0n)).toEqual('must be at least 1');
      const wrong = document.getRule('positive', 'string');
      expect(!wrong.ok && wrong.errors).toEqual([
        {
          path: 'definitions.rules',
          message:
            'rule "positive" cannot be applied to a "string" type (it is defined for "number", "bigint")',
        },
      ]);
    });
  });
});
