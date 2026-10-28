import { UnionOptionElement } from '../../../lib/elements/types/unionOptionElement';
import { createScope } from '../../testUtils';
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
});
