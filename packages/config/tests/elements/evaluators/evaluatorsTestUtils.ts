import type { EvaluatorElement } from '../../../lib/elements/evaluators/evaluatorElement';
import type { TypeElement } from '../../../lib/elements/types/typeElement';
import { ParseResult } from '../../../lib/parsing/result';
import { createScope, parseType, unwrap } from '../../testUtils';

/**
 * The root type the evaluators of the tests are resolved against.
 */
export const evaluatorRoot: TypeElement = unwrap(
  parseType({
    type: 'object',
    properties: {
      port: { type: 'number', default: 8080 },
      tls: {
        type: 'object',
        properties: { enabled: { type: 'boolean' }, cert: { type: 'string' } },
      },
      db: {
        type: 'object',
        properties: {
          host: { type: 'string' },
          port: { type: 'number', default: 5432 },
        },
        default: { host: 'local' },
      },
      nodes: {
        type: 'array',
        items: { type: 'object', properties: { url: { type: 'string' } } },
      },
      store: {
        type: 'union',
        options: [
          { option: { type: 'object', properties: { v: { type: 'string' } } } },
          { option: { type: 'object', properties: { v: { type: 'number' } } } },
          { option: { type: 'object', properties: { w: { type: 'number' } } } },
        ],
      },
      kind: { type: 'literal', value: 'x' },
    },
  }),
);

/**
 * An evaluator parsed from `node` at the pointer `e`.
 * @param node - the evaluator node
 */
export const parseEvaluator = (
  node: unknown,
): ParseResult<EvaluatorElement> => {
  const scope = createScope();
  return scope.elements.parseEvaluator(node, scope, 'e');
};

/**
 * An evaluator parsed from `node` and resolved against `evaluatorRoot`.
 * @param node - the evaluator node
 * @param at - the configuration path of the node whose rule has it
 */
export const resolvedEvaluator = (
  node: unknown,
  at: readonly string[] = [],
): EvaluatorElement => {
  const evaluator = unwrap(parseEvaluator(node));
  unwrap(evaluator.resolve(evaluatorRoot, at));
  return evaluator;
};

/**
 * The paths of the problems of a failed result.
 * @param result - the result
 */
export const errorPaths = (result: ParseResult<unknown>): string[] =>
  result.ok ? [] : result.errors.map(({ path }) => path);
