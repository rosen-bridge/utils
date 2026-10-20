import { CONDITION_KEYS } from '../../constants/index.js';
import { ParseResult, ok } from '../../parsing/result.js';
import { EvaluatorElement } from '../evaluators/evaluatorElement.js';
import { PathElement } from '../evaluators/pathElement.js';
import { SchemaElement } from '../schemaElement.js';
import { TypeElement } from '../types/typeElement.js';

/**
 * Base of every condition of a schema (the `when` of a rule), written
 * `{ kind, ... }`: `kind` names the condition (`eq`, `all`, ...). It is
 * evaluated against the read configuration. Conditions share no member
 * besides `kind`, so each implements `parseNode` and `cloneMembers` itself.
 */
export abstract class ConditionElement extends SchemaElement {
  protected readonly keys: readonly string[] = CONDITION_KEYS;

  /**
   * Whether the condition holds for a read configuration (converted values,
   * defaults applied). Throws when the condition is not parsed or resolved.
   * @param config - the read configuration
   * @param at - the configuration path of the value, with real indexes
   */
  abstract evaluate(config: unknown, at: readonly string[]): boolean;

  /**
   * Fails when none of `evaluators` reads the configuration, as a condition on
   * static values only would always give the same result.
   * @param evaluators - the evaluators of the condition
   * @param segments - where the problem is reported, below the condition
   */
  protected expectPath = (
    evaluators: readonly EvaluatorElement[],
    ...segments: (string | number)[]
  ): ParseResult<void> => {
    return evaluators.some((evaluator) => evaluator instanceof PathElement)
      ? ok(undefined)
      : this.error(`${this.kind} needs at least one path`, ...segments);
  };

  /**
   * Resolves the paths of the condition against the root type and binds its
   * static values to the types they are compared with, once the whole schema
   * is parsed. Problems are reported at the evaluators.
   * @param root - the parsed root type
   * @param at - the configuration path of the node whose rule has it
   */
  abstract resolve: (
    root: TypeElement,
    at: readonly string[],
  ) => ParseResult<void>;
}
