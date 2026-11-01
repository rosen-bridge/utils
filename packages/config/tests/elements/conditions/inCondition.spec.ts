import {
  errorPaths,
  parseCondition,
  resolvedCondition,
} from './conditionsTestUtils';

describe('InCondition', () => {
  describe('parseNode', () => {
    /**
     * @target InCondition.parseNode should require an operand and a
     * non-empty list of choices with a path
     * @dependencies
     * @scenario
     * - parse `in` without choices, with no choice and with values only
     * @expected
     * - problems at the condition, `choices` and the condition
     */
    it('should require an operand and a non-empty list of choices with a path', () => {
      expect(
        errorPaths(parseCondition({ kind: 'in', operand: { path: 'mode' } })),
      ).toEqual(['when']);
      expect(
        errorPaths(
          parseCondition({
            kind: 'in',
            operand: { path: 'mode' },
            choices: [],
          }),
        ),
      ).toEqual(['when.choices']);
      expect(
        errorPaths(
          parseCondition({
            kind: 'in',
            operand: { value: 'a' },
            choices: [{ value: 'a' }],
          }),
        ),
      ).toEqual(['when']);
    });
  });

  describe('evaluate', () => {
    /**
     * @target InCondition.evaluate should hold when the operand is one of the
     * choices
     * @dependencies
     * - PathElement, StaticElement
     * @scenario
     * - evaluate "mode in [a, b]" for a, c and no mode
     * @expected
     * - true, false, false
     */
    it('should hold when the operand is one of the choices', () => {
      const condition = resolvedCondition({
        kind: 'in',
        operand: { path: 'mode' },
        choices: [{ value: 'a' }, { value: 'b' }],
      });
      expect(
        [{ mode: 'a' }, { mode: 'c' }, {}].map((config) =>
          condition.evaluate(config, []),
        ),
      ).toEqual([true, false, false]);
    });
  });
});
