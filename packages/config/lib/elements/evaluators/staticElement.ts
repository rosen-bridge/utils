import { createReading } from '../../parsing/reading.js';
import { ParseResult, ok } from '../../parsing/result.js';
import { ScalarElement } from '../types/scalar/scalarElement.js';
import { TypeElement } from '../types/typeElement.js';
import { EvaluatorElement, Lookup } from './evaluatorElement.js';

/**
 * A static value (`{ value: 8080 }`), written like a value of the type it is
 * compared with (`"8080"` for a number). It is converted when it is bound
 * to that type, and only then can it be evaluated.
 */
export class StaticElement extends EvaluatorElement {
  protected readonly keys: readonly string[] = ['value'];

  private raw?: unknown;

  private bound?: { readonly value: unknown };

  /**
   * The kind of the evaluator, `value`, its only key.
   */
  get kind(): string {
    return 'value';
  }

  /**
   * A static value has no type of its own.
   */
  get type(): undefined {
    return undefined;
  }

  /**
   * Converts the value to `type`; only a scalar value can be compared.
   * @param type - the type it is compared with
   */
  bind = (type: TypeElement): ParseResult<void> => {
    if (!(type instanceof ScalarElement))
      return this.error(
        `a value cannot be compared with a ${type.kind}`,
        'value',
      );
    const converted = type.transform(
      this.raw,
      this.pointerOf('value'),
      createReading('value'),
    );
    if (!converted.ok) return converted;
    this.bound = { value: converted.value };
    return ok(undefined);
  };

  /**
   * Clones the value as written and, once bound, converted.
   * @param copy - the new, empty evaluator to fill
   */
  protected cloneMembers = (copy: StaticElement): void => {
    copy.raw = this.raw;
    copy.bound = this.bound;
  };

  /**
   * The converted value, always present. Throws when it is not bound.
   */
  evaluate(): Lookup {
    if (this.bound === undefined)
      throw new Error(
        `${this.constructor.name} at ${JSON.stringify(this.pointer)} is not bound; process the whole schema first`,
      );
    return { present: true, value: this.bound.value };
  }

  /**
   * Parses the required `value`; it is checked when it is bound.
   * @param node - the evaluator node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    if (!Object.hasOwn(node, 'value'))
      return this.error('missing required key "value"');
    this.raw = node.value;
    return ok(undefined);
  };

  /**
   * A static value is not in the configuration, so there is nothing to check.
   */
  resolve = (): ParseResult<void> => {
    return ok(undefined);
  };
}
