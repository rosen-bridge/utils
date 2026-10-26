import { StringElement } from '../../../../lib/elements/types/scalar/stringElement';
import { errors, read, type } from '../typesTestUtils';

describe('StringElement', () => {
  describe('transform', () => {
    /**
     * @target StringElement.transform should accept strings only
     * @dependencies
     * @scenario
     * - read `a` and 5
     * @expected
     * - `a`, then a problem with the value
     */
    it('should accept strings only', () => {
      const element = type({ type: 'string' });
      expect(read(element, 'a')).toEqual({ ok: true, value: 'a' });
      expect(errors(read(element, 5))).toEqual([
        { path: 'value', message: 'must be a string, got 5' },
      ]);
    });
  });

  describe('literal', () => {
    /**
     * @target StringElement.literal should quote the string
     * @dependencies
     * @scenario
     * - write `it's`
     * @expected
     * - a single-quoted literal
     */
    it('should quote the string', () => {
      expect(
        (type({ type: 'string' }) as StringElement).literal("it's"),
      ).toEqual("'it\\'s'");
    });
  });
});
