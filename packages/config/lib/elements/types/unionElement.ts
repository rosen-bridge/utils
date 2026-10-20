import { TYPE_KEYS } from '../../constants/index.js';
import {
  EnvironmentNames,
  EnvironmentVariable,
  mergeVariables,
} from '../../generators/environmentNames.js';
import type { TypeNames } from '../../generators/typeNames.js';
import { Reading, withValue } from '../../parsing/reading.js';
import { ParseResult, all, fail, ok } from '../../parsing/result.js';
import { isRecord } from '../../utils/guards.js';
import { splitPointer } from '../../utils/pointer.js';
import { TypeElement, TypeScriptResult } from './typeElement.js';
import { UnionOptionElement } from './unionOptionElement.js';

/**
 * The `union` type: a value of one of the types in `options`, each
 * `{ option, when? }` (a type, and a condition under which it applies). Its
 * `default` is a value of an option, read again when it is used.
 */
export class UnionElement extends TypeElement {
  private options: readonly UnionOptionElement[];

  protected readonly keys: readonly string[] = [
    ...TYPE_KEYS,
    'options',
    'default',
  ];

  /**
   * The kind of the type, `union`.
   */
  get kind(): string {
    return 'union';
  }

  /**
   * The types of the options.
   */
  get optionTypes(): readonly TypeElement[] {
    return this.options.map((option) => option.optionType);
  }

  /**
   * A union without a `default` has no value when it is not set.
   */
  protected assigns = (): boolean => {
    return false;
  };

  /**
   * Clones the type with its options.
   * @param copy - the new, empty type to fill
   */
  protected cloneExtra = (copy: UnionElement): void => {
    copy.options = this.options?.map((option, index) =>
      option.clone(copy.scope, copy.pointerOf('options', index)),
    );
  };

  /**
   * A type for the union of the options' types (`Postgres | Sqlite`), after
   * the declarations of the options (each at `<last segment>Option<n>`).
   * @param path - the path of the type from the root
   * @param names - names the declared types
   */
  code = (path: readonly string[], names: TypeNames): TypeScriptResult => {
    const name = names.name(path, this.pointer);
    const options = this.options.map((option, index) =>
      option.optionType.code(this.suffixed(path, `Option${index + 1}`), names),
    );
    return {
      name,
      codes: [
        ...options.flatMap((option) => option.codes),
        `${this.documentation()}export type ${name} = ${options.map((option) => option.name).join(' | ')};`,
      ],
    };
  };

  /**
   * The union's `default`, as read by the first option that reads it when
   * the schema is parsed. A union without one has no default value: the
   * option that applies is not known.
   */
  defaultValue = (): unknown => {
    return this.default;
  };

  /**
   * The variables of every option, merged (`mergeVariables`), so the keys of
   * each option get theirs.
   * @param path - the configuration path of the value
   * @param names - names the variables
   * @param secret - whether a type above this one is secret
   */
  environment = (
    path: readonly string[],
    names: EnvironmentNames,
    secret = false,
  ): EnvironmentVariable | undefined => {
    return mergeVariables(
      this.options.map((option) =>
        option.optionType.environment(path, names, secret || this.secret),
      ),
    );
  };

  /**
   * Parses the required `options`, a list of at least two options.
   * @param node - the type node
   */
  protected parseExtra = (node: Record<string, unknown>): ParseResult<void> => {
    const options = node.options;
    const parsed = !Object.hasOwn(node, 'options')
      ? this.error('missing required key "options"')
      : Array.isArray(options) && options.length > 1
        ? all(options.map(this.parseOption))
        : this.error(
            'options must be a list of at least two options',
            'options',
          );
    if (!parsed.ok) return parsed;
    this.options = parsed.value;
    return ok(undefined);
  };

  /**
   * Parses an option (`UnionOptionElement`), which must be an object.
   * @param node - the option node
   * @param index - the index of the option
   */
  private parseOption = (
    node: unknown,
    index: number,
  ): ParseResult<UnionOptionElement> => {
    return isRecord(node)
      ? new UnionOptionElement(
          this.scope,
          this.pointerOf('options', index),
          this.location,
        ).parse(node)
      : this.error(
          'an option must be an object with "option" and an optional "when"',
          'options',
          index,
        );
  };

  /**
   * Resolves every option (`UnionOptionElement.resolve`).
   * @param root - the parsed root type
   */
  protected resolveExtra = (root: TypeElement): ParseResult<void> => {
    const resolved = all(this.options.map((option) => option.resolve(root)));
    return resolved.ok ? ok(undefined) : resolved;
  };

  /**
   * Reads a set value with the first option that applies (its `when` holds
   * for `reading.config`) and reads it without errors; only that option's
   * deferred checks are kept.
   * @param value - the set value
   * @param pointer - the configuration path of the value, where problems go
   * @param reading - the reading of the value
   */
  protected transform = (
    value: unknown,
    pointer: string,
    reading: Reading,
  ): ParseResult<unknown> => {
    const at = splitPointer(pointer);
    const applying = this.options.filter(
      (option) =>
        reading.config === undefined || option.applies(reading.config, at),
    );
    if (applying.length === 0)
      return fail([
        {
          path: pointer,
          message: withValue(reading, value, 'no option applies'),
        },
      ]);
    for (const option of applying) {
      const attempt: Reading = { ...reading, deferred: [] };
      const read = option.optionType.normalize(value, pointer, attempt);
      if (!read.ok) continue;
      this.scope.logger.trace(
        `${JSON.stringify(pointer)} is read by option ${this.options.indexOf(option) + 1} of the union at ${JSON.stringify(this.pointer)}`,
      );
      reading.deferred.push(...attempt.deferred);
      return read;
    }
    return fail([
      {
        path: pointer,
        message: withValue(reading, value, 'must match one of the options'),
      },
    ]);
  };

  /**
   * A union without a `default` has no value when it is not set.
   */
  protected absent = (): ParseResult<undefined> => {
    return ok(undefined);
  };
}
