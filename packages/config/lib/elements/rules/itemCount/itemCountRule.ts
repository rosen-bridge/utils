import { RULE_KEYS } from '../../../constants/index.js';
import { ParseResult, ok } from '../../../parsing/result.js';
import { isNonNegativeInteger } from '../../../utils/guards.js';
import { RuleElement } from '../ruleElement.js';

/**
 * Base of the rules that limit the number of items of an array (`minItems`,
 * `maxItems`, `eqItems`: `{ kind: 'minItems', count: 1 }`). A subclass only defines its `kind`, `compare` and the `relation`
 * used in messages.
 */
export abstract class ItemCountRule extends RuleElement {
  readonly targets: readonly string[] = ['array'];

  protected readonly keys: readonly string[] = [...RULE_KEYS, 'count'];

  protected limit: number;

  /**
   * Words between "must have" and the limit in a message (`"at least"`).
   */
  protected abstract readonly relation: string;

  /**
   * Clones the rule with its limit.
   * @param copy - the new, empty rule to fill
   */
  protected cloneExtra = (copy: ItemCountRule): void => {
    copy.limit = this.limit;
  };

  /**
   * Checks the number of items of an array against the limit; a value that is
   * not set passes.
   * @param value - the converted value, `undefined` when not set
   */
  protected evaluate = (value: unknown): string | undefined => {
    if (value === undefined) return undefined;
    return this.compare((value as unknown[]).length)
      ? undefined
      : `must have ${this.relation} ${this.limit} ${this.limit === 1 ? 'item' : 'items'}`;
  };

  /**
   * Whether a number of items of `count` satisfies the rule for its limit.
   * @param count - the number of items of the array
   */
  protected abstract compare: (count: number) => boolean;

  /**
   * Parses the required `count`, a non-negative integer.
   * @param node - the rule node
   */
  protected parseExtra = (node: Record<string, unknown>): ParseResult<void> => {
    const limit = this.parseKey(
      node,
      'count',
      isNonNegativeInteger,
      'a non-negative integer',
    );
    if (!limit.ok) return limit;
    this.limit = limit.value;
    return ok(undefined);
  };
}
