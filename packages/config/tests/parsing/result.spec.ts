import { all, combine, fail, ok, uniqueErrors } from '../../lib/parsing/result';

const errorA = { path: 'a', message: 'bad a' };
const errorB = { path: 'b', message: 'bad b' };

describe('result', () => {
  describe('ok', () => {
    /**
     * @target ok should hold the value
     * @dependencies
     * @scenario
     * - create a successful result
     * @expected
     * - `ok` true with the value
     */
    it('should hold the value', () => {
      expect(ok(5)).toEqual({ ok: true, value: 5 });
    });
  });

  describe('fail', () => {
    /**
     * @target fail should hold the errors
     * @dependencies
     * @scenario
     * - create a failed result
     * @expected
     * - `ok` false with the errors
     */
    it('should hold the errors', () => {
      expect(fail([errorA])).toEqual({ ok: false, errors: [errorA] });
    });
  });

  describe('combine', () => {
    /**
     * @target combine should give the tuple of the values
     * @dependencies
     * @scenario
     * - combine two successful results
     * @expected
     * - both values in order
     */
    it('should give the tuple of the values', () => {
      expect(combine([ok(1), ok('a')])).toEqual({ ok: true, value: [1, 'a'] });
    });

    /**
     * @target combine should collect the errors of every failed result
     * @dependencies
     * @scenario
     * - combine two failed results and a successful one
     * @expected
     * - the errors of both failures
     */
    it('should collect the errors of every failed result', () => {
      expect(combine([fail([errorA]), ok(1), fail([errorB])])).toEqual({
        ok: false,
        errors: [errorA, errorB],
      });
    });
  });

  describe('all', () => {
    /**
     * @target all should give the list of the values or every error
     * @dependencies
     * @scenario
     * - combine successful results, then one with a failure
     * @expected
     * - the values, then the error alone
     */
    it('should give the list of the values or every error', () => {
      expect(all([ok(1), ok(2)])).toEqual({ ok: true, value: [1, 2] });
      expect(all([ok(1), fail([errorA])])).toEqual({
        ok: false,
        errors: [errorA],
      });
    });
  });

  describe('uniqueErrors', () => {
    /**
     * @target uniqueErrors should keep the first of repeated errors
     * @dependencies
     * @scenario
     * - filter a list with an error repeated
     * @expected
     * - each path and message once, in order
     */
    it('should keep the first of repeated errors', () => {
      expect(uniqueErrors([errorA, errorB, { ...errorA }])).toEqual([
        errorA,
        errorB,
      ]);
    });
  });
});
