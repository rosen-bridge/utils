import { BigintElement } from '../../../../lib/elements/types/scalar/bigintElement';
import { errors, read, type } from '../typesTestUtils';

describe('BigintElement', () => {
  describe('transform', () => {
    /**
     * @target BigintElement.transform should accept bigints, safe integers
     * and integer strings
     * @dependencies
     * @scenario
     * - read 5n, 5 and `"10000000000000000001"`
     * @expected
     * - each as a bigint
     */
    it('should accept bigints, safe integers and integer strings', () => {
      const element = type({ type: 'bigint' });
      expect(
        [5n, 5, '10000000000000000001'].map((value) => read(element, value)),
      ).toEqual(
        [5n, 5n, 10000000000000000001n].map((value) => ({ ok: true, value })),
      );
    });

    /**
     * @target BigintElement.transform should reject unsafe numbers, fractions
     * and other values
     * @dependencies
     * @scenario
     * - read 2^60, 1.5, `"1.5"` and true
     * @expected
     * - a problem each time, asking for a string for 2^60
     */
    it('should reject unsafe numbers, fractions and other values', () => {
      const element = type({ type: 'bigint' });
      expect(errors(read(element, 2 ** 60))[0].message).toContain(
        'must be written as a string',
      );
      for (const value of [1.5, '1.5', true])
        expect(errors(read(element, value)).length).toEqual(1);
    });
  });

  describe('literal', () => {
    /**
     * @target BigintElement.literal should write a bigint literal
     * @dependencies
     * @scenario
     * - write 10n
     * @expected
     * - `10n`
     */
    it('should write a bigint literal', () => {
      expect((type({ type: 'bigint' }) as BigintElement).literal(10n)).toEqual(
        '10n',
      );
    });
  });
});
