import { ParseResult, combine, ok } from '../../parsing/result.js';
import type { ConditionElement } from '../conditions/conditionElement.js';
import { SchemaElement } from '../schemaElement.js';
import type { SchemaScope } from '../schemaScope.js';
import type { TypeElement } from './typeElement.js';

/**
 * An option of a union (`{ option, when? }`): the type of the option and an
 * optional condition under which the option applies. It is created by its
 * `UnionElement`, not by `ElementsMap`, and is not exported with the types:
 * it is not a type (its kind is `option`).
 */
export class UnionOptionElement extends SchemaElement {
  protected readonly keys: readonly string[] = ['option', 'when'];

  private type: TypeElement;

  private when?: ConditionElement;

  /**
   * The kind of the element, `option`; it is not a type.
   */
  get kind(): string {
    return 'option';
  }

  /**
   * The type of the option.
   */
  get optionType(): TypeElement {
    return this.type;
  }

  /**
   * An empty option of the union at `location`.
   * @param scope - the document of the option
   * @param pointer - the pointer of the option's node
   * @param location - the configuration path of the union
   */
  constructor(
    scope: SchemaScope,
    pointer: string,
    readonly location: readonly string[],
  ) {
    super(scope, pointer);
  }

  /**
   * Whether the option applies: it has no `when`, or its `when` holds.
   * @param config - the configuration being read
   * @param at - the configuration path of the union's value
   */
  applies = (config: unknown, at: readonly string[]): boolean => {
    return this.when === undefined || this.when.evaluate(config, at);
  };

  /**
   * A new, empty option, for `clone`, at the same location.
   * @param scope - the document of the new option
   * @param pointer - the pointer of the new option
   */
  protected create = (scope: SchemaScope, pointer: string): this => {
    return new UnionOptionElement(scope, pointer, this.location) as this;
  };

  /**
   * Clones the option with its type and condition.
   * @param copy - the new, empty option to fill
   */
  protected cloneMembers = (copy: UnionOptionElement): void => {
    copy.type = this.type?.clone(copy.scope, copy.pointerOf('option'));
    copy.when = this.when?.clone(copy.scope, copy.pointerOf('when'));
  };

  /**
   * Parses the required `option`, a type at the union's location, and the
   * optional `when`, a condition.
   * @param node - the option node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    const result = combine([
      Object.hasOwn(node, 'option')
        ? this.scope.elements.parseType(
            node.option,
            this.scope,
            this.pointerOf('option'),
            this.location,
          )
        : this.error('missing required key "option"'),
      Object.hasOwn(node, 'when')
        ? this.scope.elements.parseCondition(
            node.when,
            this.scope,
            this.pointerOf('when'),
          )
        : ok(undefined),
    ]);
    if (!result.ok) return result;
    [this.type, this.when] = result.value;
    return ok(undefined);
  };

  /**
   * Resolves the option's type and its `when`, from the union's location.
   * @param root - the parsed root type
   */
  resolve = (root: TypeElement): ParseResult<void> => {
    const result = combine([
      this.type.resolve(root),
      this.when?.resolve(root, this.location) ?? ok(undefined),
    ]);
    return result.ok ? ok(undefined) : result;
  };
}
