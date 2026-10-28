import { parseType } from '../../testUtils';
import { errorPaths, read, type } from './typesTestUtils';

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
});
