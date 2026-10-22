import { deepFreeze } from '../../lib/utils/freeze';

describe('deepFreeze', () => {
  /**
   * @target deepFreeze should freeze every object and array below the value
   * @dependencies
   * @scenario
   * - freeze an object holding an object and an array
   * @expected
   * - the same value, frozen with everything below it
   */
  it('should freeze every object and array below the value', () => {
    const value = { a: { b: 1 }, list: [{ c: 2 }] };

    const frozen = deepFreeze(value);

    expect(frozen).toBe(value);
    expect(Object.isFrozen(value)).toEqual(true);
    expect(Object.isFrozen(value.a)).toEqual(true);
    expect(Object.isFrozen(value.list[0])).toEqual(true);
  });

  /**
   * @target deepFreeze should return scalars as they are
   * @dependencies
   * @scenario
   * - freeze a number and null
   * @expected
   * - the values unchanged
   */
  it('should return scalars as they are', () => {
    expect(deepFreeze(5)).toEqual(5);
    expect(deepFreeze(null)).toEqual(null);
  });
});
