import { RULE_KEYS } from '../../../constants/index.js';
import { createReading } from '../../../parsing/reading.js';
import { ParseResult, ok } from '../../../parsing/result.js';
import { BigintElement } from '../../types/scalar/bigintElement.js';
import { NumberElement } from '../../types/scalar/numberElement.js';
import { RuleElement } from '../ruleElement.js';

/**
 * A number or bigint bound.
 */
export type Bound = number | bigint;

/**
 * The types a bound rule applies to; the bound is read as a value of one.
 */
const BOUND_TYPES = [BigintElement, NumberElement];

/**
 * Base of the rules that compare a number or bigint with a `bound` (`min`,
 * `max`, `eq`: `{ kind: 'min', bound: 1 }`). A subclass only defines its `kind`, `compare` and the `relation`
 * used in messages.
 */
export abstract class BoundRule extends RuleElement {
  readonly targets: readonly string[] = ['number', 'bigint'];

  protected readonly keys: readonly string[] = [...RULE_KEYS, 'bound'];

  protected bound: Bound;

  /**
   * Words between "must be" and the bound in a message (`"at least"`).
   */
  protected abstract readonly relation: string;

  /**
   * Clones the rule with its bound.
   * @param copy - the new, empty rule to fill
   */
  protected cloneExtra = (copy: BoundRule): void => {
    copy.bound = this.bound;
  };

  /**
   * Checks a number or bigint against the bound, compared exactly; a value
   * that is not set passes.
   * @param value - the converted value, `undefined` when not set
   */
  protected evaluate = (value: unknown): string | undefined => {
    if (value === undefined) return undefined;
    return this.compare(value as Bound)
      ? undefined
      : `must be ${this.relation} ${this.bound}`;
  };

  /**
   * Whether `value` satisfies the rule for the bound.
   * @param value - the number or bigint to check
   */
  protected abstract compare: (value: Bound) => boolean;

  /**
   * Parses the required `bound`, written like a value of the target type (an
   * integer string keeps every digit of a `bigint`).
   * @param node - the rule node
   */
  protected parseExtra = (node: Record<string, unknown>): ParseResult<void> => {
    const { target } = this;
    const element = BOUND_TYPES.find((item) => item.prototype.kind === target);
    const type = element && new element(this.scope, this.pointer, []);
    if (!type)
      throw new Error(
        `${this.constructor.name} cannot be applied to a ${JSON.stringify(target)} type`,
      );
    if (!Object.hasOwn(node, 'bound'))
      return this.error('missing required key "bound"');
    const converted = type.transform(
      node.bound,
      this.pointerOf('bound'),
      createReading('bound'),
    );
    if (!converted.ok) return converted;
    this.bound = converted.value;
    return ok(undefined);
  };
}
