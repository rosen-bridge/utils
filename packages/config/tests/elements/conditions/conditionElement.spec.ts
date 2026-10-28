import { ConditionElement } from '../../../lib/elements/conditions/conditionElement';
import type { EvaluatorElement } from '../../../lib/elements/evaluators/evaluatorElement';
import { ParseResult, ok } from '../../../lib/parsing/result';
import { createScope, unwrap } from '../../testUtils';
import { errorPaths } from './conditionsTestUtils';

/**
 * A condition that only exposes `expectPath`.
 */
class TestConditionElement extends ConditionElement {
  /**
   * The kind of the condition, `test`.
   */
  get kind(): string {
    return 'test';
  }

  /**
   * Copies nothing.
   */
  protected cloneMembers = (): void => {};

  /**
   * Parses nothing.
   */
  protected parseNode = (): ParseResult<void> => ok(undefined);

  /**
   * Resolves nothing.
   */
  resolve = (): ParseResult<void> => ok(undefined);

  /**
   * Always holds.
   */
  evaluate(): boolean {
    return true;
  }

  /**
   * Calls `expectPath`.
   * @param evaluators - the evaluators to check
   */
  callExpectPath = (evaluators: EvaluatorElement[]): ParseResult<void> =>
    this.expectPath(evaluators, 'left');
}

/**
 * Evaluators parsed from `nodes`.
 * @param nodes - the evaluator nodes
 */
const evaluators = (nodes: unknown[]): EvaluatorElement[] => {
  const scope = createScope();
  return nodes.map((node) =>
    unwrap(scope.elements.parseEvaluator(node, scope, 'e')),
  );
};

describe('ConditionElement', () => {
  describe('expectPath', () => {
    /**
     * @target ConditionElement.expectPath should accept evaluators with a
     * path
     * @dependencies
     * - PathElement, StaticElement
     * @scenario
     * - check a static value and a path
     * @expected
     * - success
     */
    it('should accept evaluators with a path', () => {
      const condition = new TestConditionElement(createScope(), 'when');
      expect(
        condition.callExpectPath(evaluators([{ value: 1 }, { path: 'a' }])),
      ).toEqual({ ok: true, value: undefined });
    });

    /**
     * @target ConditionElement.expectPath should fail for static values only
     * @dependencies
     * - StaticElement
     * @scenario
     * - check two static values
     * @expected
     * - one problem at the given segment
     */
    it('should fail for static values only', () => {
      const condition = new TestConditionElement(createScope(), 'when');
      expect(
        errorPaths(
          condition.callExpectPath(evaluators([{ value: 1 }, { value: 2 }])),
        ),
      ).toEqual(['when.left']);
    });
  });
});
