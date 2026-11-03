import { BuiltinElements } from '../../lib/elements/builtinElements';
import { ParseResult } from '../../lib/parsing/result';
import { createScope } from '../testUtils';

const elements = new BuiltinElements();
const scope = createScope();

/**
 * The paths of the problems of a failed result.
 * @param result - the result
 */
const errorPaths = (result: ParseResult<unknown>): string[] =>
  result.ok ? [] : result.errors.map(({ path }) => path);

describe('BuiltinElements', () => {
  describe('parseType', () => {
    /**
     * @target BuiltinElements.parseType should create the type its `type`
     * names
     * @dependencies
     * @scenario
     * - parse a string type
     * @expected
     * - a type of kind `string` at the location
     */
    it('should create the type its `type` names', () => {
      const result = elements.parseType({ type: 'string' }, scope, 'p', ['a']);
      expect(result.ok && [result.value.kind, result.value.location]).toEqual([
        'string',
        ['a'],
      ]);
    });

    /**
     * @target BuiltinElements.parseType should reject nodes that name no
     * type
     * @dependencies
     * @scenario
     * - parse a string, a node without `type` and an unknown type
     * @expected
     * - problems at the node, the node and `type`
     */
    it('should reject nodes that name no type', () => {
      expect(errorPaths(elements.parseType('x', scope, 'p', []))).toEqual([
        'p',
      ]);
      expect(errorPaths(elements.parseType({}, scope, 'p', []))).toEqual(['p']);
      expect(
        errorPaths(elements.parseType({ type: 'date' }, scope, 'p', [])),
      ).toEqual(['p.type']);
    });
  });

  describe('parseRule', () => {
    /**
     * @target BuiltinElements.parseRule should create a rule or a reference
     * @dependencies
     * @scenario
     * - parse a `minLength` rule and a `{ ref }`
     * @expected
     * - a `minLength` rule, then a missing definition at `ref`
     */
    it('should create a rule or a reference', () => {
      const rule = elements.parseRule(
        { kind: 'minLength', length: 1 },
        scope,
        'p',
        'string',
      );
      expect(rule.ok && rule.value.kind).toEqual('minLength');
      expect(
        errorPaths(elements.parseRule({ ref: 'x' }, scope, 'p', 'string')),
      ).toEqual(['p.ref']);
    });

    /**
     * @target BuiltinElements.parseRule should reject unknown kinds and kinds
     * for other types
     * @dependencies
     * @scenario
     * - parse a string, a node without `kind`, an unknown kind and `min` for
     *   a string
     * @expected
     * - problems at the node, the node, `kind` and `kind`
     */
    it('should reject unknown kinds and kinds for other types', () => {
      expect(
        ['x', {}, { kind: 'between' }, { kind: 'min', bound: 1 }].map((node) =>
          errorPaths(elements.parseRule(node, scope, 'p', 'string')),
        ),
      ).toEqual([['p'], ['p'], ['p.kind'], ['p.kind']]);
    });
  });

  describe('parseCondition', () => {
    /**
     * @target BuiltinElements.parseCondition should reject nodes that name
     * no condition
     * @dependencies
     * @scenario
     * - parse a string, a node without `kind` and an unknown kind
     * @expected
     * - problems at the node, the node and `kind`
     */
    it('should reject nodes that name no condition', () => {
      expect(
        ['x', {}, { kind: 'xor' }].map((node) =>
          errorPaths(elements.parseCondition(node, scope, 'p')),
        ),
      ).toEqual([['p'], ['p'], ['p.kind']]);
    });
  });

  describe('parseEvaluator', () => {
    /**
     * @target BuiltinElements.parseEvaluator should recognize an evaluator by
     * its only key
     * @dependencies
     * @scenario
     * - parse `{ value: 1 }`, then a node with two keys and an unknown key
     * @expected
     * - a static evaluator, then a problem at the node twice
     */
    it('should recognize an evaluator by its only key', () => {
      const evaluator = elements.parseEvaluator({ value: 1 }, scope, 'p');
      expect(evaluator.ok && evaluator.value.kind).toEqual('value');
      expect(
        errorPaths(
          elements.parseEvaluator({ path: 'a', value: 1 }, scope, 'p'),
        ),
      ).toEqual(['p']);
      expect(errorPaths(elements.parseEvaluator({ x: 1 }, scope, 'p'))).toEqual(
        ['p'],
      );
    });
  });
});
