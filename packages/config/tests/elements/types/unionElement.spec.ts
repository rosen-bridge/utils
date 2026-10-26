import { UnionElement } from '../../../lib/elements/types/unionElement';
import { createReading } from '../../../lib/parsing/reading';
import { parseType, unwrap } from '../../testUtils';
import { conditionRoot } from '../conditions/conditionsTestUtils';
import {
  code,
  environment,
  errorPaths,
  errors,
  read,
  type,
} from './typesTestUtils';

const store = {
  type: 'union',
  options: [
    {
      option: {
        type: 'object',
        properties: {
          kind: { type: 'literal', value: 'pg' },
          host: { type: 'string' },
        },
      },
      when: { kind: 'eq', left: { path: 'mode' }, right: { value: 'prod' } },
    },
    {
      option: {
        type: 'object',
        properties: {
          kind: { type: 'literal', value: 'sqlite' },
          file: { type: 'string', secret: true },
        },
      },
    },
  ],
};

describe('UnionElement', () => {
  describe('parseExtra', () => {
    /**
     * @target UnionElement.parseExtra should require at least two options
     * @dependencies
     * @scenario
     * - parse a union without options, with one option and with an option
     *   that is not an object
     * @expected
     * - problems at the type, `options` and the option
     */
    it('should require at least two options', () => {
      expect(errorPaths(parseType({ type: 'union' }))).toEqual(['schema']);
      expect(
        errorPaths(
          parseType({
            type: 'union',
            options: [{ option: { type: 'string' } }],
          }),
        ),
      ).toEqual(['schema.options']);
      expect(
        errorPaths(
          parseType({
            type: 'union',
            options: [{ option: { type: 'string' } }, 5],
          }),
        ),
      ).toEqual(['schema.options.1']);
    });
  });

  describe('transform', () => {
    /**
     * @target UnionElement.transform should read a value with the first
     * option that applies and reads it
     * @dependencies
     * - UnionOptionElement, EqCondition
     * @scenario
     * - read a `pg` value in `prod` mode and in another mode
     * @expected
     * - the value, then `must match one of the options`
     */
    it('should read a value with the first option that applies and reads it', () => {
      const element = type(store);
      unwrap(element.resolve(conditionRoot));
      const value = { kind: 'pg', host: 'h' };
      expect(
        element.normalize(value, 'store', createReading('', { mode: 'prod' })),
      ).toEqual({ ok: true, value });
      expect(
        errors(
          element.normalize(value, 'store', createReading('', { mode: 'dev' })),
        ),
      ).toEqual([{ path: 'store', message: 'must match one of the options' }]);
    });

    /**
     * @target UnionElement.transform should fail when no option applies
     * @dependencies
     * - EqCondition
     * @scenario
     * - read a value with a union whose only option does not apply
     * @expected
     * - `no option applies`
     */
    it('should fail when no option applies', () => {
      const element = type({
        type: 'union',
        options: [store.options[0], store.options[0]],
      });
      unwrap(element.resolve(conditionRoot));
      expect(
        errors(
          element.normalize({}, 'store', createReading('', { mode: 'x' })),
        ),
      ).toEqual([{ path: 'store', message: 'no option applies' }]);
    });
  });

  describe('defaultValue', () => {
    /**
     * @target UnionElement.defaultValue should give the default read by an
     * option
     * @dependencies
     * @scenario
     * - read the default of the store with a sqlite default, and without
     * @expected
     * - the default, then undefined
     */
    it('should give the default read by an option', () => {
      const value = { kind: 'sqlite', file: 'a.db' };
      expect(type({ ...store, default: value }).defaultValue()).toEqual(value);
      expect(type(store).defaultValue()).toEqual(undefined);
      expect(read(type(store), undefined)).toEqual({
        ok: true,
        value: undefined,
      });
    });
  });

  describe('environment', () => {
    /**
     * @target UnionElement.environment should merge the variables of the
     * options
     * @dependencies
     * @scenario
     * - name the store's variables
     * @expected
     * - the secret file of the sqlite option
     */
    it('should merge the variables of the options', () => {
      expect(environment(type(store))).toEqual({ file: 'APP_FILE' });
    });
  });

  describe('code', () => {
    /**
     * @target UnionElement.code should declare the union of its options
     * @dependencies
     * @scenario
     * - generate the store
     * @expected
     * - a `Config` type of the two option interfaces
     */
    it('should declare the union of its options', () => {
      const result = code(type(store));
      expect(result.name).toEqual('Config');
      expect(result.codes.at(-1)).toEqual(
        'export type Config = ConfigOption1 | ConfigOption2;',
      );
      expect((type(store) as UnionElement).optionTypes.length).toEqual(2);
    });
  });
});
