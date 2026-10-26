import { BooleanElement } from '../../../../lib/elements/types/scalar/booleanElement';
import { errorPaths, read, type } from '../typesTestUtils';

describe('BooleanElement', () => {
  describe('transform', () => {
    /**
     * @target BooleanElement.transform should accept booleans and their
     * strings
     * @dependencies
     * @scenario
     * - read true, `"false"`, `"yes"` and 1
     * @expected
     * - true and false, then a problem for the others
     */
    it('should accept booleans and their strings', () => {
      const element = type({ type: 'boolean' });
      expect(read(element, true)).toEqual({ ok: true, value: true });
      expect(read(element, 'false')).toEqual({ ok: true, value: false });
      for (const value of ['yes', 1])
        expect(errorPaths(read(element, value))).toEqual(['value']);
    });
  });

  describe('literal', () => {
    /**
     * @target BooleanElement.literal should write the boolean
     * @dependencies
     * @scenario
     * - write false
     * @expected
     * - `false`
     */
    it('should write the boolean', () => {
      expect(
        (type({ type: 'boolean' }) as BooleanElement).literal(false),
      ).toEqual('false');
    });
  });
});
