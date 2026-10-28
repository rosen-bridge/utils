import { NumberElement } from '../../../../lib/elements/types/scalar/numberElement';
import { errorPaths, read, type } from '../typesTestUtils';

describe('NumberElement', () => {
  describe('transform', () => {
    /**
     * @target NumberElement.transform should accept numbers and number
     * strings
     * @dependencies
     * @scenario
     * - read 2.5, `"-2.5"`, `"+007"` and `"1e3"`
     * @expected
     * - 2.5, -2.5, 7 and 1000
     */
    it('should accept numbers and number strings', () => {
      const element = type({ type: 'number' });
      expect(
        [2.5, '-2.5', '+007', '1e3'].map((value) => read(element, value)),
      ).toEqual([2.5, -2.5, 7, 1000].map((value) => ({ ok: true, value })));
    });

    /**
     * @target NumberElement.transform should reject other values and unsafe
     * numbers
     * @dependencies
     * @scenario
     * - read `"abc"`, Infinity, true and 2^60
     * @expected
     * - a problem each time
     */
    it('should reject other values and unsafe numbers', () => {
      const element = type({ type: 'number' });
      for (const value of ['abc', Infinity, true, 2 ** 60])
        expect(errorPaths(read(element, value))).toEqual(['value']);
    });
  });

  describe('literal', () => {
    /**
     * @target NumberElement.literal should write the number
     * @dependencies
     * @scenario
     * - write -2.5
     * @expected
     * - `-2.5`
     */
    it('should write the number', () => {
      expect((type({ type: 'number' }) as NumberElement).literal(-2.5)).toEqual(
        '-2.5',
      );
    });
  });
});
