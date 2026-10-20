import type { ParseResult } from '../parsing/result.js';
import type { ConditionElement } from './conditions/conditionElement.js';
import type { EvaluatorElement } from './evaluators/evaluatorElement.js';
import type { RuleElement } from './rules/ruleElement.js';
import type { SchemaElement } from './schemaElement.js';
import type { SchemaScope } from './schemaScope.js';
import type { TypeElement } from './types/typeElement.js';

/**
 * A concrete element class creating a `T`, called like the `SchemaElement`
 * constructor.
 */
export type ElementClass<T extends SchemaElement> = new (
  scope: SchemaScope,
  pointer: string,
) => T;

/**
 * A concrete type class creating a `T`, called like the `TypeElement`
 * constructor: `location` is the configuration path of the type.
 */
export type TypeClass<T extends TypeElement> = new (
  scope: SchemaScope,
  pointer: string,
  location: readonly string[],
) => T;

/**
 * A concrete rule class creating a `T`, called like the `RuleElement`
 * constructor: `target` is the kind of the type the rule is for, and
 * `allowsWhen` tells whether the rule may have a `when`.
 */
export type RuleClass<T extends RuleElement> = new (
  scope: SchemaScope,
  pointer: string,
  target: string,
  allowsWhen?: boolean,
) => T;

/**
 * Parses the nodes of a schema into elements, reached by every element
 * through its document (`scope.elements`). Each function creates an element
 * of the class the node names in `scope` at `pointer` (the node's pointer in
 * the schema document) and parses the node into it, or fails with a problem
 * at `pointer` (or below it) when the node names no class.
 */
export interface ElementsMap {
  /**
   * Parses a type node (by its `type`: `string`, `object`, ...).
   * @param node - the type node
   * @param scope - the document of the type
   * @param pointer - the pointer of the node
   * @param location - the configuration path of the type
   */
  parseType: (
    node: unknown,
    scope: SchemaScope,
    pointer: string,
    location: readonly string[],
  ) => ParseResult<TypeElement>;

  /**
   * Parses a rule node for a type of kind `target`: a reference (`{ ref }`)
   * or, when its `kind` applies to `target`, a rule of that kind.
   * @param node - the rule node
   * @param scope - the document of the rule
   * @param pointer - the pointer of the node
   * @param target - the kind of the type the rule is for
   * @param allowsWhen - whether the rule may have a `when`
   */
  parseRule: (
    node: unknown,
    scope: SchemaScope,
    pointer: string,
    target: string,
    allowsWhen?: boolean,
  ) => ParseResult<RuleElement>;

  /**
   * Parses a condition node (by its `kind`: `eq`, `all`, ...).
   * @param node - the condition node
   * @param scope - the document of the condition
   * @param pointer - the pointer of the node
   */
  parseCondition: (
    node: unknown,
    scope: SchemaScope,
    pointer: string,
  ) => ParseResult<ConditionElement>;

  /**
   * Parses an evaluator node (by its only key: `path`, `value`).
   * @param node - the evaluator node
   * @param scope - the document of the evaluator
   * @param pointer - the pointer of the node
   */
  parseEvaluator: (
    node: unknown,
    scope: SchemaScope,
    pointer: string,
  ) => ParseResult<EvaluatorElement>;
}
