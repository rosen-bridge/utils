import { TYPE_KEYS } from '../../constants/index.js';
import type {
  EnvironmentNames,
  EnvironmentVariable,
} from '../../generators/environmentNames.js';
import type { TypeNames } from '../../generators/typeNames.js';
import { Reading, createReading, withValue } from '../../parsing/reading.js';
import {
  ParseResult,
  SchemaError,
  all,
  combine,
  fail,
  ok,
} from '../../parsing/result.js';
import { splitPointer } from '../../utils/pointer.js';
import type { TypeClass } from '../elementsMap.js';
import { RuleElement } from '../rules/ruleElement.js';
import { CloneHook, SchemaElement } from '../schemaElement.js';
import type { SchemaScope } from '../schemaScope.js';

/**
 * The TypeScript of a type: `name` is the type to write where it is used
 * (`number`, `ConfigServer`), and `codes` the declarations it needs, those
 * of its children first.
 */
export interface TypeScriptResult {
  name: string;
  codes: readonly string[];
}

/**
 * Base of every type of a schema (`string`, `object`, ...).
 */
export abstract class TypeElement extends SchemaElement {
  protected label?: string;

  protected description?: string;

  /**
   * Whether the value (and everything below it) is secret: it never appears
   * in errors or logs.
   */
  protected secret = false;

  protected rules: readonly RuleElement[] = [];

  /**
   * The type's `default`, read like a configuration value when the schema is
   * parsed (`parseDefault`), or `undefined` when it has none. Only the types
   * whose `keys` have `default` take one.
   */
  protected default?: unknown;

  protected readonly keys: readonly string[] = TYPE_KEYS;

  /**
   * An empty type at the configuration path `location`, from which the
   * relative condition paths of its rules start.
   * @param scope - the document of the type
   * @param pointer - the pointer of the type's node
   * @param location - the configuration path (`ANY_INDEX` for an array item)
   */
  constructor(
    scope: SchemaScope,
    pointer: string,
    readonly location: readonly string[],
  ) {
    super(scope, pointer);
  }

  /**
   * The TypeScript of a value read with this type; a type that needs a
   * declaration (an object, a union) gets its name from `names`.
   * @param path - the path of the type from the root (`['config', 'server']`)
   * @param names - names the declared types
   */
  abstract code: (
    path: readonly string[],
    names: TypeNames,
  ) => TypeScriptResult;

  /**
   * The doc comment of the type, from its `label` and `description`, ending
   * with a line break; empty when it has neither.
   */
  documentation = (): string => {
    const paragraphs = [this.label, this.description].filter(
      (text): text is string => text !== undefined && text !== '',
    );
    if (paragraphs.length === 0) return '';
    const lines = paragraphs
      .join('\n\n')
      .replaceAll('*/', '*\\/')
      .split('\n')
      .map((line) => (line === '' ? ' *' : ` * ${line}`));
    return `/**\n${lines.join('\n')}\n */\n`;
  };

  /**
   * `path` with `suffix` added to its last segment, the path of a child
   * without a key of its own (`['config', 'colorItem']`).
   * @param path - the path of the type
   * @param suffix - the suffix to add
   */
  protected suffixed = (
    path: readonly string[],
    suffix: string,
  ): readonly string[] => {
    return [...path.slice(0, -1), `${path[path.length - 1]}${suffix}`];
  };

  /**
   * A new, empty type of this class, for `clone`, at the same location.
   * @param scope - the document of the new type
   * @param pointer - the pointer of the new type
   */
  protected create = (scope: SchemaScope, pointer: string): this => {
    const element = this.constructor as TypeClass<this>;
    return new element(scope, pointer, this.location);
  };

  /**
   * Clones what every type has (with its rules), then the members of the
   * subclass with `cloneExtra`.
   * @param copy - the new, empty type to fill
   */
  protected cloneMembers = (copy: TypeElement): void => {
    copy.label = this.label;
    copy.description = this.description;
    copy.secret = this.secret;
    copy.default = this.default;
    copy.rules = this.rules.map((rule, index) =>
      rule.clone(copy.scope, copy.pointerOf('rules', index)),
    );
    this.cloneExtra(copy);
  };

  /**
   * Copies the parsed members of the subclass's type into `copy`.
   * @param copy - the new, empty type to fill
   */
  protected abstract cloneExtra: CloneHook<TypeElement>;

  /**
   * The value a read configuration has for this type when the configuration
   * has none, or `undefined`; shared with the schema, so callers copy it.
   */
  abstract defaultValue: () => unknown;

  /**
   * The environment variables of a value of this type: a variable name, the
   * mapping of an object's keys, or `undefined` when nothing gets one.
   * @param path - the configuration path of the value
   * @param names - names the variables
   * @param secret - whether a type above this one is secret
   */
  abstract environment: (
    path: readonly string[],
    names: EnvironmentNames,
    secret?: boolean,
  ) => EnvironmentVariable | undefined;

  /**
   * Reads a value with this type: a set value is converted (`transform`), a
   * missing one is the `default` read the same way or else `absent`; then the
   * rules are checked, those with a `when` once the whole value is read.
   * @param value - the value, `undefined` when it is not set
   * @param pointer - the configuration path of the value, where problems go
   * @param reading - the reading of the value
   */
  normalize = (
    value: unknown,
    pointer: string,
    reading: Reading,
  ): ParseResult<unknown> => {
    const scope =
      this.secret && !reading.secret ? { ...reading, secret: true } : reading;
    const read =
      value !== undefined
        ? this.transform(value, pointer, scope)
        : this.default !== undefined
          ? this.transform(this.default, pointer, scope)
          : this.absent(pointer, scope);
    if (!read.ok) return read;
    const checked = this.checkRules(read.value, pointer, scope);
    return checked.ok ? read : checked;
  };

  /**
   * A set value converted to this type's form (with its children read by
   * their own types), before the type's rules are checked.
   * @param value - the value to convert
   * @param pointer - the configuration path of the value, where problems go
   * @param reading - the reading of the value
   */
  protected abstract transform: (
    value: unknown,
    pointer: string,
    reading: Reading,
  ) => ParseResult<unknown>;

  /**
   * The value of this type when it is not set and has no `default` (an
   * object of its properties' defaults), or `undefined` when it has none.
   * @param pointer - the configuration path of the value, where problems go
   * @param reading - the reading of the value
   */
  protected abstract absent: (
    pointer: string,
    reading: Reading,
  ) => ParseResult<unknown>;

  /**
   * Checks a read value against the type's rules, one error per failed rule;
   * rules with a `when` are added to `reading.deferred` instead.
   * @param value - the read value, `undefined` when it is not set
   * @param pointer - the configuration path of the value, where problems go
   * @param reading - the reading of the value
   */
  private checkRules = (
    value: unknown,
    pointer: string,
    reading: Reading,
  ): ParseResult<void> => {
    // When the rules have problems they are reported and `rules` stays
    // empty, so the value is not checked against them.
    /**
     * The error of `rule` for the value, if it fails it.
     * @param rule - the rule to check
     */
    const failed = (rule: RuleElement): SchemaError[] => {
      const message = rule.validate(value);
      return message === undefined
        ? []
        : [{ path: pointer, message: withValue(reading, value, message) }];
    };
    const at = splitPointer(pointer);
    for (const rule of this.rules.filter((item) => item.conditional()))
      reading.deferred.push((config) =>
        rule.applies(config, at) ? failed(rule) : [],
      );
    const errors = this.rules
      .filter((rule) => !rule.conditional())
      .flatMap((rule) => failed(rule));
    return errors.length > 0 ? fail(errors) : ok(undefined);
  };

  /**
   * Whether a read configuration may have no value for this type: no rule
   * always requires it, it has no `default` and it assigns itself none.
   */
  optional = (): boolean => {
    return (
      !this.rules.some((rule) => rule.requires()) &&
      this.default === undefined &&
      !this.assigns()
    );
  };

  /**
   * Whether the type assigns itself a value when the configuration has none
   * and it has no `default` (an object with a property always set).
   */
  protected abstract assigns: () => boolean;

  /**
   * Parses `label`, `description` and `secret`, then the subclass's members
   * (`parseExtra`), the `rules` for the kind `resolveKind` gives and the
   * `default` (`parseDefault`), and reports the problems of all of them.
   * @param node - the type node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    const label =
      node.label === undefined || typeof node.label === 'string'
        ? ok(node.label as string | undefined)
        : this.error('label must be a string', 'label');
    const description =
      node.description === undefined || typeof node.description === 'string'
        ? ok(node.description as string | undefined)
        : this.error('description must be a string', 'description');
    const secret =
      node.secret === undefined || typeof node.secret === 'boolean'
        ? ok(node.secret === true)
        : this.error('secret must be a boolean', 'secret');
    const extra = this.parseExtra(node);
    const kind = this.resolveKind();
    const rules =
      !Object.hasOwn(node, 'rules') || kind === undefined
        ? ok([])
        : Array.isArray(node.rules)
          ? all(
              node.rules.map((rule, index) =>
                this.scope.elements.parseRule(
                  rule,
                  this.scope,
                  this.pointerOf('rules', index),
                  kind,
                  true,
                ),
              ),
            )
          : this.error('rules must be an array', 'rules');
    if (label.ok) this.label = label.value;
    if (description.ok) this.description = description.value;
    if (secret.ok) this.secret = secret.value;
    if (rules.ok) this.rules = rules.value;
    const defaulted =
      extra.ok &&
      node.default !== undefined &&
      this.acceptedKeys.includes('default')
        ? this.parseDefault(node.default)
        : ok(undefined);
    const result = combine([
      label,
      description,
      secret,
      extra,
      rules,
      defaulted,
    ]);
    return result.ok ? ok(undefined) : result;
  };

  /**
   * Parses the members of the subclass's type node (`items`, `properties`,
   * ...), after `label`, `description` and `secret` and before the rules.
   * @param node - the type node
   */
  protected abstract parseExtra: (
    node: Record<string, unknown>,
  ) => ParseResult<void>;

  /**
   * Reads the `default` like a configuration value: converted (children by
   * their own types) and checked against the rules without a `when`.
   * @param value - the `default` of the node
   */
  private parseDefault = (value: unknown): ParseResult<void> => {
    const read = this.normalize(
      value,
      this.pointerOf('default'),
      createReading('default'),
    );
    if (!read.ok) return read;
    this.default = read.value;
    return ok(undefined);
  };

  /**
   * Resolves the conditions of the type's rules against the root type, then
   * those below it (`resolveExtra`), once the whole schema is parsed.
   * @param root - the parsed root type
   */
  resolve = (root: TypeElement): ParseResult<void> => {
    const result = combine([
      all(this.rules.map((rule) => rule.resolve(root, this.location))),
      this.resolveExtra(root),
    ]);
    return result.ok ? ok(undefined) : result;
  };

  /**
   * Resolves the conditions in the subclass's child types.
   * @param root - the parsed root type
   */
  protected abstract resolveExtra: (root: TypeElement) => ParseResult<void>;

  /**
   * The type kind the type's `rules` must apply to: its own kind, or
   * `undefined` when it is not known (a reference whose type is missing),
   * so the rules are not parsed.
   */
  resolveKind = (): string | undefined => {
    return this.kind;
  };
}
