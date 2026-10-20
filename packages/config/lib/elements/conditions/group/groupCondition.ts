import { CONDITION_KEYS } from '../../../constants/index.js';
import { ParseResult, all, ok } from '../../../parsing/result.js';
import { TypeElement } from '../../types/typeElement.js';
import { ConditionElement } from '../conditionElement.js';

/**
 * Base of the conditions that combine a non-empty list of conditions
 * (`{ kind: 'all' | 'any', conditions: [...] }`). A subclass only defines
 * its `kind` and `evaluate`.
 */
export abstract class GroupCondition extends ConditionElement {
  protected readonly keys: readonly string[] = [
    ...CONDITION_KEYS,
    'conditions',
  ];

  protected conditions: readonly ConditionElement[];

  /**
   * Clones the condition with its listed conditions.
   * @param copy - the new, empty condition to fill
   */
  protected cloneMembers = (copy: GroupCondition): void => {
    copy.conditions = this.conditions?.map((condition, index) =>
      condition.clone(copy.scope, copy.pointerOf('conditions', index)),
    );
  };

  /**
   * Parses the required `conditions`, a non-empty list of conditions.
   * @param node - the condition node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    if (!Object.hasOwn(node, 'conditions'))
      return this.error('missing required key "conditions"');
    const list = node.conditions;
    if (!Array.isArray(list) || list.length === 0)
      return this.error(
        'conditions must be a non-empty array of conditions',
        'conditions',
      );
    const conditions = all(
      list.map((condition, index) =>
        this.scope.elements.parseCondition(
          condition,
          this.scope,
          this.pointerOf('conditions', index),
        ),
      ),
    );
    if (!conditions.ok) return conditions;
    this.conditions = conditions.value;
    return ok(undefined);
  };

  /**
   * Resolves every listed condition.
   * @param root - the parsed root type
   * @param at - the configuration path of the node whose rule has it
   */
  resolve = (root: TypeElement, at: readonly string[]): ParseResult<void> => {
    const resolved = all(
      this.conditions.map((condition) => condition.resolve(root, at)),
    );
    return resolved.ok ? ok(undefined) : resolved;
  };
}
