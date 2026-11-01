import { unwrap } from '../../../testUtils';
import {
  conditionRoot,
  errorPaths,
  parseCondition,
} from '../conditionsTestUtils';

describe('OrderCondition', () => {
  describe('resolve', () => {
    /**
     * @target OrderCondition.resolve should accept numbers, bigints and
     * strings
     * @dependencies
     * - GtCondition
     * @scenario
     * - resolve `gt` on the port, the fee and the mode
     * @expected
     * - success each time
     */
    it('should accept numbers, bigints and strings', () => {
      for (const [path, value] of [
        ['port', 1],
        ['fee', '1'],
        ['mode', 'a'],
      ]) {
        const condition = unwrap(
          parseCondition({ kind: 'gt', left: { path }, right: { value } }),
        );
        expect(condition.resolve(conditionRoot, []).ok).toEqual(true);
      }
    });

    /**
     * @target OrderCondition.resolve should reject booleans
     * @dependencies
     * - GtCondition
     * @scenario
     * - resolve `gt` on a boolean
     * @expected
     * - one problem at the condition
     */
    it('should reject booleans', () => {
      const condition = unwrap(
        parseCondition({
          kind: 'gt',
          left: { path: 'flag' },
          right: { value: true },
        }),
      );
      expect(errorPaths(condition.resolve(conditionRoot, []))).toEqual([
        'when',
      ]);
    });
  });
});
