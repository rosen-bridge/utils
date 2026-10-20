import { TYPE_KEYS } from '../../constants/index.js';
import type {
  EnvironmentNames,
  EnvironmentVariable,
} from '../../generators/environmentNames.js';
import type { TypeNames } from '../../generators/typeNames.js';
import { Reading, withSubject, withValue } from '../../parsing/reading.js';
import { ParseResult, all, fail, ok } from '../../parsing/result.js';
import { indent, propertyKey } from '../../utils/format.js';
import { isRecord } from '../../utils/guards.js';
import { appendPointer } from '../../utils/pointer.js';
import { TypeElement, TypeScriptResult } from './typeElement.js';

/**
 * The `object` type: named `properties`, each read by its own type, with an
 * optional `default` object (read like a set value, so the properties it
 * leaves out get their own defaults).
 */
export class ObjectElement extends TypeElement {
  private properties: ReadonlyMap<string, TypeElement>;

  protected readonly keys: readonly string[] = [
    ...TYPE_KEYS,
    'properties',
    'default',
  ];

  /**
   * The kind of the type, `object`.
   */
  get kind(): string {
    return 'object';
  }

  /**
   * An object without a `default` assigns itself a value when one of its
   * properties is not optional, as reading it then has to produce that
   * property.
   */
  protected assigns = (): boolean => {
    return [...this.properties.values()].some((type) => !type.optional());
  };

  /**
   * Clones the type with its property types.
   * @param copy - the new, empty type to fill
   */
  protected cloneExtra = (copy: ObjectElement): void => {
    copy.properties =
      this.properties &&
      new Map(
        [...this.properties].map(([name, type]) => [
          name,
          type.clone(copy.scope, copy.pointerOf('properties', name)),
        ]),
      );
  };

  /**
   * An interface with a `readonly` member per property, optional when the
   * property type is, after the declarations of the property types.
   * @param path - the path of the type from the root
   * @param names - names the declared types
   */
  code = (path: readonly string[], names: TypeNames): TypeScriptResult => {
    const name = names.name(path, this.pointer);
    const properties = [...this.properties].map(([key, type]) => ({
      key,
      type,
      result: type.code([...path, key], names),
    }));
    const members = properties.map(
      ({ key, type, result }) =>
        `${type.documentation()}readonly ${propertyKey(key)}${type.optional() ? '?' : ''}: ${result.name};`,
    );
    const body =
      members.length === 0 ? '{}' : `{\n  ${indent(members.join('\n'))}\n}`;
    return {
      name,
      codes: [
        ...properties.flatMap(({ result }) => result.codes),
        `${this.documentation()}export interface ${name} ${body}`,
      ],
    };
  };

  /**
   * An object filled by its property types: the value the `default` gives a
   * property, or else its type's default value; `undefined` when it has none.
   */
  defaultValue = (): Record<string, unknown> | undefined => {
    const own = this.default as Record<string, unknown> | undefined;
    const entries = [...this.properties]
      .map(
        ([key, type]) =>
          [
            key,
            own !== undefined && Object.hasOwn(own, key)
              ? own[key]
              : type.defaultValue(),
          ] as const,
      )
      .filter(([, value]) => value !== undefined);
    return entries.length === 0 && own === undefined
      ? undefined
      : Object.fromEntries(entries);
  };

  /**
   * The variables of each property, at its name below `path`, leaving out
   * those that get none; `undefined` when no property gets one.
   * @param path - the configuration path of the value
   * @param names - names the variables
   * @param secret - whether a type above this one is secret
   */
  environment = (
    path: readonly string[],
    names: EnvironmentNames,
    secret = false,
  ): EnvironmentVariable | undefined => {
    const entries = [...this.properties]
      .map(([name, type]) => [
        name,
        type.environment([...path, name], names, secret || this.secret),
      ])
      .filter(([, variable]) => variable !== undefined);
    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  };

  /**
   * Parses the required `properties`, a type per name at its name below the
   * object's location; a name must not contain a dot or be unsafe.
   * @param node - the type node
   */
  protected parseExtra = (node: Record<string, unknown>): ParseResult<void> => {
    const properties = node.properties;
    const names = isRecord(properties) ? Object.keys(properties) : [];
    const types = !Object.hasOwn(node, 'properties')
      ? this.error('missing required key "properties"')
      : isRecord(properties)
        ? all(
            names.map((name) => {
              const checked = this.checkName(
                'property',
                name,
                'properties',
                name,
              );
              return checked.ok
                ? this.scope.elements.parseType(
                    properties[name],
                    this.scope,
                    this.pointerOf('properties', name),
                    [...this.location, name],
                  )
                : checked;
            }),
          )
        : this.error('properties must be an object', 'properties');
    if (!types.ok) return types;
    this.properties = new Map(
      names.map((name, index) => [name, types.value[index]]),
    );
    return ok(undefined);
  };

  /**
   * The type of the property `name`, if the object has it.
   * @param name - the name of the property
   */
  property = (name: string): TypeElement | undefined => {
    return this.properties.get(name);
  };

  /**
   * Resolves the conditions in every property type.
   * @param root - the parsed root type
   */
  protected resolveExtra = (root: TypeElement): ParseResult<void> => {
    const resolved = all(
      [...this.properties.values()].map((type) => type.resolve(root)),
    );
    return resolved.ok ? ok(undefined) : resolved;
  };

  /**
   * Converts a set value: it must be an object whose keys are all properties
   * (one problem at each other key), read with `values`.
   * @param value - the set value
   * @param pointer - the configuration path of the value, where problems go
   * @param reading - the reading of the value
   */
  protected transform = (
    value: unknown,
    pointer: string,
    reading: Reading,
  ): ParseResult<Record<string, unknown>> => {
    if (!isRecord(value))
      return fail([
        {
          path: pointer,
          message: withValue(reading, value, 'must be an object'),
        },
      ]);
    const unknown = Object.keys(value)
      .filter((key) => !this.properties.has(key))
      .map((key) => ({
        path: appendPointer(pointer, key),
        message: withSubject(reading.subject, 'key is not in the schema'),
      }));
    const read = this.values(value, pointer, reading);
    if (unknown.length === 0) return read;
    return fail([...unknown, ...(read.ok ? [] : read.errors)]);
  };

  /**
   * When the object is not set and has no `default`, its properties are read
   * as not set; `undefined` when no property gets a value.
   * @param pointer - the configuration path of the value, where problems go
   * @param reading - the reading of the value
   */
  protected absent = (
    pointer: string,
    reading: Reading,
  ): ParseResult<Record<string, unknown> | undefined> => {
    const read = this.values({}, pointer, reading);
    if (!read.ok) return read;
    return ok(Object.keys(read.value).length === 0 ? undefined : read.value);
  };

  /**
   * Reads each property of `value` with its type into a new object, without
   * the properties that are not set.
   * @param value - the object to read
   * @param pointer - the configuration path of the object, where problems go
   * @param reading - the reading of the value
   */
  private values = (
    value: Record<string, unknown>,
    pointer: string,
    reading: Reading,
  ): ParseResult<Record<string, unknown>> => {
    const entries = [...this.properties];
    const read = all(
      entries.map(([key, type]) =>
        type.normalize(
          Object.hasOwn(value, key) ? value[key] : undefined,
          appendPointer(pointer, key),
          reading,
        ),
      ),
    );
    if (!read.ok) return read;
    return ok(
      Object.fromEntries(
        entries
          .map(([key], index) => [key, read.value[index]])
          .filter(([, item]) => item !== undefined),
      ),
    );
  };
}
