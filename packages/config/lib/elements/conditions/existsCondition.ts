import { CONDITION_KEYS } from '../../constants/index.js';
import { ParseResult, ok } from '../../parsing/result.js';
import { PathElement } from '../evaluators/pathElement.js';
import { TypeElement } from '../types/typeElement.js';
import { ConditionElement } from './conditionElement.js';

/**
 * The `exists` condition (`{ kind: 'exists', operand: { path } }`): the
 * value at the path is set. The operand must be a path, of any type. For
 * absence, wrap it in `not`.
 */
export class ExistsCondition extends ConditionElement {
  protected readonly keys: readonly string[] = [...CONDITION_KEYS, 'operand'];

  private operand: PathElement;

  /**
   * The kind of the condition, `exists`.
   */
  get kind(): string {
    return 'exists';
  }

  /**
   * Clones the condition with its operand.
   * @param copy - the new, empty condition to fill
   */
  protected cloneMembers = (copy: ExistsCondition): void => {
    copy.operand = this.operand?.clone(copy.scope, copy.pointerOf('operand'));
  };

  /**
   * Whether the value at the path is set.
   * @param config - the read configuration
   * @param at - the configuration path of the value, with real indexes
   */
  evaluate(config: unknown, at: readonly string[]): boolean {
    return this.operand.evaluate(config, at).present;
  }

  /**
   * Parses the required `operand`, a path.
   * @param node - the condition node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    if (!Object.hasOwn(node, 'operand'))
      return this.error('missing required key "operand"');
    const operand = this.scope.elements.parseEvaluator(
      node.operand,
      this.scope,
      this.pointerOf('operand'),
    );
    if (!operand.ok) return operand;
    if (!(operand.value instanceof PathElement))
      return this.error('operand must be a path', 'operand');
    this.operand = operand.value;
    return ok(undefined);
  };

  /**
   * Resolves the path; any type can be tested.
   * @param root - the parsed root type
   * @param at - the configuration path of the node whose rule has it
   */
  resolve = (root: TypeElement, at: readonly string[]): ParseResult<void> => {
    return this.operand.resolve(root, at);
  };
}
