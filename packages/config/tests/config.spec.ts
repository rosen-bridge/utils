import { describe, expect, it } from 'vitest';
import { Config } from '../lib';
import * as testData from './configTestData';
import { ConfigSchema } from '../lib/schema/types/fields';

describe('Config', () => {
  describe('generateDefault', () => {
    /**
     * @target should return default values object for the passed schema
     * @dependencies
     * @scenario
     * - call generateDefault
     * - check if correct default value object is returned
     * @expected
     * - correct default value object should have been returned
     */
    it(`should return default values object for the passed schema`, async () => {
      testData.defaulTestSamples.forEach(({ schema, defaultVal }) => {
        const config = new Config(<ConfigSchema>schema);
        expect(config.generateDefault()).toEqual(defaultVal);
      });
    });
  });

  describe('validateSchema', () => {
    /**
     * @target should not throw any exception when a correct schema is passed
     * @dependencies
     * @scenario
     * - create a new instance of Config which calls Config.validateSchema
     * - check if any exception is thrown
     * @expected
     * - no errors should be thrown
     */
    it.each(testData.correctSchemas)(
      `should return default values object for the passed schema`,
      async (schema) => {
        new Config(<ConfigSchema>schema);
      }
    );

    /**
     * @target should throw exception when an incorrect schema is passed
     * @dependencies
     * @scenario
     * - create a new instance of Config which calls Config.validateSchema
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it.each(testData.incorrectSchemas)(
      `should return default values object for the passed schema`,
      async (schema) => {
        expect(() => new Config(<ConfigSchema>schema)).toThrow();
      }
    );
  });
});
