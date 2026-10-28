import { ParseResult } from '../parsing/result';
import { findClasses } from '../utils/classes';
import { failAt } from '../utils/errors';
import { expectedKinds } from '../utils/format';
import { isRecord } from '../utils/guards';
import { ConditionElement } from './conditions/conditionElement';
import * as conditions from './conditions/index';
import { ElementClass, ElementsMap, RuleClass, TypeClass } from './elementsMap';
import { EvaluatorElement } from './evaluators/evaluatorElement';
import * as evaluators from './evaluators/index';
import * as rules from './rules/index';
import { RuleElement } from './rules/ruleElement';
import type { SchemaScope } from './schemaScope';
import * as types from './types/index';
import { TypeElement } from './types/typeElement';

/**
 * The built-in element classes: every concrete class of `types/`, `rules/`,
 * `conditions/` and `evaluators/`. Parses a node into the class it names.
 */
export class BuiltinElements implements ElementsMap {
  private readonly types: ReadonlyMap<string, TypeClass<TypeElement>> =
    findClasses(types, TypeElement);

  private readonly rules: ReadonlyMap<string, RuleClass<RuleElement>> =
    findClasses(rules, RuleElement);

  private readonly conditions: ReadonlyMap<
    string,
    ElementClass<ConditionElement>
  > = findClasses(conditions, ConditionElement);

  private readonly evaluators: ReadonlyMap<
    string,
    ElementClass<EvaluatorElement>
  > = findClasses(evaluators, EvaluatorElement);

  /**
   * Parses a condition node into an element of the class its `kind` names.
   * @param node - the condition node
   * @param scope - the document of the condition
   * @param pointer - the pointer of the node
   */
  parseCondition = (
    node: unknown,
    scope: SchemaScope,
    pointer: string,
  ): ParseResult<ConditionElement> => {
    if (!isRecord(node))
      return failAt('a condition must be an object', pointer);
    if (!Object.hasOwn(node, 'kind'))
      return failAt('missing required key "kind"', pointer);
    const element =
      typeof node.kind === 'string'
        ? this.conditions.get(node.kind)
        : undefined;
    if (!element)
      return failAt(
        `unknown condition ${JSON.stringify(node.kind)}${expectedKinds(this.conditions.keys())}`,
        pointer,
        'kind',
      );
    return new element(scope, pointer).parse(node);
  };

  /**
   * Parses an evaluator node, recognized by its only key (`path`, `value`).
   * @param node - the evaluator node
   * @param scope - the document of the evaluator
   * @param pointer - the pointer of the node
   */
  parseEvaluator = (
    node: unknown,
    scope: SchemaScope,
    pointer: string,
  ): ParseResult<EvaluatorElement> => {
    const keys = isRecord(node) ? Object.keys(node) : [];
    const element =
      keys.length === 1 ? this.evaluators.get(keys[0]) : undefined;
    if (!isRecord(node) || !element)
      return failAt(
        `an evaluator must be an object with exactly one key${expectedKinds(this.evaluators.keys())}`,
        pointer,
      );
    return new element(scope, pointer).parse(node);
  };

  /**
   * Parses a rule node into the rule its `kind` names when that rule applies
   * to `target`.
   * @param node - the rule node
   * @param scope - the document of the rule
   * @param pointer - the pointer of the node
   * @param target - the kind of the type the rule is for
   * @param allowsWhen - whether the rule may have a `when`
   */
  parseRule = (
    node: unknown,
    scope: SchemaScope,
    pointer: string,
    target: string,
    allowsWhen = false,
  ): ParseResult<RuleElement> => {
    if (!isRecord(node)) return failAt('a rule must be an object', pointer);
    if (!Object.hasOwn(node, 'kind'))
      return failAt('missing required key "kind"', pointer);
    const element =
      typeof node.kind === 'string' ? this.rules.get(node.kind) : undefined;
    if (!element)
      return failAt(
        `unknown rule ${JSON.stringify(node.kind)}${expectedKinds(this.rules.keys())}`,
        pointer,
        'kind',
      );
    const rule = new element(scope, pointer, target, allowsWhen);
    if (!rule.targets.includes(target))
      return failAt(
        `rule ${JSON.stringify(rule.kind)} cannot be applied to a ${JSON.stringify(target)} type`,
        pointer,
        'kind',
      );
    return rule.parse(node);
  };

  /**
   * Parses a type node into an element of the class its `type` names.
   * @param node - the type node
   * @param scope - the document of the type
   * @param pointer - the pointer of the node
   * @param location - the configuration path of the type
   */
  parseType = (
    node: unknown,
    scope: SchemaScope,
    pointer: string,
    location: readonly string[],
  ): ParseResult<TypeElement> => {
    if (!isRecord(node)) return failAt('a type must be an object', pointer);
    if (!Object.hasOwn(node, 'type'))
      return failAt('missing required key "type"', pointer);
    const element =
      typeof node.type === 'string' ? this.types.get(node.type) : undefined;
    if (!element)
      return failAt(
        `unknown type ${JSON.stringify(node.type)}${expectedKinds(this.types.keys())}`,
        pointer,
        'type',
      );
    return new element(scope, pointer, location).parse(node);
  };
}
