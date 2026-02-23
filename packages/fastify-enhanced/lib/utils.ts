export const hasOwnProperty = <T, K extends PropertyKey>(
  obj: T,
  prop: K,
  // TODO: Fix 'any' type here local/ergo/rosen-bridge/utils#320
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): obj is T & Record<K, any> => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
