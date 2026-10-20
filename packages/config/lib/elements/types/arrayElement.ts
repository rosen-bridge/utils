import { ANY_INDEX, TYPE_KEYS } from '../../constants/index.js';
import type { EnvironmentVariable } from '../../generators/environmentNames.js';
import type { TypeNames } from '../../generators/typeNames.js';
import { Reading, withValue } from '../../parsing/reading.js';
import { ParseResult, all, fail, ok } from '../../parsing/result.js';
import { appendPointer } from '../../utils/pointer.js';
import { TypeElement, TypeScriptResult } from './typeElement.js';

/**
 * The `array` type: a list whose items all have the type `items`, with an
 * optional `default` list.
 */
export class ArrayElement extends TypeElement {
  private items: TypeElement;

  protected readonly keys: readonly string[] = [
    ...TYPE_KEYS,
    'items',
    'default',
  ];

  /**
   * The kind of the type, `array`.
   */
  get kind(): string {
    return 'array';
  }

  /**
   * The type of the items.
   */
  get itemType(): TypeElement {
    return this.items;
  }

  /**
   * An array without a `default` has no value when it is not set.
   */
  protected assigns = (): boolean => {
    return false;
  };

  /**
   * Clones the type with its `items` type.
   * @param copy - the new, empty type to fill
   */
  protected cloneExtra = (copy: ArrayElement): void => {
    copy.items = this.items?.clone(copy.scope, copy.pointerOf('items'));
  };

  /**
   * `readonly <items>[]`, or `ReadonlyArray<<items>>` when the items type is
   * not a single name; the items are at `<last segment>Item`.
   * @param path - the path of the type from the root
   * @param names - names the declared types
   */
  code = (path: readonly string[], names: TypeNames): TypeScriptResult => {
    const items = this.items.code(this.suffixed(path, 'Item'), names);
    return {
      name: /^[A-Za-z0-9_$]+$/.test(items.name)
        ? `readonly ${items.name}[]`
        : `ReadonlyArray<${items.name}>`,
      codes: items.codes,
    };
  };

  /**
   * The array's `default`.
   */
  defaultValue = (): readonly unknown[] | undefined => {
    return this.default as readonly unknown[] | undefined;
  };

  /**
   * An array gets no environment variable: the `config` package would set
   * it as a string, and its items have no names.
   */
  environment = (): EnvironmentVariable | undefined => {
    return undefined;
  };

  /**
   * Parses the required `items` type, at any index below the array's location
   * (`ANY_INDEX`).
   * @param node - the type node
   */
  protected parseExtra = (node: Record<string, unknown>): ParseResult<void> => {
    const items = Object.hasOwn(node, 'items')
      ? this.scope.elements.parseType(
          node.items,
          this.scope,
          this.pointerOf('items'),
          [...this.location, ANY_INDEX],
        )
      : this.error('missing required key "items"');
    if (!items.ok) return items;
    this.items = items.value;
    return ok(undefined);
  };

  /**
   * Resolves the conditions in the `items` type.
   * @param root - the parsed root type
   */
  protected resolveExtra = (root: TypeElement): ParseResult<void> => {
    return this.items.resolve(root);
  };

  /**
   * Converts a set value: it must be an array, and each item is read by the
   * `items` type (problems at the item's index).
   * @param value - the set value
   * @param pointer - the configuration path of the value, where problems go
   * @param reading - the reading of the value
   */
  protected transform = (
    value: unknown,
    pointer: string,
    reading: Reading,
  ): ParseResult<unknown[]> => {
    if (!Array.isArray(value))
      return fail([
        {
          path: pointer,
          message: withValue(reading, value, 'must be an array'),
        },
      ]);
    return all(
      value.map((item, index) =>
        this.items.normalize(item, appendPointer(pointer, index), reading),
      ),
    );
  };

  /**
   * An array without a `default` has no value when it is not set.
   */
  protected absent = (): ParseResult<undefined> => {
    return ok(undefined);
  };
}
