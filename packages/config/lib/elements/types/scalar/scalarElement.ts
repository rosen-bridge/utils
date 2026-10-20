import { TYPE_KEYS } from '../../../constants/index.js';
import type {
  EnvironmentNames,
  EnvironmentVariable,
} from '../../../generators/environmentNames.js';
import { Reading } from '../../../parsing/reading.js';
import { ParseResult, ok } from '../../../parsing/result.js';
import { allowedByAll } from '../../../utils/rules.js';
import { TypeElement, TypeScriptResult } from '../typeElement.js';

/**
 * Base of the scalar types (`string`, `number`, `bigint`, `boolean`). A
 * subclass only defines its `kind`, `transform`, the `expected` text of
 * messages and its TypeScript (`typeScriptName`, `literal`).
 */
export abstract class ScalarElement<T> extends TypeElement {
  /**
   * Description of a valid value in messages (`"a boolean"`).
   */
  protected abstract readonly expected: string;

  protected readonly keys: readonly string[] = [...TYPE_KEYS, 'default'];

  /**
   * The TypeScript type of the values (`'string'`).
   */
  protected abstract readonly typeScriptName: string;

  /**
   * A scalar without a `default` has no value when it is not set.
   */
  protected assigns = (): boolean => {
    return false;
  };

  /**
   * A scalar has no members of its own to clone (its default is cloned by
   * `TypeElement`).
   */
  protected cloneExtra = (): void => {};

  /**
   * A scalar needs no declaration: its type is `typeScriptName`, or the union of the literals of the values the rules
   * allow when they limit the value to a list (`'debug' | 'info'`); `never`
   * when no value passes every such rule.
   */
  code = (): TypeScriptResult => {
    const values = allowedByAll(this.rules) as T[] | undefined;
    const name =
      values === undefined
        ? this.typeScriptName
        : values.length === 0
          ? 'never'
          : values.map((value) => this.literal(value)).join(' | ');
    return { name, codes: [] };
  };

  /**
   * The scalar's `default`.
   */
  defaultValue = (): T | undefined => {
    return this.default as T | undefined;
  };

  /**
   * A variable named after the path when the value is secret or every value
   * gets one; the `config` package sets it as a string, which is converted.
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
   * A value of this type as a TypeScript literal type (`'info'`, `8080`,
   * `10n`, `true`).
   * @param value - the value to write
   */
  abstract literal: (value: T) => string;

  /**
   * A scalar has no members of its own to parse (its `default` is parsed by
   * `TypeElement`).
   */
  protected parseExtra = (): ParseResult<void> => {
    return ok(undefined);
  };

  /**
   * A scalar has no child types.
   */
  protected resolveExtra = (): ParseResult<void> => {
    return ok(undefined);
  };

  /**
   * A set value converted to this type (a number string to a number, ...), or
   * a failure when it is not a value of this type or cannot be read exactly.
   * Public, so rules and conditions can read their values with a scalar type.
   * @param value - the value to convert
   * @param pointer - where a problem is reported
   * @param reading - the reading of the value
   */
  abstract transform: (
    value: unknown,
    pointer: string,
    reading: Reading,
  ) => ParseResult<T>;

  /**
   * A scalar without a `default` has no value when it is not set.
   */
  protected absent = (): ParseResult<undefined> => {
    return ok(undefined);
  };
}
