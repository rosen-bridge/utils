/**
 * Freezes `value` and every object and array below it, and returns it.
 * Values already frozen are not walked again.
 * @param value - the value to freeze
 */
export const deepFreeze = <T>(value: T): T => {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};
