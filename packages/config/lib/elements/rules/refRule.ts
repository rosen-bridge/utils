import { ParseResult, fail, ok } from '../../parsing/result.js';
import { RuleElement } from './ruleElement.js';

/**
 * A reference to a defined rule (`{ ref: 'name', when? }`): the rule defined
 * under `definitions.rules.<name>` (`DefinedRule`), parsed for the kind of
 * type the reference is used on, which its `type` must list. It applies when its own `when` and
 * the defined rule's `when` hold, and checks a value with its rules.
 */
export class RefRule extends RuleElement {
  private rule: RuleElement;

  /**
   * A reference names its rule with `ref` instead of `kind` and parameters.
   */
  protected readonly keys: readonly string[] = ['ref'];

  /**
   * The kind of the rule, `ref`, its only key.
   */
  get kind(): string {
    return 'ref';
  }

  /**
   * The kinds the referenced rule may be used on.
   */
  get targets(): readonly string[] {
    return this.rule.targets;
  }

  /**
   * Whether both this reference's `when` and the defined rule's hold.
   * @param config - the read configuration
   * @param at - the configuration path of the value, with real indexes
   */
  applies(config: unknown, at: readonly string[]): boolean {
    return super.applies(config, at) && this.rule.applies(config, at);
  }

  /**
   * Clones the reference with its copy of the referenced rule, which keeps its
   * place under `definitions.rules`.
   * @param copy - the new, empty rule to fill
   */
  protected cloneExtra = (copy: RefRule): void => {
    copy.rule = this.rule?.clone(copy.scope, this.rule.pointer);
  };

  /**
   * Checks a value with the referenced rule.
   * @param value - the converted value, `undefined` when not set
   */
  protected evaluate = (value: unknown): string | undefined => {
    return this.rule.validate(value);
  };

  /**
   * Whether the referenced rule makes the value always set, unless the
   * reference has a `when`.
   */
  requires = (): boolean => {
    return !this.conditional() && this.rule.requires();
  };

  /**
   * The values the referenced rule limits a value to, unless the reference has
   * a `when`.
   */
  allowedValues = (): readonly unknown[] | undefined => {
    return this.conditional() ? undefined : this.rule.allowedValues();
  };

  /**
   * Parses the rule defined as `ref`, for the kind of the target type
   * (`scope.getRule`); problems are reported at `ref`.
   * @param node - the rule node
   */
  protected parseExtra = (node: Record<string, unknown>): ParseResult<void> => {
    if (typeof node.ref !== 'string')
      return this.error('ref must be the name of a rule definition', 'ref');
    const rule = this.scope.getRule(node.ref, this.target);
    if (!rule.ok)
      return fail(
        rule.errors.map(({ message }) => this.problem(message, 'ref')),
      );
    this.rule = rule.value;
    return ok(undefined);
  };
}
