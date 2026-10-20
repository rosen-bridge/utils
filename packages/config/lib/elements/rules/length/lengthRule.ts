import { RULE_KEYS } from '../../../constants/index.js';
import { ParseResult, ok } from '../../../parsing/result.js';
import { isNonNegativeInteger } from '../../../utils/guards.js';
import { RuleElement } from '../ruleElement.js';

/**
 * Base of the rules that limit the length of a string in code points
 * (`minLength`, `maxLength`, `eqLength`: `{ kind: 'minLength', length: 1 }`). A subclass only defines its `kind`, `compare` and the `relation`
 * used in messages.
 */
export abstract class LengthRule extends RuleElement {
  readonly targets: readonly string[] = ['string'];

  protected readonly keys: readonly string[] = [...RULE_KEYS, 'length'];

  protected limit: number;

  /**
   * Words between "must have" and the limit in a message (`"at least"`).
   */
  protected abstract readonly relation: string;

  /**
   * Clones the rule with its limit.
   * @param copy - the new, empty rule to fill
   */
  protected cloneExtra = (copy: LengthRule): void => {
    copy.limit = this.limit;
  };

  /**
   * Checks the length of a string in code points against the limit; a value
   * that is not set passes.
   * @param value - the converted value, `undefined` when not set
   */
  protected evaluate = (value: unknown): string | undefined => {
    if (value === undefined) return undefined;
    return this.compare([...(value as string)].length, this.limit)
      ? undefined
      : `must have ${this.relation} ${this.limit} ${this.limit === 1 ? 'character' : 'characters'}`;
  };

  /**
   * Whether a length of `count` satisfies the rule for `limit`.
   * @param count - the length of the string in code points
   * @param limit - the length of the rule
   */
  protected abstract compare: (count: number, limit: number) => boolean;

  /**
   * Parses the required `length`, a non-negative integer.
   * @param node - the rule node
   */
  protected parseExtra = (node: Record<string, unknown>): ParseResult<void> => {
    const limit = this.parseKey(
      node,
      'length',
      isNonNegativeInteger,
      'a non-negative integer',
    );
    if (!limit.ok) return limit;
    this.limit = limit.value;
    return ok(undefined);
  };
}
