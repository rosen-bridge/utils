import { RefElement } from '../../../lib/elements/types/refElement';
import { parseDocument, unwrap } from '../../testUtils';
import { environment, errorPaths, read } from './typesTestUtils';

const document = unwrap(
  parseDocument({
    definitions: {
      types: {
        port: {
          type: 'number',
          default: 8080,
          rules: [{ kind: 'max', bound: 65535 }],
        },
        db: {
          type: 'object',
          properties: {
            host: { type: 'string', rules: [{ kind: 'required' }] },
            password: { type: 'string', secret: true },
          },
        },
      },
    },
  }),
);

/**
 * A `ref` type parsed in `document`.
 * @param node - the type node without `type`
 */
const parseRef = (node: Record<string, unknown>) =>
  document.elements.parseType({ type: 'ref', ...node }, document, 'schema', []);

describe('RefElement', () => {
  describe('parseExtra', () => {
    /**
     * @target RefElement.parseExtra should report problems at `ref`
     * @dependencies
     * - DefinitionsElement
     * @scenario
     * - parse a ref that is not a string and one to a missing type
     * @expected
     * - a problem at `ref` each time
     */
    it('should report problems at `ref`', () => {
      expect(errorPaths(parseRef({ ref: 5 }))).toEqual(['schema.ref']);
      expect(errorPaths(parseRef({ ref: 'missing' }))).toEqual(['schema.ref']);
    });
  });

  describe('transform', () => {
    /**
     * @target RefElement.transform should read with the referenced type and
     * its own rules
     * @dependencies
     * - NumberElement, MinRule, MaxRule
     * @scenario
     * - read 80 and 70000 with a port ref with `min` 1024
     * @expected
     * - both fail, by the ref's rule and the definition's
     */
    it('should read with the referenced type and its own rules', () => {
      const ref = unwrap(
        parseRef({ ref: 'port', rules: [{ kind: 'min', bound: 1024 }] }),
      );
      expect(errorPaths(read(ref, 80))).toEqual(['value']);
      expect(errorPaths(read(ref, 70000))).toEqual(['value']);
      expect(read(ref, '8443')).toEqual({ ok: true, value: 8443 });
    });
  });

  describe('defaultValue', () => {
    /**
     * @target RefElement.defaultValue should prefer its own default
     * @dependencies
     * @scenario
     * - read the defaults of a port ref with and without a default
     * @expected
     * - 443, then the definition's 8080
     */
    it('should prefer its own default', () => {
      expect(
        unwrap(parseRef({ ref: 'port', default: 443 })).defaultValue(),
      ).toEqual(443);
      const ref = unwrap(parseRef({ ref: 'port' }));
      expect(ref.defaultValue()).toEqual(8080);
      expect(read(ref, undefined)).toEqual({ ok: true, value: 8080 });
    });
  });

  describe('resolveKind', () => {
    /**
     * @target RefElement.resolveKind should give the referenced kind
     * @dependencies
     * @scenario
     * - read the kind of a port ref and of an invalid ref
     * @expected
     * - `number`, then rules of the invalid ref are not parsed
     */
    it('should give the referenced kind', () => {
      const ref = unwrap(parseRef({ ref: 'port' })) as RefElement;
      expect(ref.resolveKind()).toEqual('number');
      expect(ref.targetType.kind).toEqual('number');
      expect(
        errorPaths(parseRef({ ref: 'missing', rules: [{ kind: 'min' }] })),
      ).toEqual(['schema.ref']);
    });
  });

  describe('assigns', () => {
    /**
     * @target RefElement.assigns should follow the referenced type
     * @dependencies
     * @scenario
     * - check a db ref, which has a required host
     * @expected
     * - not optional
     */
    it('should follow the referenced type', () => {
      expect(unwrap(parseRef({ ref: 'db' })).optional()).toEqual(false);
    });
  });

  describe('environment', () => {
    /**
     * @target RefElement.environment should name the referenced type's
     * variables, all of them when the ref is secret
     * @dependencies
     * @scenario
     * - name the variables of a db ref, then of a secret one
     * @expected
     * - the password, then the host and the password
     */
    it("should name the referenced type's variables, all of them when the ref is secret", () => {
      expect(environment(unwrap(parseRef({ ref: 'db' })))).toEqual({
        password: 'APP_PASSWORD',
      });
      expect(
        environment(unwrap(parseRef({ ref: 'db', secret: true }))),
      ).toEqual({ host: 'APP_HOST', password: 'APP_PASSWORD' });
    });
  });

  describe('code', () => {
    /**
     * @target RefElement.code should share the declarations of the definition
     * @dependencies
     * - SchemaDocument.generateTypes
     * @scenario
     * - generate the types of a document using the db type twice
     * @expected
     * - one `Db` interface used by both properties
     */
    it('should share the declarations of the definition', () => {
      const shared = unwrap(
        parseDocument({
          definitions: {
            types: {
              db: { type: 'object', properties: { host: { type: 'string' } } },
            },
          },
          schema: {
            type: 'object',
            properties: {
              a: { type: 'ref', ref: 'db' },
              b: { type: 'ref', ref: 'db' },
            },
          },
        }),
      ).generateTypes('Config');
      expect(shared.match(/export interface Db /g)?.length).toEqual(1);
      expect(shared).toContain('readonly a?: Db;');
      expect(shared).toContain('readonly b?: Db;');
    });
  });
});
