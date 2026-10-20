import { TYPE_KEYS } from '../../constants/index.js';
import type {
  EnvironmentNames,
  EnvironmentVariable,
} from '../../generators/environmentNames.js';
import {
  Reading,
  createReading,
  withSubject,
  withValue,
} from '../../parsing/reading.js';
import { ParseResult, fail, ok } from '../../parsing/result.js';
import { formatValue } from '../../utils/format.js';
import { ScalarElement } from './scalar/scalarElement.js';
import { SCALAR_TYPES } from './scalar/scalarTypes.js';
import { TypeElement, TypeScriptResult } from './typeElement.js';

/**
 * A value a `literal` type can have.
 */
export type LiteralValue = string | number | bigint | boolean;

/**
 * The `literal` type (`{ type: 'literal', value: 'postgres' }`): exactly one
 * string, number, bigint or boolean, read with the scalar type of `value`
 * (`"8080"` for `8080`). It is always required, has no `default`, and only
 * the `required` rule applies to it.
 */
export class LiteralElement extends TypeElement {
  protected readonly keys: readonly string[] = [...TYPE_KEYS, 'value'];

  private value: LiteralValue;

  /**
   * The scalar type of `value`, which reads the configuration's values.
   */
  private scalar: ScalarElement<LiteralValue>;

  /**
   * The kind of the type, `literal`.
   */
  get kind(): string {
    return 'literal';
  }

  /**
   * The scalar type of the value (`string` for `'postgres'`), as which a
   * condition compares the literal.
   */
  get scalarType(): ScalarElement<LiteralValue> {
    return this.scalar;
  }

  /**
   * A literal is always set, so its TypeScript property is not optional.
   */
  protected assigns = (): boolean => {
    return true;
  };

  /**
   * Clones the type with its value.
   * @param copy - the new, empty type to fill
   */
  protected cloneExtra = (copy: LiteralElement): void => {
    copy.value = this.value;
    copy.scalar = this.scalar;
  };

  /**
   * The value as a TypeScript literal type (`'postgres'`, `8080`, `10n`).
   */
  code = (): TypeScriptResult => {
    return { name: this.scalar.literal(this.value), codes: [] };
  };

  /**
   * A literal has no default.
   */
  defaultValue = (): undefined => {
    return undefined;
  };

  /**
   * A variable named after the path, like a scalar, when the value is secret
   * or every value gets one.
   * @param path - the configuration path of the value
   * @param names - names the variables
   * @param secret - whether a type above this one is secret
   */
  environment = (
    path: readonly string[],
    names: EnvironmentNames,
    secret = false,
  ): EnvironmentVariable | undefined => {
    return names.all || secret || this.secret ? names.name(path) : undefined;
  };

  /**
   * Parses the required `value`, a string, a number, a bigint or a boolean,
   * read with the scalar type of its kind.
   * @param node - the type node
   */
  protected parseExtra = (node: Record<string, unknown>): ParseResult<void> => {
    if (!Object.hasOwn(node, 'value'))
      return this.error('missing required key "value"');
    const element = SCALAR_TYPES.find(
      (item) => item.prototype.kind === typeof node.value,
    );
    if (element === undefined)
      return this.error(
        'value must be a string, a number, a bigint or a boolean',
        'value',
      );
    const scalar = new element(
      this.scope,
      this.pointer,
      this.location,
    ) as ScalarElement<LiteralValue>;
    const value = scalar.transform(
      node.value,
      this.pointerOf('value'),
      createReading('value'),
    );
    if (!value.ok) return value;
    this.value = value.value;
    this.scalar = scalar;
    return ok(undefined);
  };

  /**
   * A literal has no child types.
   */
  protected resolveExtra = (): ParseResult<void> => {
    return ok(undefined);
  };

  /**
   * Reads a set value with the scalar type of the literal (so a string form is
   * converted); it must then be the literal's value.
   * @param value - the set value
   * @param pointer - the configuration path of the value, where problems go
   * @param reading - the reading of the value
   */
  protected transform = (
    value: unknown,
    pointer: string,
    reading: Reading,
  ): ParseResult<LiteralValue> => {
    const read = this.scalar.transform(value, pointer, reading);
    return read.ok && read.value === this.value
      ? read
      : fail([
          {
            path: pointer,
            message: withValue(
              reading,
              value,
              `must be ${formatValue(this.value)}`,
            ),
          },
        ]);
  };

  /**
   * A literal is always required, so it fails when it is not set.
   * @param pointer - the configuration path of the value, where problems go
   * @param reading - the reading of the value
   */
  protected absent = (
    pointer: string,
    reading: Reading,
  ): ParseResult<undefined> => {
    return fail([
      { path: pointer, message: withSubject(reading.subject, 'must be set') },
    ]);
  };
}
