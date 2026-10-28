import type { EvaluatorElement } from '../../lib/elements/evaluators/evaluatorElement';
import { resolveCompared } from '../../lib/utils/evaluators';
import { createScope, parseType, unwrap } from '../testUtils';

/**
 * Evaluators parsed from `nodes`.
 * @param nodes - the evaluator nodes
 */
const parseEvaluators = (nodes: unknown[]): EvaluatorElement[] => {
  const scope = createScope();
  return nodes.map((node, index) =>
    unwrap(scope.elements.parseEvaluator(node, scope, `e.${index}`)),
  );
};

const root = unwrap(
  parseType({
    type: 'object',
    properties: {
      port: { type: 'number' },
      server: { type: 'object', properties: {} },
    },
  }),
);

describe('resolveCompared', () => {
  /**
   * @target resolveCompared should bind static values to the type at the
   * first path
   * @dependencies
   * - PathElement, StaticElement
   * @scenario
   * - resolve `{ path: 'port' }` and `{ value: '8080' }`
   * @expected
   * - success, and the static value converted to a number
   */
  it('should bind static values to the type at the first path', () => {
    const evaluators = parseEvaluators([{ path: 'port' }, { value: '8080' }]);

    expect(resolveCompared(evaluators, root, [])).toEqual({
      ok: true,
      value: undefined,
    });
    expect(evaluators[1].evaluate({}, [])).toEqual({
      present: true,
      value: 8080,
    });
  });

  /**
   * @target resolveCompared should fail when the first path is not a scalar
   * @dependencies
   * - PathElement
   * @scenario
   * - resolve a path to an object
   * @expected
   * - one problem at the evaluator's path
   */
  it('should fail when the first path is not a scalar', () => {
    const result = resolveCompared(
      parseEvaluators([{ path: 'server' }, { value: 1 }]),
      root,
      [],
    );
    expect(!result.ok && result.errors.map(({ path }) => path)).toEqual([
      'e.0.path',
    ]);
  });

  /**
   * @target resolveCompared should throw without a path
   * @dependencies
   * - StaticElement
   * @scenario
   * - resolve two static values
   * @expected
   * - an error is thrown
   */
  it('should throw without a path', () => {
    expect(() => {
      resolveCompared(parseEvaluators([{ value: 1 }, { value: 2 }]), root, []);
    }).toThrow(Error);
  });
});
