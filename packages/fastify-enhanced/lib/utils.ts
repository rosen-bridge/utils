export const hasOwnProperty = <T, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, any> => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
