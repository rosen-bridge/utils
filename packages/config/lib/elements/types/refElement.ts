import { TYPE_KEYS } from '../../constants/index.js';
import type {
  EnvironmentNames,
  EnvironmentVariable,
} from '../../generators/environmentNames.js';
import type { TypeNames } from '../../generators/typeNames.js';
import { Reading } from '../../parsing/reading.js';
import { ParseResult, fail, ok } from '../../parsing/result.js';
import { TypeElement, TypeScriptResult } from './typeElement.js';

/**
 * The `ref` type (`{ type: 'ref', ref: 'name' }`): its own copy of the type
 * defined under `definitions.types.<name>`. Its `rules` are checked after
 * the referenced type's own, so a use can narrow a definition but not relax
 * it, and its `default` replaces the referenced type's.
 */
export class RefElement extends TypeElement {
  /**
   * The name of the referenced type definition.
   */
  protected name: string;

  protected target: TypeElement;

  protected readonly keys: readonly string[] = [...TYPE_KEYS, 'ref', 'default'];

  /**
   * The kind of the type, `ref`.
   */
  get kind(): string {
    return 'ref';
  }

  /**
   * The referenced type (this reference's own copy).
   */
  get targetType(): TypeElement {
    return this.target;
  }

  /**
   * A reference without a `default` assigns itself a value when the
   * referenced type is not optional.
   */
  protected assigns = (): boolean => {
    return !this.target.optional();
  };

  /**
   * Clones the reference with its copy of the referenced type, which keeps
   * its place under `definitions.types`.
   * @param copy - the new, empty type to fill
   */
  protected cloneExtra = (copy: RefElement): void => {
    copy.name = this.name;
    copy.target = this.target?.clone(copy.scope, this.target.pointer);
  };

  /**
   * The TypeScript of the referenced type at the path of its definition, so
   * every use shares its declarations, or at `path` when it differs.
   * @param path - the path of the type from the root
   * @param names - names the declared types
   */
  code = (path: readonly string[], names: TypeNames): TypeScriptResult => {
    const result = this.target.code([this.name], names);
    const definition = this.scope.getType(this.name, this.location);
    const same =
      definition.ok &&
      JSON.stringify(definition.value.code([this.name], names)) ===
        JSON.stringify(result);
    return same ? result : this.target.code(path, names);
  };

  /**
   * The reference's `default`, or else the default value of the referenced
   * type.
   */
  defaultValue = (): unknown => {
    return this.default !== undefined
      ? this.default
      : this.target.defaultValue();
  };

  /**
   * The variables of the referenced type, secret when the reference is.
   * @param path - the configuration path of the value
   * @param names - names the variables
   * @param secret - whether a type above this one is secret
   */
  environment = (
    path: readonly string[],
    names: EnvironmentNames,
    secret = false,
  ): EnvironmentVariable | undefined => {
    return this.target.environment(path, names, secret || this.secret);
  };

  /**
   * Parses the type defined as `ref`, parsed again at this reference's
   * location (`scope.getType`); problems are reported at `ref`.
   * @param node - the type node
   */
  protected parseExtra = (node: Record<string, unknown>): ParseResult<void> => {
    if (typeof node.ref !== 'string')
      return this.error('ref must be the name of a type definition', 'ref');
    const target = this.scope.getType(node.ref, this.location);
    if (!target.ok)
      return fail(
        target.errors.map(({ message }) => this.problem(message, 'ref')),
      );
    this.name = node.ref;
    this.target = target.value;
    return ok(undefined);
  };

  /**
   * Resolves the conditions in this reference's own copy of the referenced
   * type.
   * @param root - the parsed root type
   */
  protected resolveExtra = (root: TypeElement): ParseResult<void> => {
    return this.target.resolve(root);
  };

  /**
   * The kind of the referenced type, through any chain of references
   * (`number` for a `ref` to a `ref` to a `number`), or `undefined` when the
   * referenced type is missing.
   */
  resolveKind = (): string | undefined => {
    return this.target?.resolveKind();
  };

  /**
   * Reads a set value with the referenced type.
   * @param value - the set value
   * @param pointer - the configuration path of the value, where problems go
   * @param reading - the reading of the value
   */
  protected transform = (
    value: unknown,
    pointer: string,
    reading: Reading,
  ): ParseResult<unknown> => {
    return this.target.normalize(value, pointer, reading);
  };

  /**
   * Reads a value that is not set, when the reference has no `default`, with
   * the referenced type.
   * @param pointer - the configuration path of the value, where problems go
   * @param reading - the reading of the value
   */
  protected absent = (
    pointer: string,
    reading: Reading,
  ): ParseResult<unknown> => {
    return this.target.normalize(undefined, pointer, reading);
  };
}
