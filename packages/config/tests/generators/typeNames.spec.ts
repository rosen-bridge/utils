import { TypeNames } from '../../lib/generators/typeNames';

describe('TypeNames', () => {
  describe('name', () => {
    /**
     * @target TypeNames.name should use the last segment of a unique name
     * @dependencies
     * @scenario
     * - collect one type, finish, then name it again
     * @expected
     * - the last segment as a type name both times
     */
    it('should use the last segment of a unique name', () => {
      const names = new TypeNames();
      expect(names.name(['config', 'limits'], 'a')).toEqual('Limits');
      names.finish();
      expect(names.name(['config', 'limits'], 'a')).toEqual('Limits');
    });

    /**
     * @target TypeNames.name should use the whole path when two types share
     * a name
     * @dependencies
     * @scenario
     * - collect two types named `limits` at other pointers, then finish
     * @expected
     * - each named after its whole path
     */
    it('should use the whole path when two types share a name', () => {
      const names = new TypeNames();
      names.name(['config', 'limits'], 'a');
      names.name(['config', 'server', 'limits'], 'b');
      names.finish();

      expect(names.name(['config', 'limits'], 'a')).toEqual('ConfigLimits');
      expect(names.name(['config', 'server', 'limits'], 'b')).toEqual(
        'ConfigServerLimits',
      );
    });
  });
});
