import JSONbigint from 'json-bigint';

export const jsonBigInt = JSONbigint({
  useNativeBigInt: true,
  alwaysParseAsBig: true,
});

/**
 * returns min of the bigints passed as arguements
 *
 * @param {...bigint[]} nums
 * @return {bigint}
 */
export function min(...nums: bigint[]) {
  const val = nums.reduce(
    (currentMin, num) => (num <= currentMin ? num : currentMin),
    nums[0]
  );
  return val;
}
