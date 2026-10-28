import type { RuleElement } from '../../../lib/elements/rules/ruleElement';
import type { SchemaScope } from '../../../lib/elements/schemaScope';
import { ParseResult } from '../../../lib/parsing/result';
import { createScope, unwrap } from '../../testUtils';

/**
 * A rule parsed from `node` at the pointer `rule`, for a type of kind
 * `target`.
 * @param node - the rule node
 * @param target - the kind of the type the rule is for
 * @param allowsWhen - whether the rule may have a `when`
 * @param scope - the document of the rule (default: an empty one)
 */
export const parseRule = (
  node: unknown,
  target = 'string',
  allowsWhen = true,
  scope: SchemaScope = createScope(),
): ParseResult<RuleElement> =>
  scope.elements.parseRule(node, scope, 'rule', target, allowsWhen);

/**
 * A rule parsed from `node`, which must be valid.
 * @param node - the rule node
 * @param target - the kind of the type the rule is for
 */
export const rule = (node: unknown, target = 'string'): RuleElement =>
  unwrap(parseRule(node, target));

/**
 * The paths of the problems of a failed result.
 * @param result - the result
 */
export const errorPaths = (result: ParseResult<unknown>): string[] =>
  result.ok ? [] : result.errors.map(({ path }) => path);
