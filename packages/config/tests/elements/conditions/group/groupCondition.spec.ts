import { unwrap } from '../../../testUtils';
import {
  conditionRoot,
  errorPaths,
  parseCondition,
} from '../conditionsTestUtils';

describe('GroupCondition', () => {
  describe('parseNode', () => {
    /**
     * @target GroupCondition.parseNode should require a non-empty list of
     * conditions
     * @dependencies
     * - AllCondition
     * @scenario
     * - parse `all` without conditions, with an empty list and with an
     *   invalid condition
     * @expected
     * - problems at the condition, `conditions` and the invalid item
     */
    it('should require a non-empty list of conditions', () => {
      expect(errorPaths(parseCondition({ kind: 'all' }))).toEqual(['when']);
      expect(
        errorPaths(parseCondition({ kind: 'all', conditions: [] })),
      ).toEqual(['when.conditions']);
      expect(
        errorPaths(parseCondition({ kind: 'all', conditions: [5] })),
      ).toEqual(['when.conditions.0']);
    });
  });

  describe('resolve', () => {
    /**
     * @target GroupCondition.resolve should resolve every listed condition
     * @dependencies
     * - AnyCondition, ExistsCondition
     * @scenario
     * - resolve `any` of a valid and a missing path
     * @expected
     * - one problem at the missing path
     */
    it('should resolve every listed condition', () => {
      const condition = unwrap(
        parseCondition({
          kind: 'any',
          conditions: [
            { kind: 'exists', operand: { path: 'port' } },
            { kind: 'exists', operand: { path: 'nope' } },
          ],
        }),
      );
      expect(errorPaths(condition.resolve(conditionRoot, []))).toEqual([
        'when.conditions.1.operand.path',
      ]);
    });
  });
});
