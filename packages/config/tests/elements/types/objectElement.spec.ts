import { ObjectElement } from '../../../lib/elements/types/objectElement';
import { parseType } from '../../testUtils';
import {
  code,
  environment,
  errorPaths,
  errors,
  read,
  type,
} from './typesTestUtils';

const server = {
  type: 'object',
  description: 'The server',
  properties: {
    host: { type: 'string', rules: [{ kind: 'required' }] },
    port: { type: 'number', default: 8080 },
    key: { type: 'string', secret: true },
    'x-id': { type: 'string' },
  },
};

describe('ObjectElement', () => {
  describe('parseExtra', () => {
    /**
     * @target ObjectElement.parseExtra should require valid properties
     * @dependencies
     * @scenario
     * - parse an object without properties, with a list, with a dotted name
     *   and with `__proto__`
     * @expected
     * - problems at the type, `properties` and the two names
     */
    it('should require valid properties', () => {
      expect(errorPaths(parseType({ type: 'object' }))).toEqual(['schema']);
      expect(errorPaths(parseType({ type: 'object', properties: [] }))).toEqual(
        ['schema.properties'],
      );
      expect(
        errorPaths(
          parseType({
            type: 'object',
            properties: JSON.parse(
              '{"a.b": {"type": "string"}, "__proto__": {"type": "string"}}',
            ),
          }),
        ),
      ).toEqual(['schema.properties.a.b', 'schema.properties.__proto__']);
    });
  });

  describe('property', () => {
    /**
     * @target ObjectElement.property should give the type of a property
     * @dependencies
     * @scenario
     * - look up `port` and `missing`
     * @expected
     * - the number type, then undefined
     */
    it('should give the type of a property', () => {
      const element = type(server) as ObjectElement;
      expect(element.property('port')?.kind).toEqual('number');
      expect(element.property('missing')).toEqual(undefined);
    });
  });

  describe('transform', () => {
    /**
     * @target ObjectElement.transform should read the properties and apply
     * defaults
     * @dependencies
     * - StringElement, NumberElement
     * @scenario
     * - read `{ host: 'h', port: '80' }` and `{ host: 'h' }`
     * @expected
     * - the port converted, then the default port
     */
    it('should read the properties and apply defaults', () => {
      const element = type(server);
      expect(read(element, { host: 'h', port: '80' })).toEqual({
        ok: true,
        value: { host: 'h', port: 80 },
      });
      expect(read(element, { host: 'h' })).toEqual({
        ok: true,
        value: { host: 'h', port: 8080 },
      });
    });

    /**
     * @target ObjectElement.transform should report unknown keys and the
     * problems of the properties
     * @dependencies
     * @scenario
     * - read a value that is not an object, then one with an unknown key and
     *   no host
     * @expected
     * - a problem at the value, then at the key and at `host`
     */
    it('should report unknown keys and the problems of the properties', () => {
      const element = type(server);
      expect(errorPaths(read(element, 5))).toEqual(['value']);
      expect(errors(read(element, { hots: 'h' }))).toEqual([
        { path: 'value.hots', message: 'key is not in the schema' },
        { path: 'value.host', message: 'must be set' },
      ]);
    });
  });

  describe('absent', () => {
    /**
     * @target ObjectElement.absent should read the properties of a missing
     * object
     * @dependencies
     * @scenario
     * - read no value with the server, and with an object without defaults
     * @expected
     * - the required host is reported; the other gives no value
     */
    it('should read the properties of a missing object', () => {
      expect(errorPaths(read(type(server), undefined))).toEqual(['value.host']);
      expect(
        read(
          type({ type: 'object', properties: { a: { type: 'string' } } }),
          undefined,
        ),
      ).toEqual({ ok: true, value: undefined });
    });
  });

  describe('defaultValue', () => {
    /**
     * @target ObjectElement.defaultValue should fill the default with the
     * property defaults
     * @dependencies
     * @scenario
     * - read the default value of an object with and without a default
     * @expected
     * - the default with the property defaults, then the property defaults
     */
    it('should fill the default with the property defaults', () => {
      expect(
        type({ ...server, default: { host: 'h' } }).defaultValue(),
      ).toEqual({ host: 'h', port: 8080 });
      expect(type(server).defaultValue()).toEqual({ port: 8080 });
      expect(
        type({ type: 'object', properties: {}, default: {} }).defaultValue(),
      ).toEqual({});
    });

    /**
     * @target ObjectElement.defaultValue should check its default
     * @dependencies
     * @scenario
     * - parse the server with a default without host
     * @expected
     * - a problem at `default.host`
     */
    it('should check its default', () => {
      expect(errorPaths(parseType({ ...server, default: {} }))).toEqual([
        'schema.default.host',
      ]);
    });
  });

  describe('optional', () => {
    /**
     * @target ObjectElement.assigns should make an object with a required
     * property not optional
     * @dependencies
     * @scenario
     * - check the server and an object of optional properties
     * @expected
     * - the server is not optional; the other is
     */
    it('should make an object with a required property not optional', () => {
      expect(type(server).optional()).toEqual(false);
      expect(
        type({
          type: 'object',
          properties: { a: { type: 'string' } },
        }).optional(),
      ).toEqual(true);
    });
  });

  describe('environment', () => {
    /**
     * @target ObjectElement.environment should map the properties that get a
     * variable
     * @dependencies
     * @scenario
     * - name the server's variables, then every one
     * @expected
     * - the key only, then every property
     */
    it('should map the properties that get a variable', () => {
      expect(environment(type(server))).toEqual({ key: 'APP_KEY' });
      expect(environment(type(server), true)).toEqual({
        host: 'APP_HOST',
        port: 'APP_PORT',
        key: 'APP_KEY',
        'x-id': 'APP_X_ID',
      });
    });
  });

  describe('code', () => {
    /**
     * @target ObjectElement.code should declare an interface
     * @dependencies
     * @scenario
     * - generate the server
     * @expected
     * - a documented interface with readonly members, optional when the
     *   property is
     */
    it('should declare an interface', () => {
      expect(code(type(server))).toEqual({
        name: 'Config',
        codes: [
          "/**\n * The server\n */\nexport interface Config {\n  readonly host: string;\n  readonly port: number;\n  readonly key?: string;\n  readonly 'x-id'?: string;\n}",
        ],
      });
    });
  });
});
