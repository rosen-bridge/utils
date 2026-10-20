import { CONDITION_KEYS } from '../../../constants/index.js';
import { ParseResult, combine, ok } from '../../../parsing/result.js';
import { resolveCompared } from '../../../utils/evaluators.js';
import { EvaluatorElement, Lookup } from '../../evaluators/evaluatorElement.js';
import { TypeElement } from '../../types/typeElement.js';
import { ConditionElement } from '../conditionElement.js';

/**
 * Base of the conditions that compare two evaluators
 * (`{ kind: 'eq', left: { path: 'server.port' }, right: { value: 8080 } }`).
 * At least one side is a path; both sides are values of the scalar type at
 * the first path. A subclass only defines its `kind` and `compare`.
 */
export abstract class CompareCondition extends ConditionElement {
  protected readonly keys: readonly string[] = [
    ...CONDITION_KEYS,
    'left',
    'right',
  ];

  protected left: EvaluatorElement;

  protected right: EvaluatorElement;

  /**
   * Clones the condition with both evaluators.
   * @param copy - the new, empty condition to fill
   */
  protected cloneMembers = (copy: CompareCondition): void => {
    copy.left = this.left?.clone(copy.scope, copy.pointerOf('left'));
    copy.right = this.right?.clone(copy.scope, copy.pointerOf('right'));
  };

  /**
   * Compares the values of both sides for the configuration.
   * @param config - the read configuration
   * @param at - the configuration path of the value, with real indexes
   */
  evaluate(config: unknown, at: readonly string[]): boolean {
    return this.compare(
      this.left.evaluate(config, at),
      this.right.evaluate(config, at),
    );
  }

  /**
   * Whether the values of both sides are related as the subclass requires.
   * @param left - the value of the left side
   * @param right - the value of the right side
   */
  protected abstract compare: (left: Lookup, right: Lookup) => boolean;

  /**
   * Parses the required `left` and `right` evaluators; at least one is a path.
   * @param node - the condition node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    if (!Object.hasOwn(node, 'left'))
      return this.error('missing required key "left"');
    if (!Object.hasOwn(node, 'right'))
      return this.error('missing required key "right"');
    const sides = combine([
      this.scope.elements.parseEvaluator(
        node.left,
        this.scope,
        this.pointerOf('left'),
      ),
      this.scope.elements.parseEvaluator(
        node.right,
        this.scope,
        this.pointerOf('right'),
      ),
    ]);
    if (!sides.ok) return sides;
    const [left, right] = sides.value;
    const path = this.expectPath([left, right]);
    if (!path.ok) return path;
    this.left = left;
    this.right = right;
    return ok(undefined);
  };

  /**
   * Resolves both evaluators and binds them to the type at the first path.
   * @param root - the parsed root type
   * @param at - the configuration path of the node whose rule has it
   */
  resolve = (root: TypeElement, at: readonly string[]): ParseResult<void> => {
    return resolveCompared([this.left, this.right], root, at);
  };
}
