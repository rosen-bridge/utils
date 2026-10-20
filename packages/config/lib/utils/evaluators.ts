import type { EvaluatorElement } from '../elements/evaluators/evaluatorElement.js';
import type { TypeElement } from '../elements/types/typeElement.js';
import { ParseResult, all, ok } from '../parsing/result.js';

/**
 * Resolves `evaluators` against the root type, then binds them to the type of
 * the first path, which must be a scalar; the other paths must have its kind
 * and static values are converted to it. Throws when none is a path.
 * @param evaluators - the compared evaluators of a condition
 * @param root - the parsed root type
 * @param at - the configuration path of the node that has the condition
 */
export const resolveCompared = (
  evaluators: readonly EvaluatorElement[],
  root: TypeElement,
  at: readonly string[],
): ParseResult<void> => {
  const resolved = all(
    evaluators.map((evaluator) => evaluator.resolve(root, at)),
  );
  if (!resolved.ok) return resolved;
  const first = evaluators.find((evaluator) => evaluator.type !== undefined);
  const type = first?.type;
  if (first === undefined || type === undefined)
    throw new Error('the compared evaluators include no path');
  const scalar = first.bind(type);
  if (!scalar.ok) return scalar;
  const bound = all(evaluators.map((evaluator) => evaluator.bind(type)));
  return bound.ok ? ok(undefined) : bound;
};
