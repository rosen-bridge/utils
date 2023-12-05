import { describe, expect, it } from 'vitest';
import { Config } from '../lib';
import * as testData from './configTestData';
import { ConfigSchema } from '../lib/schema/types/fields';

describe('Config', () => {
  describe('generateDefault', () => {
    /**
     * @target generateDefault should return default values object for the
     * passed schema
     * @dependencies
     * @scenario
     * - call generateDefault
     * - check if correct default value object is returned
     * @expected
     * - correct default value object should have been returned
     */
    it(`should return default values object for the passed schema`, async () => {
      const config = new Config(
        <ConfigSchema>testData.apiSchemaDefaultValuePairSample.schema
      );
      expect(config.generateDefault()).toEqual(
        testData.apiSchemaDefaultValuePairSample.defaultVal
      );
    });
  });

  describe('validateSchema', () => {
    /**
     * @target validateSchema should not throw any exceptions when a correct
     * schema is passed
     * @dependencies
     * @scenario
     * - create a new instance of Config which calls Config.validateSchema
     * - check if any exception is thrown
     * @expected
     * - no errors should be thrown
     */
    it(`should not throw any exceptions when a correct schema is passed`, async () => {
      new Config(<ConfigSchema>testData.correctApiSchema);
    });

    /**
     * @target validateSchema should throw exception when an schema with
     * incorrect default value type is passed
     * @dependencies
     * @scenario
     * - create a new instance of Config which calls Config.validateSchema
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when an schema with incorrect default value type
    is passed`, async () => {
      expect(
        () =>
          new Config(
            <ConfigSchema>testData.schemaWithIncorrectPortDefaultValueTypeSample
          )
      ).toThrow();
    });
  });
});
