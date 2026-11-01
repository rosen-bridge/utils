import { unwrap } from '../../../testUtils';
import {
  parseCondition,
  conditionRoot,
  errorPaths,
  resolvedCondition,
} from '../conditionsTestUtils';

describe('CompareCondition', () => {
  describe('parseNode', () => {
    /**
     * @target CompareCondition.parseNode should require both sides
     * @dependencies
     * - EqCondition
     * @scenario
     * - parse an `eq` without `right`, then without `left`
     * @expected
     * - one problem at the condition each time
     */
    it('should require both sides', () => {
      expect(
        errorPaths(parseCondition({ kind: 'eq', left: { path: 'port' } })),
      ).toEqual(['when']);
      expect(
        errorPaths(parseCondition({ kind: 'eq', right: { value: 1 } })),
      ).toEqual(['when']);
    });

    /**
     * @target CompareCondition.parseNode should report invalid sides and
     * static sides only
     * @dependencies
     * - EqCondition
     * @scenario
     * - parse an `eq` with an invalid evaluator, then with two values
     * @expected
     * - the problem at the invalid side, then at the condition
     */
    it('should report invalid sides and static sides only', () => {
      expect(
        errorPaths(
          parseCondition({ kind: 'eq', left: 5, right: { value: 1 } }),
        ),
      ).toEqual(['when.left']);
      expect(
        errorPaths(
          parseCondition({
            kind: 'eq',
            left: { value: 1 },
            right: { value: 1 },
          }),
        ),
      ).toEqual(['when']);
    });
  });

  describe('resolve', () => {
    /**
     * @target CompareCondition.resolve should fail for a path that is not in
     * the schema
     * @dependencies
     * - EqCondition, PathElement
     * @scenario
     * - resolve an `eq` on a missing path
     * @expected
     * - one problem at the path
     */
    it('should fail for a path that is not in the schema', () => {
      const condition = unwrap(
        parseCondition({
          kind: 'eq',
          left: { path: 'missing' },
          right: { value: 1 },
        }),
      );
      expect(errorPaths(condition.resolve(conditionRoot, []))).toEqual([
        'when.left.path',
      ]);
    });
  });

  describe('evaluate', () => {
    /**
     * @target CompareCondition.evaluate should compare the converted values
     * @dependencies
     * - EqCondition
     * @scenario
     * - evaluate `port == "8080"` with port 8080, then 80
     * @expected
     * - true, then false
     */
    it('should compare the converted values', () => {
      const condition = resolvedCondition({
        kind: 'eq',
        left: { path: 'port' },
        right: { value: '8080' },
      });
      expect(condition.evaluate({ port: 8080 }, [])).toEqual(true);
      expect(condition.evaluate({ port: 80 }, [])).toEqual(false);
    });
  });
});
