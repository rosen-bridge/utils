/**
 * The values in every one of `lists`, in the order of the first list, or
 * `undefined` when there is no list.
 * @param lists - the lists to intersect
 */
export const intersect = <T>(
  lists: readonly (readonly T[])[],
): T[] | undefined =>
  lists.length === 0
    ? undefined
    : lists.reduce<T[]>(
        (common, list) => common.filter((value) => list.includes(value)),
        [...lists[0]],
      );
