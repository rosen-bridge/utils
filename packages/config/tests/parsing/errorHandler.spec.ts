import { ErrorHandler } from '../../lib/parsing/errorHandler';
import { ParseResult, SchemaError } from '../../lib/parsing/result';

/**
 * An error handler at a fixed pointer, exposing its protected members.
 */
class TestErrorHandler extends ErrorHandler {
  readonly pointer = 'schema.port';

  /**
   * Calls `problem`.
   * @param message - the problem
   * @param segments - members below the pointer
   */
  callProblem = (
    message: string,
    ...segments: (string | number)[]
  ): SchemaError => this.problem(message, ...segments);

  /**
   * Calls `error`.
   * @param message - the problem
   * @param segments - members below the pointer
   */
  callError = (
    message: string,
    ...segments: (string | number)[]
  ): ParseResult<never> => this.error(message, ...segments);

  /**
   * Calls `succeed`.
   */
  callSucceed = (): ParseResult<this> => this.succeed();
}

describe('ErrorHandler', () => {
  describe('problem', () => {
    /**
     * @target ErrorHandler.problem should place the problem below the
     * pointer
     * @dependencies
     * @scenario
     * - create a problem at the segment `default`
     * @expected
     * - the problem at `schema.port.default`
     */
    it('should place the problem below the pointer', () => {
      expect(new TestErrorHandler().callProblem('bad', 'default')).toEqual({
        path: 'schema.port.default',
        message: 'bad',
      });
    });
  });

  describe('error', () => {
    /**
     * @target ErrorHandler.error should fail with one problem
     * @dependencies
     * @scenario
     * - fail at the pointer itself
     * @expected
     * - one error at `schema.port`
     */
    it('should fail with one problem', () => {
      expect(new TestErrorHandler().callError('bad')).toEqual({
        ok: false,
        errors: [{ path: 'schema.port', message: 'bad' }],
      });
    });
  });

  describe('succeed', () => {
    /**
     * @target ErrorHandler.succeed should return the handler itself
     * @dependencies
     * @scenario
     * - succeed
     * @expected
     * - a successful result holding the same object
     */
    it('should return the handler itself', () => {
      const handler = new TestErrorHandler();
      const result = handler.callSucceed();
      expect(result.ok && result.value).toBe(handler);
    });
  });
});
