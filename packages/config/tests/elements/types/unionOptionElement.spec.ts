import { UnionOptionElement } from '../../../lib/elements/types/unionOptionElement';
import { createScope, unwrap } from '../../testUtils';
import { conditionRoot } from '../conditions/conditionsTestUtils';
import { errorPaths } from './typesTestUtils';

/**
 * An option parsed from `node` at the pointer `option`.
 * @param node - the option node
 */
const parseOption = (node: Record<string, unknown>) =>
  new UnionOptionElement(createScope(), 'option', ['store']).parse(node);

describe('UnionOptionElement', () => {
  describe('parseNode', () => {
    /**
     * @target UnionOptionElement.parseNode should require an option type
     * @dependencies
     * @scenario
     * - parse an option without `option`, then with an invalid `when`
     * @expected
     * - a problem at the option, then at `when`
     */
    it('should require an option type', () => {
      expect(errorPaths(parseOption({}))).toEqual(['option']);
      expect(
        errorPaths(parseOption({ option: { type: 'string' }, when: 5 })),
      ).toEqual(['option.when']);
    });
  });

  describe('applies', () => {
    /**
     * @target UnionOptionElement.applies should hold without a `when` or
     * when it holds
     * @dependencies
     * - EqCondition
     * @scenario
     * - check an option without `when`, then one with a `when` on `mode`
     * @expected
     * - always, then only in `prod` mode
     */
    it('should hold without a `when` or when it holds', () => {
      expect(
        unwrap(parseOption({ option: { type: 'string' } })).applies({}, []),
      ).toEqual(true);
      const option = unwrap(
        parseOption({
          option: { type: 'string' },
          when: {
            kind: 'eq',
            left: { path: 'mode' },
            right: { value: 'prod' },
          },
        }),
      );
      unwrap(option.resolve(conditionRoot));
      expect(option.applies({ mode: 'prod' }, [])).toEqual(true);
      expect(option.applies({ mode: 'dev' }, [])).toEqual(false);
    });
  });

  describe('resolve', () => {
    /**
     * @target UnionOptionElement.resolve should report the problems of its
     * `when`
     * @dependencies
     * - ExistsCondition
     * @scenario
     * - resolve an option whose `when` reads a missing path
     * @expected
     * - a problem at the path
     */
    it('should report the problems of its `when`', () => {
      const option = unwrap(
        parseOption({
          option: { type: 'string' },
          when: { kind: 'exists', operand: { path: 'nope' } },
        }),
      );
      expect(errorPaths(option.resolve(conditionRoot))).toEqual([
        'option.when.operand.path',
      ]);
    });
  });
});
