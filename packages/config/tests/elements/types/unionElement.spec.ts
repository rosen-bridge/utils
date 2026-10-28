import { parseType } from '../../testUtils';
import { errorPaths } from './typesTestUtils';

describe('UnionElement', () => {
  describe('parseExtra', () => {
    /**
     * @target UnionElement.parseExtra should require at least two options
     * @dependencies
     * @scenario
     * - parse a union without options, with one option and with an option
     *   that is not an object
     * @expected
     * - problems at the type, `options` and the option
     */
    it('should require at least two options', () => {
      expect(errorPaths(parseType({ type: 'union' }))).toEqual(['schema']);
      expect(
        errorPaths(
          parseType({
            type: 'union',
            options: [{ option: { type: 'string' } }],
          }),
        ),
      ).toEqual(['schema.options']);
      expect(
        errorPaths(
          parseType({
            type: 'union',
            options: [{ option: { type: 'string' } }, 5],
          }),
        ),
      ).toEqual(['schema.options.1']);
    });
  });
});
