/**
 * For each comparison, whether it holds for `port` compared with 8080 when
 * the port is 80, 8080 and 9000, and when it is not set.
 */
export const comparisons: Record<string, [boolean, boolean, boolean, boolean]> =
  {
    eq: [false, true, false, false],
    neq: [true, false, true, true],
    gt: [false, false, true, false],
    gte: [false, true, true, false],
    lt: [true, false, false, false],
    lte: [true, true, false, false],
  };
