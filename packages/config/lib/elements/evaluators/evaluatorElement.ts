import { ParseResult } from '../../parsing/result.js';
import { SchemaElement } from '../schemaElement.js';
import { TypeElement } from '../types/typeElement.js';

/**
 * The value an evaluator finds in a configuration.
 */
export interface Lookup {
  readonly present: boolean;
  readonly value?: unknown;
}

/**
 * Base of every evaluator: an operand of a condition that gives a value for
 * a read configuration. Its node is recognized by its only key, its `kind`:
 * `{ path: 'server.port' }` (`PathElement`) or `{ value: 8080 }`
 * (`StaticElement`).
 */
export abstract class EvaluatorElement extends SchemaElement {
  /**
   * The type of the value the evaluator gives, once resolved: the type at the
   * path of a `PathElement`; `undefined` for a static value.
   */
  abstract get type(): TypeElement | undefined;

  /**
   * Checks that the evaluator gives a value of `type`: a path must lead to a
   * type of the same kind, a static value is converted to it.
   * @param type - the scalar type it is compared with
   */
  abstract bind: (type: TypeElement) => ParseResult<void>;

  /**
   * The value of the evaluator for a read configuration. Throws when the
   * evaluator is not resolved and bound.
   * @param config - the read configuration
   * @param at - the configuration path of the value, with real indexes
   */
  abstract evaluate(config: unknown, at: readonly string[]): Lookup;

  /**
   * Checks the evaluator against the root type (the path of a `PathElement`
   * must be in the schema); problems are reported at the evaluator.
   * @param root - the parsed root type
   * @param at - the configuration path of the node whose rule has it
   */
  abstract resolve: (
    root: TypeElement,
    at: readonly string[],
  ) => ParseResult<void>;
}
