import { PATH_SEPARATOR, UNSAFE_NAMES } from '../constants/index.js';
import { ErrorHandler } from '../parsing/errorHandler.js';
import { ParseResult, combine, fail, ok } from '../parsing/result.js';
import { appendPointer } from '../utils/pointer.js';
import type { ElementClass } from './elementsMap.js';
import type { SchemaScope } from './schemaScope.js';

/**
 * Type of the clone hooks (`cloneMembers`, `cloneExtra`): copies the parsed
 * members of an element into `copy`, a new element of the same class. It is
 * written as a method signature so that its parameter is checked
 * bivariantly: each class implements the hook with an arrow function taking
 * its own class (`(copy: ArrayElement) => void`), which a function type
 * would reject under `strictFunctionTypes`.
 */
export type CloneHook<T> = {
  /**
   * Copies the parsed members of an element into `copy`.
   * @param copy - the new, empty element of the same class
   */
  hook(copy: T): void;
}['hook'];

/**
 * Base of every element of a schema: types, rules and conditions. An element
 * knows the document it belongs to (`scope`) and its own place in the
 * schema (`pointer`). It is created empty and becomes valid only when
 * `parse` succeeds; until then its parsed members are not set.
 */
export abstract class SchemaElement extends ErrorHandler {
  /**
   * The document this element belongs to.
   */
  readonly scope: SchemaScope;

  /**
   * Keys the element's node may have. A subclass adds its own keys to those
   * of its base (`[...TYPE_KEYS, 'items']`).
   */
  protected abstract readonly keys: readonly string[];

  /**
   * Kind of the element (the `type` of a type, the `kind` of a rule or a
   * condition), a getter on the class's prototype, so it is known without an
   * instance; abstract bases leave it unimplemented.
   */
  abstract get kind(): string;

  /**
   * Keys `parse` accepts in the element's node: `keys`, and any a base adds
   * (a rule adds `when` when it allows one).
   */
  protected get acceptedKeys(): readonly string[] {
    return this.keys;
  }

  /**
   * An empty element of the document `scope` at `pointer`; only the document
   * passes no scope, as it is its own.
   * @param scope - the document the element belongs to
   * @param pointer - the element's dotted pointer in the schema document
   */
  constructor(
    scope: SchemaScope | undefined,
    readonly pointer: string,
  ) {
    super();
    this.scope = scope ?? (this as unknown as SchemaScope);
  }

  /**
   * Fails with one problem for every key of a node that is not in `allowed`.
   * @param node - the node to check
   * @param allowed - the keys the node may have
   * @param pointer - where the keys are reported (default: the element's)
   */
  protected checkKeys = (
    node: Record<string, unknown>,
    allowed: readonly string[],
    pointer?: string,
  ): ParseResult<void> => {
    const errors = Object.keys(node)
      .filter((key) => !allowed.includes(key))
      .map((key) => ({
        path: appendPointer(pointer ?? this.pointer, key),
        message: `unknown key ${JSON.stringify(key)}`,
      }));
    return errors.length > 0 ? fail(errors) : ok(undefined);
  };

  /**
   * Fails when a name the schema author chooses contains `PATH_SEPARATOR`
   * (it would read as several keys) or is one of `UNSAFE_NAMES`.
   * @param what - what the name names in messages (`property`, `type`, `rule`)
   * @param name - the name to check
   * @param segments - where the problem is reported, below the element
   */
  protected checkName = (
    what: string,
    name: string,
    ...segments: (string | number)[]
  ): ParseResult<void> => {
    const shown = `${what} name ${JSON.stringify(name)}`;
    if (name.includes(PATH_SEPARATOR))
      return this.error(
        `${shown} must not contain ${JSON.stringify(PATH_SEPARATOR)}`,
        ...segments,
      );
    if (UNSAFE_NAMES.includes(name))
      return this.error(
        `${shown} is not allowed: ${UNSAFE_NAMES.map((item) => JSON.stringify(item)).join(', ')} are reserved`,
        ...segments,
      );
    return ok(undefined);
  };

  /**
   * A copy of this element in `scope` at `pointer`, with copies of the
   * children it parsed; the elements it only refers to are shared.
   * @param scope - the document of the copy (default: this element's)
   * @param pointer - the pointer of the copy (default: this element's)
   */
  clone = (scope: SchemaScope = this.scope, pointer = this.pointer): this => {
    const copy = this.create(scope, pointer);
    this.cloneMembers(copy);
    return copy;
  };

  /**
   * A new, empty element of this class, for `clone`. `SchemaDocument`
   * overrides it, as it is its own scope.
   * @param scope - the document of the new element
   * @param pointer - the pointer of the new element
   */
  protected create = (scope: SchemaScope, pointer: string): this => {
    const element = this.constructor as ElementClass<this>;
    return new element(scope, pointer);
  };

  /**
   * Copies the parsed members of this element into `copy`; each family
   * implements it and calls `cloneExtra` of a subclass.
   * @param copy - the new, empty element of the same class
   */
  protected abstract cloneMembers: CloneHook<this>;

  /**
   * Reads the schema node into this element: returns it, now valid, or every
   * problem found in the node. Subclasses implement `parseNode`.
   * @param node - the schema node of the element
   */
  parse = (node: Record<string, unknown>): ParseResult<this> => {
    this.scope.logger.trace(
      `parsing ${this.kind} at ${JSON.stringify(this.pointer)}`,
    );
    const result = combine([
      this.checkKeys(node, this.acceptedKeys),
      this.parseNode(node),
    ]);
    return result.ok ? this.succeed() : result;
  };

  /**
   * Reads the members of the node into this element, once its keys are
   * checked; each family implements it and calls `parseExtra` of a subclass.
   * @param node - the schema node of the element
   */
  protected abstract parseNode: (
    node: Record<string, unknown>,
  ) => ParseResult<void>;

  /**
   * Pointer of a member of this element's node: `pointerOf('rules', 0)` is
   * `<pointer>.rules.0`.
   * @param segments - the members below the element's pointer
   */
  protected pointerOf = (...segments: (string | number)[]): string => {
    return appendPointer(this.pointer, ...segments);
  };
}
