import { CONDITION_KEYS } from '../../constants/index.js';
import { ParseResult, ok } from '../../parsing/result.js';
import { TypeElement } from '../types/typeElement.js';
import { ConditionElement } from './conditionElement.js';

/**
 * The `not` condition (`{ kind: 'not', condition }`): the condition does not hold.
 */
export class NotCondition extends ConditionElement {
  private condition: ConditionElement;

  protected readonly keys: readonly string[] = [...CONDITION_KEYS, 'condition'];

  /**
   * The kind of the condition, `not`.
   */
  get kind(): string {
    return 'not';
  }

  /**
   * Clones the condition with the negated condition.
   * @param copy - the new, empty condition to fill
   */
  protected cloneMembers = (copy: NotCondition): void => {
    copy.condition = this.condition?.clone(
      copy.scope,
      copy.pointerOf('condition'),
    );
  };

  /**
   * Whether the condition does not hold.
   * @param config - the read configuration
   * @param at - the configuration path of the value, with real indexes
   */
  evaluate(config: unknown, at: readonly string[]): boolean {
    return !this.condition.evaluate(config, at);
  }

  /**
   * Parses the required `condition` to negate.
   * @param node - the condition node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    if (!Object.hasOwn(node, 'condition'))
      return this.error('missing required key "condition"');
    const condition = this.scope.elements.parseCondition(
      node.condition,
      this.scope,
      this.pointerOf('condition'),
    );
    if (!condition.ok) return condition;
    this.condition = condition.value;
    return ok(undefined);
  };

  /**
   * Resolves the negated condition.
   * @param root - the parsed root type
   * @param at - the configuration path of the node whose rule has it
   */
  resolve = (root: TypeElement, at: readonly string[]): ParseResult<void> => {
    return this.condition.resolve(root, at);
  };
}
