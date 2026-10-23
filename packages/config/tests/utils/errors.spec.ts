import { failAt } from '../../lib/utils/errors';

describe('failAt', () => {
  /**
   * @target failAt should fail with one problem below the pointer
   * @dependencies
   * @scenario
   * - fail at `schema` with the segments `rules` and 0
   * @expected
   * - one error at `schema.rules.0` with the message
   */
  it('should fail with one problem below the pointer', () => {
    expect(failAt('bad', 'schema', 'rules', 0)).toEqual({
      ok: false,
      errors: [{ path: 'schema.rules.0', message: 'bad' }],
    });
  });
});
