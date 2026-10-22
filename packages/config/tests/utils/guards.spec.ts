import {
  isBigintLiteral,
  isFiniteNumber,
  isNonEmptyArray,
  isNonNegativeInteger,
  isNumberLiteral,
  isRecord,
  isScalarValue,
  isString,
} from '../../lib/utils/guards';

describe('guards', () => {
  describe('isRecord', () => {
    /**
     * @target isRecord should accept objects only
     * @dependencies
     * @scenario
     * - check an object, an array, null and a string
     * @expected
     * - only the object is a record
     */
    it('should accept objects only', () => {
      expect([{}, [], null, 'x'].map(isRecord)).toEqual([
        true,
        false,
        false,
        false,
      ]);
    });
  });

  describe('isNonNegativeInteger', () => {
    /**
     * @target isNonNegativeInteger should accept safe integers of at least 0
     * @dependencies
     * @scenario
     * - check 0, 3, -1, 1.5 and an unsafe integer
     * @expected
     * - only 0 and 3 are accepted
     */
    it('should accept safe integers of at least 0', () => {
      expect([0, 3, -1, 1.5, 2 ** 60].map(isNonNegativeInteger)).toEqual([
        true,
        true,
        false,
        false,
        false,
      ]);
    });
  });

  describe('isFiniteNumber', () => {
    /**
     * @target isFiniteNumber should reject infinities, NaN and strings
     * @dependencies
     * @scenario
     * - check 2.5, Infinity, NaN and "1"
     * @expected
     * - only 2.5 is accepted
     */
    it('should reject infinities, NaN and strings', () => {
      expect([2.5, Infinity, NaN, '1'].map(isFiniteNumber)).toEqual([
        true,
        false,
        false,
        false,
      ]);
    });
  });

  describe('isNumberLiteral', () => {
    /**
     * @target isNumberLiteral should accept decimal number literals only
     * @dependencies
     * @scenario
     * - check valid and invalid number strings
     * @expected
     * - signs, fractions and exponents are accepted; hex and words are not
     */
    it('should accept decimal number literals only', () => {
      expect(
        ['8080', '-2.5', '+007', '.5', '1e3'].every(isNumberLiteral),
      ).toEqual(true);
      expect(['0x10', 'abc', '', '1.2.3'].some(isNumberLiteral)).toEqual(false);
    });
  });

  describe('isBigintLiteral', () => {
    /**
     * @target isBigintLiteral should accept signed digits only
     * @dependencies
     * @scenario
     * - check integer strings and a fraction and an exponent
     * @expected
     * - only the integer strings are accepted
     */
    it('should accept signed digits only', () => {
      expect(['42', '-7', '+007'].every(isBigintLiteral)).toEqual(true);
      expect(['1.5', '1e3', ''].some(isBigintLiteral)).toEqual(false);
    });
  });

  describe('isNonEmptyArray', () => {
    /**
     * @target isNonEmptyArray should accept arrays with items only
     * @dependencies
     * @scenario
     * - check [1], [] and an object
     * @expected
     * - only [1] is accepted
     */
    it('should accept arrays with items only', () => {
      expect([[1], [], {}].map(isNonEmptyArray)).toEqual([true, false, false]);
    });
  });

  describe('isString', () => {
    /**
     * @target isString should accept strings only
     * @dependencies
     * @scenario
     * - check a string and a number
     * @expected
     * - only the string is accepted
     */
    it('should accept strings only', () => {
      expect([isString('a'), isString(1)]).toEqual([true, false]);
    });
  });

  describe('isScalarValue', () => {
    /**
     * @target isScalarValue should accept scalars and null
     * @dependencies
     * @scenario
     * - check every scalar kind, null, an object and undefined
     * @expected
     * - scalars and null are accepted; objects and undefined are not
     */
    it('should accept scalars and null', () => {
      expect(['a', 1, 1n, true, null].every(isScalarValue)).toEqual(true);
      expect([{}, undefined].some(isScalarValue)).toEqual(false);
    });
  });
});
