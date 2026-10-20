import { CONDITION_KEYS } from '../../constants/index.js';
import { ParseResult, all, combine, ok } from '../../parsing/result.js';
import { resolveCompared } from '../../utils/evaluators.js';
import { EvaluatorElement } from '../evaluators/evaluatorElement.js';
import { TypeElement } from '../types/typeElement.js';
import { ConditionElement } from './conditionElement.js';

/**
 * The `in` condition (`{ kind: 'in', operand, choices: [...] }`): the
 * operand is set and equals one of the `choices`. The operand and the
 * choices are evaluators, at least one of them a path; all are values of the
 * scalar type at the first path.
 */
export class InCondition extends ConditionElement {
  protected readonly keys: readonly string[] = [
    ...CONDITION_KEYS,
    'operand',
    'choices',
  ];

  private operand: EvaluatorElement;

  private choices: readonly EvaluatorElement[];

  /**
   * The kind of the condition, `in`.
   */
  get kind(): string {
    return 'in';
  }

  /**
   * Clones the condition with its operand and choices.
   * @param copy - the new, empty condition to fill
   */
  protected cloneMembers = (copy: InCondition): void => {
    copy.operand = this.operand?.clone(copy.scope, copy.pointerOf('operand'));
    copy.choices = this.choices?.map((choice, index) =>
      choice.clone(copy.scope, copy.pointerOf('choices', index)),
    );
  };

  /**
   * Whether the operand is set and equals a choice that is set.
   * @param config - the read configuration
   * @param at - the configuration path of the value, with real indexes
   */
  evaluate(config: unknown, at: readonly string[]): boolean {
    const found = this.operand.evaluate(config, at);
    return (
      found.present &&
      this.choices.some((choice) => {
        const option = choice.evaluate(config, at);
        return option.present && option.value === found.value;
      })
    );
  }

  /**
   * Parses the required `operand` and `choices`, a non-empty list of
   * evaluators; at least one of them is a path.
   * @param node - the condition node
   */
  protected parseNode = (node: Record<string, unknown>): ParseResult<void> => {
    if (!Object.hasOwn(node, 'operand'))
      return this.error('missing required key "operand"');
    if (!Object.hasOwn(node, 'choices'))
      return this.error('missing required key "choices"');
    const list = node.choices;
    if (!Array.isArray(list) || list.length === 0)
      return this.error(
        'choices must be a non-empty array of evaluators',
        'choices',
      );
    const parsed = combine([
      this.scope.elements.parseEvaluator(
        node.operand,
        this.scope,
        this.pointerOf('operand'),
      ),
      all(
        list.map((choice, index) =>
          this.scope.elements.parseEvaluator(
            choice,
            this.scope,
            this.pointerOf('choices', index),
          ),
        ),
      ),
    ]);
    if (!parsed.ok) return parsed;
    const [operand, choices] = parsed.value;
    const path = this.expectPath([operand, ...choices]);
    if (!path.ok) return path;
    this.operand = operand;
    this.choices = choices;
    return ok(undefined);
  };

  /**
   * Resolves the operand and the choices and binds them to the type at the
   * first path.
   * @param root - the parsed root type
   * @param at - the configuration path of the node whose rule has it
   */
  resolve = (root: TypeElement, at: readonly string[]): ParseResult<void> => {
    return resolveCompared([this.operand, ...this.choices], root, at);
  };
}
