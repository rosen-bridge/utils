import { join } from 'node:path';

import { SchemaDocument } from '../../../lib/elements/document/schemaDocument';
import { parseDocument, unwrap } from '../../testUtils';
import { richSchema, serviceSchema } from './schemaDocumentTestData';

const fixtures = new URL('../../fixtures/', import.meta.url).pathname;

const service = unwrap(parseDocument(serviceSchema));
const empty = unwrap(parseDocument({}));

/**
 * The paths of the problems of parsing `node`.
 * @param node - the schema document node
 */
const documentErrors = (node: Record<string, unknown>) => {
  const result = parseDocument(node);
  return result.ok ? [] : result.errors.map(({ path }) => path);
};

describe('SchemaDocument', () => {
  describe('initialize', () => {
    /**
     * @target SchemaDocument.initialize should create an empty root document
     * @dependencies
     * @scenario
     * - initialize a document
     * @expected
     * - a document at the pointer `''`
     */
    it('should create an empty root document', () => {
      const document = SchemaDocument.initialize();
      expect([document.kind, document.pointer]).toEqual(['document', '']);
    });
  });

  describe('parseNode', () => {
    /**
     * @target SchemaDocument.parseNode should check the members of the
     * document
     * @dependencies
     * @scenario
     * - parse documents with a numeric `$schema`, an invalid `id`, imports
     *   that are not a list, definitions that are not an object and an
     *   unknown key
     * @expected
     * - a problem at each member
     */
    it('should check the members of the document', () => {
      expect(
        documentErrors({
          $schema: 1,
          id: '1x',
          imports: {},
          definitions: [],
          extra: 1,
        }),
      ).toEqual(['extra', '$schema', 'id', 'imports', 'definitions']);
    });

    /**
     * @target SchemaDocument.parseNode should check the imports
     * @dependencies
     * - ImportElement
     * @scenario
     * - parse imports with an item that is not an object and a name used
     *   twice
     * @expected
     * - problems at the item and at the second `as`
     */
    it('should check the imports', () => {
      expect(
        documentErrors({
          imports: [5, { from: './a', as: 'a' }, { from: './b', as: 'a' }],
        }),
      ).toEqual(['imports.0', 'imports.1.from', 'imports.2.as']);
    });

    /**
     * @target SchemaDocument.parseNode should resolve the conditions of the
     * root type once
     * @dependencies
     * - ExistsCondition
     * @scenario
     * - use a definition with a bad path in two properties
     * @expected
     * - the problem is reported once
     */
    it('should resolve the conditions of the root type once', () => {
      expect(
        documentErrors({
          definitions: {
            types: {
              t: {
                type: 'string',
                rules: [
                  {
                    kind: 'required',
                    when: { kind: 'exists', operand: { path: 'nope' } },
                  },
                ],
              },
            },
          },
          schema: {
            type: 'object',
            properties: {
              a: { type: 'ref', ref: 't' },
              b: { type: 'ref', ref: 't' },
            },
          },
        }),
      ).toEqual(['definitions.types.t.rules.0.when.operand.path']);
    });
  });

  describe('getType', () => {
    /**
     * @target SchemaDocument.getType should fail for an unknown import
     * @dependencies
     * @scenario
     * - get `common.port` without imports
     * @expected
     * - a problem at `imports`
     */
    it('should fail for an unknown import', () => {
      const result = empty.getType('common.port', []);
      expect(!result.ok && result.errors.map(({ path }) => path)).toEqual([
        'imports',
      ]);
    });

    /**
     * @target SchemaDocument.getType should name the import of a problem
     * found in it
     * @dependencies
     * - the fixture `common.schema.json`
     * @scenario
     * - get `common.missing` from a document importing `common`
     * @expected
     * - a problem naming the import
     */
    it('should name the import of a problem found in it', () => {
      const document = unwrap(
        parseDocument(richSchema, join(fixtures, 'main.json')),
      );
      const result = document.getType('common.missing', []);
      expect(!result.ok && result.errors[0].message).toContain(
        'in the import "common"',
      );
    });
  });

  describe('generateTypes', () => {
    /**
     * @target SchemaDocument.generateTypes should name the root after the id
     * @dependencies
     * @scenario
     * - generate the service types, and with an explicit root name
     * @expected
     * - `MyService` with `SCHEMA_HASH` equal to `hash()`, then `Settings`
     */
    it('should name the root after the id', () => {
      const types = service.generateTypes();
      expect(types).toContain('export interface MyService {');
      expect(types).toContain(
        `export const SCHEMA_HASH = '${service.hash()}';`,
      );
      expect(types).toContain("readonly mode?: 'dev' | 'prod';");
      expect(types).toContain('readonly fee: bigint;');
      expect(service.generateTypes('Settings')).toContain(
        'export interface Settings {',
      );
    });

    /**
     * @target SchemaDocument.generateTypes should name the root `Config`
     * without an id
     * @dependencies
     * @scenario
     * - generate the types of a schema without an id
     * @expected
     * - a `Config` interface
     */
    it('should name the root `Config` without an id', () => {
      const document = unwrap(
        parseDocument({ schema: { type: 'object', properties: {} } }),
      );
      expect(document.generateTypes()).toContain('export interface Config {}');
    });

    /**
     * @target SchemaDocument.generateTypes should throw without a schema
     * @dependencies
     * @scenario
     * - generate the types of a document without `schema`
     * @expected
     * - an error is thrown
     */
    it('should throw without a schema', () => {
      expect(() => {
        empty.generateTypes();
      }).toThrow(Error);
    });
  });

  describe('hash', () => {
    /**
     * @target SchemaDocument.hash should change only with the types
     * @dependencies
     * @scenario
     * - hash the service, the service with another id and with another
     *   property type
     * @expected
     * - the same hash for another id, another for another type
     */
    it('should change only with the types', () => {
      const renamed = unwrap(parseDocument({ ...serviceSchema, id: 'other' }));
      const changed = unwrap(
        parseDocument({
          schema: {
            ...serviceSchema.schema,
            properties: {
              ...serviceSchema.schema.properties,
              port: { type: 'string' },
            },
          },
        }),
      );
      expect(service.hash()).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(renamed.hash()).toEqual(service.hash());
      expect(changed.hash()).not.toEqual(service.hash());
    });
  });

  describe('defaultValue', () => {
    /**
     * @target SchemaDocument.defaultValue should give a copy of the defaults
     * @dependencies
     * @scenario
     * - read the defaults twice, changing the first copy
     * @expected
     * - the defaults, unchanged the second time
     */
    it('should give a copy of the defaults', () => {
      const first = service.defaultValue() as Record<string, unknown>;
      first.port = 1;
      expect(service.defaultValue()).toEqual({
        port: 8080,
        fee: 10000000000000000000n,
      });
      expect(() => empty.defaultValue()).toThrow(Error);
    });
  });

  describe('environment', () => {
    /**
     * @target SchemaDocument.environment should map the secret values, or
     * every value
     * @dependencies
     * @scenario
     * - map the service's variables, then every one with a prefix, then a
     *   root that is not an object
     * @expected
     * - the token, then every key, then `{}`
     */
    it('should map the secret values, or every value', () => {
      expect(service.environment()).toEqual({ token: 'TOKEN' });
      expect(service.environment(true, 'svc')).toEqual({
        port: 'SVC_PORT',
        mode: 'SVC_MODE',
        token: 'SVC_TOKEN',
        fee: 'SVC_FEE',
      });
      expect(
        unwrap(parseDocument({ schema: { type: 'string' } })).environment(true),
      ).toEqual({});
    });
  });

  describe('validate', () => {
    /**
     * @target SchemaDocument.validate should read a frozen configuration
     * @dependencies
     * @scenario
     * - validate a configuration with string forms
     * @expected
     * - the converted values with the defaults, deeply frozen
     */
    it('should read a frozen configuration', () => {
      const result = service.validate<Record<string, unknown>>({
        port: '80',
        fee: '1',
      });
      expect(result).toEqual({ ok: true, value: { port: 80, fee: 1n } });
      expect(result.ok && Object.isFrozen(result.value)).toEqual(true);
    });

    /**
     * @target SchemaDocument.validate should check conditional rules after
     * the other problems
     * @dependencies
     * - RequiredRule, EqCondition
     * @scenario
     * - validate `prod` without a token, then also with a wrong port
     * @expected
     * - the missing token, then only the port
     */
    it('should check conditional rules after the other problems', () => {
      expect(service.validate({ mode: 'prod' })).toEqual({
        ok: false,
        errors: [{ path: 'token', message: 'must be set' }],
      });
      const result = service.validate({ mode: 'prod', port: 'x' });
      expect(!result.ok && result.errors.map(({ path }) => path)).toEqual([
        'port',
      ]);
    });

    /**
     * @target SchemaDocument.validate should fail for another hash
     * @dependencies
     * @scenario
     * - validate with the right hash, then a wrong one
     * @expected
     * - success, then one problem at the root
     */
    it('should fail for another hash', () => {
      expect(service.validate({}, service.hash()).ok).toEqual(true);
      const result = service.validate({}, 'sha256:old');
      expect(!result.ok && result.errors.map(({ path }) => path)).toEqual(['']);
    });

    /**
     * @target SchemaDocument.validate should throw without a schema
     * @dependencies
     * @scenario
     * - validate with a document without `schema`
     * @expected
     * - an error is thrown
     */
    it('should throw without a schema', () => {
      expect(() => {
        empty.validate({});
      }).toThrow(Error);
    });
  });

  describe('clone', () => {
    /**
     * @target SchemaDocument.clone should give a document that reads the
     * same
     * @dependencies
     * @scenario
     * - clone the service and validate with the copy
     * @expected
     * - a new document with the same hash and results
     */
    it('should give a document that reads the same', () => {
      const copy = service.clone();
      expect(copy).not.toBe(service);
      expect(copy.hash()).toEqual(service.hash());
      expect(copy.validate({ mode: 'prod' }).ok).toEqual(false);
      expect(copy.id).toEqual('my-service');
    });

    /**
     * @target SchemaDocument.clone should copy every kind of element
     * @dependencies
     * - the fixture `common.schema.json`
     * @scenario
     * - clone a document using every kind of element, then validate valid
     *   and invalid configurations with both
     * @expected
     * - the copy gives the same results
     */
    it('should copy every kind of element', () => {
      const document = unwrap(
        parseDocument(richSchema, join(fixtures, 'main.json')),
      );
      const copy = document.clone();
      for (const config of [
        { name: 'ab', fee: '2', list: [1], store: 's' },
        { name: 'abcd', port: 70000, fee: 0, list: [3], store: { kind: 'x' } },
        { mode: 'b', name: 'x', list: [], store: { kind: 'x' } },
      ])
        expect(copy.validate(config)).toEqual(document.validate(config));
      expect(copy.generateTypes()).toEqual(document.generateTypes());
    });
  });
});
