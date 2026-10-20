import { appendPointer } from '../utils/pointer.js';
import { ParseResult, SchemaError, fail, ok } from './result.js';

/**
 * Base of the classes that report problems at their place in the schema
 * document (`pointer`) and return the results of parsing.
 */
export abstract class ErrorHandler {
  /**
   * Dotted pointer in the schema document where problems are reported
   * (`schema.properties.port`).
   */
  abstract readonly pointer: string;

  /**
   * A problem at `pointer`, or at `segments` below it.
   * @param message - the problem
   * @param segments - members below `pointer`
   */
  protected problem = (
    message: string,
    ...segments: (string | number)[]
  ): SchemaError => {
    return { path: appendPointer(this.pointer, ...segments), message };
  };

  /**
   * Failed result with one problem at `pointer`, or at `segments` below it.
   * @param message - the problem
   * @param segments - members below `pointer`
   */
  protected error = (
    message: string,
    ...segments: (string | number)[]
  ): ParseResult<never> => {
    return fail([this.problem(message, ...segments)]);
  };

  /**
   * Returns this object as the result of a successful parse.
   */
  protected succeed = (): ParseResult<this> => {
    return ok(this);
  };
}
