import { ParseResult, ok } from '../../parsing/result.js';
import * as types from '../types/index.js';
import { RuleElement } from './ruleElement.js';

/**
 * The `required` rule (`{ kind: 'required', when? }`): the value is set. It
 * takes no `value`, and applies to every type; with a `when` it makes a
 * value required only when the condition holds.
 */
export class RequiredRule extends RuleElement {
  /**
   * The kind of the rule, `required`.
   */
  get kind(): string {
    return 'required';
  }

  /**
   * Every built-in type kind: the `kind` of each type class exported from
   * `types/`, read when a rule is parsed, once every module is loaded.
   */
  get targets(): readonly string[] {
    return Object.values(types)
      .map((element) =>
        typeof element === 'function' &&
        Object.hasOwn(element.prototype, 'kind')
          ? element.prototype.kind
          : '',
      )
      .filter((item) => item !== '');
  }

  /**
   * The rule has no parsed member to clone.
   */
  protected cloneExtra = (): void => {};

  /**
   * Checks that a value is set.
   * @param value - the converted value, `undefined` when not set
   */
  protected evaluate = (value: unknown): string | undefined => {
    return value === undefined ? 'must be set' : undefined;
  };

  /**
   * The value is always set unless the rule has a `when`.
   */
  requires = (): boolean => {
    return !this.conditional();
  };

  /**
   * The rule has no member besides its `when`.
   */
  protected parseExtra = (): ParseResult<void> => {
    return ok(undefined);
  };
}
