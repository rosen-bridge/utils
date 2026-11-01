import { parseType, unwrap } from '../../testUtils';
import { conditionRoot } from '../conditions/conditionsTestUtils';
import { code, errorPaths, errors, read, type } from './typesTestUtils';

describe('TypeElement', () => {
  describe('parseNode', () => {
    /**
     * @target TypeElement.parseNode should check the members every type has
     * @dependencies
     * - StringElement
     * @scenario
     * - parse a string with a numeric label and description, a string
     *   secret, rules that are not a list and an unknown key
     * @expected
     * - a problem at each of them
     */
    it('should check the members every type has', () => {
      expect(
        errorPaths(
          parseType({
            type: 'string',
            label: 1,
            description: 2,
            secret: 'yes',
            rules: {},
            extra: true,
          }),
        ).sort(),
      ).toEqual([
        'schema.description',
        'schema.extra',
        'schema.label',
        'schema.rules',
        'schema.secret',
      ]);
    });
  });

  describe('parseDefault', () => {
    /**
     * @target TypeElement.parseDefault should check the default against the
     * rules
     * @dependencies
     * - NumberElement, MinRule
     * @scenario
     * - parse a number with `default: 0` and a `min` of 1
     * @expected
     * - a problem at `default`
     */
    it('should check the default against the rules', () => {
      expect(
        errors(
          parseType({
            type: 'number',
            default: 0,
            rules: [{ kind: 'min', bound: 1 }],
          }),
        ),
      ).toEqual([
        {
          path: 'schema.default',
          message: 'default must be at least 1, got 0',
        },
      ]);
    });

    /**
     * @target TypeElement.parseDefault should convert the default
     * @dependencies
     * - NumberElement
     * @scenario
     * - parse a number with `default: "2.5"`
     * @expected
     * - the default is 2.5
     */
    it('should convert the default', () => {
      expect(type({ type: 'number', default: '2.5' }).defaultValue()).toEqual(
        2.5,
      );
    });
  });

  describe('normalize', () => {
    /**
     * @target TypeElement.normalize should use the default of a missing value
     * @dependencies
     * - StringElement
     * @scenario
     * - read no value with a string with a default
     * @expected
     * - the default
     */
    it('should use the default of a missing value', () => {
      expect(read(type({ type: 'string', default: 'a' }), undefined)).toEqual({
        ok: true,
        value: 'a',
      });
    });

    /**
     * @target TypeElement.normalize should hide the value of a secret type
     * @dependencies
     * - StringElement, MinLengthRule
     * @scenario
     * - read a short value with a secret string with `minLength` 5
     * @expected
     * - a message without the value
     */
    it('should hide the value of a secret type', () => {
      expect(
        errors(
          read(
            type({
              type: 'string',
              secret: true,
              rules: [{ kind: 'minLength', length: 5 }],
            }),
            'abc',
          ),
        ),
      ).toEqual([
        { path: 'value', message: 'must have at least 5 characters' },
      ]);
    });
  });

  describe('checkRules', () => {
    /**
     * @target TypeElement.checkRules should report each failed rule and defer
     * conditional ones
     * @dependencies
     * - StringElement, MinLengthRule, PatternRule
     * @scenario
     * - read `a` with two failing rules and a failing conditional one
     * @expected
     * - two problems now, and one deferred check
     */
    it('should report each failed rule and defer conditional ones', () => {
      const element = type({
        type: 'string',
        rules: [
          { kind: 'minLength', length: 2 },
          { kind: 'pattern', pattern: '^b' },
          {
            kind: 'maxLength',
            length: 0,
            when: { kind: 'exists', operand: { path: 'mode' } },
          },
        ],
      });
      unwrap(element.resolve(conditionRoot));
      const reading = { subject: '', secret: false, deferred: [] };
      const result = element.normalize('a', 'mode', reading);
      expect(errorPaths(result)).toEqual(['mode', 'mode']);
      expect(reading.deferred.length).toEqual(1);
    });
  });

  describe('optional', () => {
    /**
     * @target TypeElement.optional should be false with a required rule or a
     * default
     * @dependencies
     * - StringElement, RequiredRule
     * @scenario
     * - check a plain string, a required one and one with a default
     * @expected
     * - only the plain string is optional
     */
    it('should be false with a required rule or a default', () => {
      expect(type({ type: 'string' }).optional()).toEqual(true);
      expect(
        type({ type: 'string', rules: [{ kind: 'required' }] }).optional(),
      ).toEqual(false);
      expect(type({ type: 'string', default: 'a' }).optional()).toEqual(false);
    });
  });

  describe('documentation', () => {
    /**
     * @target TypeElement.documentation should write the label and the
     * description as a doc comment
     * @dependencies
     * - StringElement
     * @scenario
     * - document a string with both, and one with neither
     * @expected
     * - a doc comment with both paragraphs, then nothing
     */
    it('should write the label and the description as a doc comment', () => {
      expect(
        type({
          type: 'string',
          label: 'Host',
          description: 'a */ b',
        }).documentation(),
      ).toEqual('/**\n * Host\n *\n * a *\\/ b\n */\n');
      expect(type({ type: 'string' }).documentation()).toEqual('');
    });
  });

  describe('code', () => {
    /**
     * @target TypeElement.code should narrow a scalar to its enum values
     * @dependencies
     * - StringElement, EnumRule
     * @scenario
     * - generate a string with an enum
     * @expected
     * - the union of the literals
     */
    it('should narrow a scalar to its enum values', () => {
      expect(
        code(
          type({
            type: 'string',
            rules: [{ kind: 'enum', choices: ['a', 'b'] }],
          }),
        ).name,
      ).toEqual("'a' | 'b'");
    });
  });
});
