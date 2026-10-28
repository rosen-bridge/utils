import type { ConditionElement } from '../../../lib/elements/conditions/conditionElement';
import type { TypeElement } from '../../../lib/elements/types/typeElement';
import { ParseResult } from '../../../lib/parsing/result';
import { createScope, parseType, unwrap } from '../../testUtils';

/**
 * The root type the conditions of the tests are resolved against.
 */
export const conditionRoot: TypeElement = unwrap(
  parseType({
    type: 'object',
    properties: {
      port: { type: 'number' },
      mode: { type: 'string' },
      fee: { type: 'bigint' },
      flag: { type: 'boolean' },
      kind: { type: 'literal', value: 'a' },
      tls: { type: 'object', properties: { enabled: { type: 'boolean' } } },
    },
  }),
);

/**
 * A condition parsed from `node` at the pointer `when`, not resolved.
 * @param node - the condition node
 */
export const parseCondition = (
  node: unknown,
): ParseResult<ConditionElement> => {
  const scope = createScope();
  return scope.elements.parseCondition(node, scope, 'when');
};

/**
 * A condition parsed from `node` and resolved against `conditionRoot`.
 * @param node - the condition node
 * @param at - the configuration path of the node whose rule has it
 */
export const resolvedCondition = (
  node: unknown,
  at: readonly string[] = ['port'],
): ConditionElement => {
  const condition = unwrap(parseCondition(node));
  unwrap(condition.resolve(conditionRoot, at));
  return condition;
};

/**
 * The paths of the problems of a failed result.
 * @param result - the result
 */
export const errorPaths = (result: ParseResult<unknown>): string[] =>
  result.ok ? [] : result.errors.map(({ path }) => path);
