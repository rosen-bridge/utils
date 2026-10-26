import { SchemaElement } from '../../lib/elements/schemaElement';
import { ParseResult, ok } from '../../lib/parsing/result';
import { createScope } from '../testUtils';

/**
 * An element with the key `name`, exposing the protected checks.
 */
class TestSchemaElement extends SchemaElement {
  protected readonly keys: readonly string[] = ['name'];

  name?: unknown;

  /**
   * The kind of the element, `test`.
   */
  get kind(): string {
    return 'test';
  }

  /**
   * Copies the name.
   * @param copy - the new, empty element to fill
   */
  protected cloneMembers = (copy: TestSchemaElement): void => {
    copy.name = this.name;
  };

  /**
   * Reads the name.
   * @param node - the element node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    this.name = node.name;
    return ok(undefined);
  };

  /**
   * Calls `checkName`.
   * @param name - the name to check
   */
  callCheckName = (name: string): ParseResult<void> =>
    this.checkName('property', name, 'properties', name);

  /**
   * Calls `pointerOf`.
   * @param segments - the members below the element
   */
  callPointerOf = (...segments: (string | number)[]): string =>
    this.pointerOf(...segments);
}

/**
 * A new test element at the pointer `schema`.
 */
const element = () => new TestSchemaElement(createScope(), 'schema');

describe('SchemaElement', () => {
  describe('parse', () => {
    /**
     * @target SchemaElement.parse should read a node with known keys
     * @dependencies
     * @scenario
     * - parse `{ name: 'a' }`
     * @expected
     * - the element itself, with its name
     */
    it('should read a node with known keys', () => {
      const test = element();
      const result = test.parse({ name: 'a' });
      expect(result.ok && result.value).toBe(test);
      expect(test.name).toEqual('a');
    });
  });

  describe('checkKeys', () => {
    /**
     * @target SchemaElement.checkKeys should report every unknown key
     * @dependencies
     * @scenario
     * - parse a node with two unknown keys
     * @expected
     * - one problem at each key
     */
    it('should report every unknown key', () => {
      expect(element().parse({ name: 'a', x: 1, y: 2 })).toEqual({
        ok: false,
        errors: [
          { path: 'schema.x', message: 'unknown key "x"' },
          { path: 'schema.y', message: 'unknown key "y"' },
        ],
      });
    });
  });

  describe('checkName', () => {
    /**
     * @target SchemaElement.checkName should reject dotted and unsafe names
     * @dependencies
     * @scenario
     * - check `port`, `a.b` and `__proto__`
     * @expected
     * - success, then a problem at each of the others
     */
    it('should reject dotted and unsafe names', () => {
      const test = element();
      expect(test.callCheckName('port').ok).toEqual(true);
      for (const name of ['a.b', '__proto__'])
        expect(test.callCheckName(name)).toEqual({
          ok: false,
          errors: [
            {
              path: `schema.properties.${name}`,
              message: expect.stringContaining(`property name "${name}"`),
            },
          ],
        });
    });
  });

  describe('clone', () => {
    /**
     * @target SchemaElement.clone should copy the element to another pointer
     * @dependencies
     * @scenario
     * - clone a parsed element at the default and another pointer
     * @expected
     * - new elements with the same name at those pointers
     */
    it('should copy the element to another pointer', () => {
      const test = element();
      test.parse({ name: 'a' });
      const copy = test.clone();
      const moved = test.clone(createScope(), 'other');
      expect(copy).not.toBe(test);
      expect([copy.pointer, copy.name]).toEqual(['schema', 'a']);
      expect([moved.pointer, moved.name]).toEqual(['other', 'a']);
    });
  });

  describe('pointerOf', () => {
    /**
     * @target SchemaElement.pointerOf should place members below the element
     * @dependencies
     * @scenario
     * - get the pointer of `rules.0`
     * @expected
     * - `schema.rules.0`
     */
    it('should place members below the element', () => {
      expect(element().callPointerOf('rules', 0)).toEqual('schema.rules.0');
    });
  });
});
