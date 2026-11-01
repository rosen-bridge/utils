import { ArrayElement } from '../../../lib/elements/types/arrayElement';
import { parseType } from '../../testUtils';
import { code, environment, errors, read, type } from './typesTestUtils';

describe('ArrayElement', () => {
  describe('parseExtra', () => {
    /**
     * @target ArrayElement.parseExtra should require an items type
     * @dependencies
     * @scenario
     * - parse an array without items, then with a default that fails them
     * @expected
     * - a problem at the type, then at the default item
     */
    it('should require an items type', () => {
      expect(errors(parseType({ type: 'array' }))[0].path).toEqual('schema');
      expect(
        errors(
          parseType({
            type: 'array',
            items: { type: 'number' },
            default: [1, 'x'],
          }),
        ).map(({ path }) => path),
      ).toEqual(['schema.default.1']);
    });
  });

  describe('transform', () => {
    /**
     * @target ArrayElement.transform should read every item
     * @dependencies
     * - NumberElement
     * @scenario
     * - read `["1", 2]`, then a value that is not an array, then a bad item
     * @expected
     * - the numbers, then a problem at the value and at the item
     */
    it('should read every item', () => {
      const element = type({ type: 'array', items: { type: 'number' } });
      expect(read(element, ['1', 2])).toEqual({ ok: true, value: [1, 2] });
      expect(errors(read(element, 'x')).map(({ path }) => path)).toEqual([
        'value',
      ]);
      expect(errors(read(element, [1, 'x'])).map(({ path }) => path)).toEqual([
        'value.1',
      ]);
    });
  });

  describe('defaultValue', () => {
    /**
     * @target ArrayElement.defaultValue should give the converted default
     * @dependencies
     * @scenario
     * - read the default of an array with `default: ["1"]`, and its missing
     *   value
     * @expected
     * - `[1]` both times
     */
    it('should give the converted default', () => {
      const element = type({
        type: 'array',
        items: { type: 'number' },
        default: ['1'],
      });
      expect(element.defaultValue()).toEqual([1]);
      expect(read(element, undefined)).toEqual({ ok: true, value: [1] });
    });
  });

  describe('resolveExtra', () => {
    /**
     * @target ArrayElement.resolveExtra should resolve the conditions of the
     * items
     * @dependencies
     * - ExistsCondition
     * @scenario
     * - resolve an array whose items have a rule reading a missing path
     * @expected
     * - a problem at the path of the item rule
     */
    it('should resolve the conditions of the items', () => {
      const element = type({
        type: 'array',
        items: {
          type: 'string',
          rules: [
            {
              kind: 'required',
              when: { kind: 'exists', operand: { path: 'nope' } },
            },
          ],
        },
      });
      const result = element.resolve(element);
      expect(!result.ok && result.errors.map(({ path }) => path)).toEqual([
        'schema.items.rules.0.when.operand.path',
      ]);
    });
  });

  describe('absent', () => {
    /**
     * @target ArrayElement.absent should give no value without a default
     * @dependencies
     * @scenario
     * - read no value with an array without a default
     * @expected
     * - undefined
     */
    it('should give no value without a default', () => {
      expect(
        read(type({ type: 'array', items: { type: 'number' } }), undefined),
      ).toEqual({ ok: true, value: undefined });
    });
  });

  describe('code', () => {
    /**
     * @target ArrayElement.code should write a readonly array of its items
     * @dependencies
     * @scenario
     * - generate an array of numbers and one of enum strings
     * @expected
     * - `readonly number[]`, and a `ReadonlyArray` of the literals
     */
    it('should write a readonly array of its items', () => {
      expect(
        code(type({ type: 'array', items: { type: 'number' } })).name,
      ).toEqual('readonly number[]');
      expect(
        code(
          type({
            type: 'array',
            items: {
              type: 'string',
              rules: [{ kind: 'enum', choices: ['a', 'b'] }],
            },
          }),
        ).name,
      ).toEqual("ReadonlyArray<'a' | 'b'>");
    });
  });

  describe('environment', () => {
    /**
     * @target ArrayElement.environment should give no variable
     * @dependencies
     * @scenario
     * - name a secret array with every value
     * @expected
     * - undefined
     */
    it('should give no variable', () => {
      const element = type({
        type: 'array',
        secret: true,
        items: { type: 'string' },
      }) as ArrayElement;
      expect(environment(element, true)).toEqual(undefined);
      expect(element.itemType.kind).toEqual('string');
    });
  });
});
