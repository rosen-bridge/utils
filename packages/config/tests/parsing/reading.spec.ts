import {
  createReading,
  withSubject,
  withValue,
} from '../../lib/parsing/reading';

describe('reading', () => {
  describe('createReading', () => {
    /**
     * @target createReading should start a reading that is not secret
     * @dependencies
     * @scenario
     * - create a reading of a configuration
     * @expected
     * - the subject and configuration, not secret, no deferred check
     */
    it('should start a reading that is not secret', () => {
      expect(createReading('default', { a: 1 })).toEqual({
        subject: 'default',
        secret: false,
        config: { a: 1 },
        deferred: [],
      });
    });
  });

  describe('withSubject', () => {
    /**
     * @target withSubject should start the text with the subject
     * @dependencies
     * @scenario
     * - add the subject `default`, then an empty one
     * @expected
     * - `default must be set`, then `must be set`
     */
    it('should start the text with the subject', () => {
      expect(withSubject('default', 'must be set')).toEqual(
        'default must be set',
      );
      expect(withSubject('', 'must be set')).toEqual('must be set');
    });
  });

  describe('withValue', () => {
    /**
     * @target withValue should end the message with a scalar value
     * @dependencies
     * @scenario
     * - describe a number and a string
     * @expected
     * - the message ends with the value, the string as JSON
     */
    it('should end the message with a scalar value', () => {
      expect(withValue(createReading(), 70000, 'too big')).toEqual(
        'too big, got 70000',
      );
      expect(withValue(createReading('default'), 'x', 'bad')).toEqual(
        'default bad, got "x"',
      );
    });

    /**
     * @target withValue should leave out secret and non-scalar values
     * @dependencies
     * @scenario
     * - describe a secret string, then an object
     * @expected
     * - the message without the value
     */
    it('should leave out secret and non-scalar values', () => {
      const secret = { ...createReading(), secret: true };
      expect(withValue(secret, 'hunter2', 'bad')).toEqual('bad');
      expect(withValue(createReading(), { a: 1 }, 'bad')).toEqual('bad');
    });
  });
});
