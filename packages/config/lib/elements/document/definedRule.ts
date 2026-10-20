import { ParseResult, all, combine, ok } from '../../parsing/result.js';
import { allowedByAll } from '../../utils/rules.js';
import { RuleElement } from '../rules/ruleElement.js';
import type { SchemaScope } from '../schemaScope.js';

/**
 * A rule defined under `definitions.rules` (`{ type: [...], description?,
 * rules: [...] }`), used by `{ ref, when? }`, parsed for one of the kinds
 * `type` lists. Its rules are inline rules or references to other defined
 * rules; neither may have a `when`, which belongs to the `{ ref }`.
 */
export class DefinedRule extends RuleElement {
  protected readonly keys: readonly string[] = ['type', 'description', 'rules'];

  private parsedRules: readonly RuleElement[] = [];

  /**
   * The optional `description` of the defined rule, for documentation only.
   */
  description?: string;

  /**
   * The kind of the element, `definedRule`.
   */
  get kind(): string {
    return 'definedRule';
  }

  /**
   * The rules of the defined rule.
   */
  get rules(): readonly RuleElement[] {
    return this.parsedRules;
  }

  /**
   * A defined rule parsed for `target`, one of the kinds its `type` lists; it
   * does not allow a `when`.
   * @param scope - the document of the rule
   * @param pointer - the pointer of the rule (`definitions.rules.<name>`)
   * @param target - the kind of the type it is parsed for
   * @param targets - the kinds its `type` lists (default: `target` only)
   */
  constructor(
    scope: SchemaScope,
    pointer: string,
    target: string,
    readonly targets: readonly string[] = [target],
  ) {
    super(scope, pointer, target, false);
  }

  /**
   * A new, empty defined rule, for `clone`, for the same target and kinds.
   * @param scope - the document of the new rule
   * @param pointer - the pointer of the new rule
   */
  protected create = (scope: SchemaScope, pointer: string): this => {
    return new DefinedRule(scope, pointer, this.target, this.targets) as this;
  };

  /**
   * Clones the description and the rules of the defined rule.
   * @param copy - the new, empty rule to fill
   */
  protected cloneExtra = (copy: DefinedRule): void => {
    copy.description = this.description;
    copy.parsedRules = this.parsedRules.map((rule, index) =>
      rule.clone(copy.scope, copy.pointerOf('rules', index)),
    );
  };

  /**
   * Checks a value with each of its rules and returns the first failure.
   * @param value - the converted value, `undefined` when not set
   */
  protected evaluate = (value: unknown): string | undefined => {
    for (const rule of this.parsedRules) {
      const message = rule.validate(value);
      if (message !== undefined) return message;
    }
    return undefined;
  };

  /**
   * Whether one of its rules makes the value always set (its rules have no
   * `when`).
   */
  requires = (): boolean => {
    return this.parsedRules.some((rule) => rule.requires());
  };

  /**
   * The values allowed by all of its rules that limit a value to a list, or
   * `undefined` when none does.
   */
  allowedValues = (): readonly unknown[] | undefined => {
    return allowedByAll(this.parsedRules);
  };

  /**
   * Parses the optional `description`, a string, and the required `rules`, a
   * non-empty list of rules for the kind `target`, reporting both.
   * @param node - the defined rule's node
   */
  protected parseExtra = (node: Record<string, unknown>): ParseResult<void> => {
    const description =
      node.description === undefined || typeof node.description === 'string'
        ? ok(node.description as string | undefined)
        : this.error('description must be a string', 'description');
    const list = node.rules;
    const rules = !Object.hasOwn(node, 'rules')
      ? this.error('missing required key "rules"')
      : Array.isArray(list) && list.length > 0
        ? all(
            list.map((rule, index) =>
              this.scope.elements.parseRule(
                rule,
                this.scope,
                this.pointerOf('rules', index),
                this.target,
              ),
            ),
          )
        : this.error('rules must be a non-empty array of rules', 'rules');
    if (description.ok) this.description = description.value;
    if (rules.ok) this.parsedRules = rules.value;
    const result = combine([description, rules]);
    return result.ok ? ok(undefined) : result;
  };
}
