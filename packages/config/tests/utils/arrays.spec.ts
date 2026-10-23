import { intersect } from '../../lib/utils/arrays';

describe('intersect', () => {
  /**
   * @target intersect should keep the values of every list in the order of
   * the first
   * @dependencies
   * @scenario
   * - intersect three lists
   * @expected
   * - the common values, in the order of the first list
   */
  it('should keep the values of every list in the order of the first', () => {
    expect(
      intersect([
        ['c', 'a', 'b'],
        ['a', 'b', 'c'],
        ['b', 'c'],
      ]),
    ).toEqual(['c', 'b']);
  });

  /**
   * @target intersect should return undefined for no list
   * @dependencies
   * @scenario
   * - intersect no list
   * @expected
   * - undefined
   */
  it('should return undefined for no list', () => {
    expect(intersect([])).toEqual(undefined);
  });
});
