import { SchemaDocument } from '../../../lib/elements/document/schemaDocument';
import { parseDocument, unwrap } from '../../testUtils';

const empty = unwrap(parseDocument({}));

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

  describe('generateTypes', () => {
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

  describe('validate', () => {
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
});
