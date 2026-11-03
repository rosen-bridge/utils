import type { SchemaDocument } from '../../../lib/elements/document/schemaDocument';
import { parseDocument, unwrap } from '../../testUtils';
import { conditionRoot } from '../conditions/conditionsTestUtils';
import { errorPaths, parseRule } from './rulesTestUtils';

const document: SchemaDocument = unwrap(
  parseDocument({
    definitions: {
      rules: {
        nonEmpty: {
          type: ['string'],
          rules: [{ kind: 'minLength', length: 1 }],
        },
        level: {
          type: ['string'],
          rules: [{ kind: 'required' }, { kind: 'enum', choices: ['a', 'b'] }],
        },
      },
    },
  }),
);

/**
 * A `{ ref }` rule parsed in `document`.
 * @param node - the rule node
 * @param target - the kind of the type the rule is used on
 */
const parseRef = (node: unknown, target = 'string') =>
  parseRule(node, target, true, document);

describe('RefRule', () => {
  describe('parseExtra', () => {
    /**
     * @target RefRule.parseExtra should report problems at `ref`
     * @dependencies
     * - DefinitionsElement
     * @scenario
     * - parse a ref that is not a string, one to a missing rule and one used
     *   on a number
     * @expected
     * - a problem at `ref` each time
     */
    it('should report problems at `ref`', () => {
      for (const [node, target] of [
        [{ ref: 5 }, 'string'],
        [{ ref: 'missing' }, 'string'],
        [{ ref: 'nonEmpty' }, 'number'],
      ] as const)
        expect(errorPaths(parseRef(node, target))).toEqual(['rule.ref']);
    });
  });

  describe('evaluate', () => {
    /**
     * @target RefRule.evaluate should check a value with the defined rule
     * @dependencies
     * - DefinedRule
     * @scenario
     * - validate an empty string and `x` with `nonEmpty`
     * @expected
     * - the empty string fails, `x` passes
     */
    it('should check a value with the defined rule', () => {
      const ref = unwrap(parseRef({ ref: 'nonEmpty' }));
      expect(ref.validate('')).toEqual('must have at least 1 character');
      expect(ref.validate('x')).toEqual(undefined);
      expect(ref.targets).toEqual(['string']);
    });
  });

  describe('applies', () => {
    /**
     * @target RefRule.applies should hold when its `when` holds
     * @dependencies
     * - EqCondition
     * @scenario
     * - check a ref with a `when` on `mode`
     * @expected
     * - true for mode `strict`, false otherwise
     */
    it('should hold when its `when` holds', () => {
      const ref = unwrap(
        parseRef({
          ref: 'nonEmpty',
          when: { kind: 'eq', left: { path: 'mode' }, right: { value: 's' } },
        }),
      );
      unwrap(ref.resolve(conditionRoot, ['port']));
      expect(ref.applies({ mode: 's' }, [])).toEqual(true);
      expect(ref.applies({ mode: 't' }, [])).toEqual(false);
    });
  });

  describe('requires', () => {
    /**
     * @target RefRule.requires should follow the defined rule unless it has a
     * `when`
     * @dependencies
     * - DefinedRule
     * @scenario
     * - check `level` with and without a `when`, and `nonEmpty`
     * @expected
     * - only `level` without a `when` requires a value, and limits it
     */
    it('should follow the defined rule unless it has a `when`', () => {
      const level = unwrap(parseRef({ ref: 'level' }));
      const conditional = unwrap(
        parseRef({
          ref: 'level',
          when: { kind: 'exists', operand: { path: 'x' } },
        }),
      );
      expect(level.requires()).toEqual(true);
      expect(level.allowedValues()).toEqual(['a', 'b']);
      expect(conditional.requires()).toEqual(false);
      expect(conditional.allowedValues()).toEqual(undefined);
      expect(unwrap(parseRef({ ref: 'nonEmpty' })).requires()).toEqual(false);
    });
  });
});
