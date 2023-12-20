import { describe, expect, it } from 'vitest';
import { ConfigValidator } from '../lib';
import * as testData from './configTestData';
import { ConfigSchema } from '../lib/schema/types/fields';

describe('ConfigValidator', () => {
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
      const config = new ConfigValidator(
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
      new ConfigValidator(<ConfigSchema>testData.correctApiSchema);
    });

    /**
     * @target validateSchema should throw exception when a schema with
     * incorrect default value type is passed
     * @dependencies
     * @scenario
     * - create a new instance of Config which calls Config.validateSchema
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when a schema with incorrect default value type
    is passed`, async () => {
      expect(
        () =>
          new ConfigValidator(
            <ConfigSchema>testData.schemaWithIncorrectPortDefaultValueTypeSample
          )
      ).toThrow();
    });
  });

  describe('validateConfig', () => {
    /**
     * @target validateConfig should not throw any exceptions when a correct
     * config is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - no errors should be thrown
     */
    it(`validateConfig should not throw any exceptions when a correct config is
    passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPair.schema
      );
      confValidator.validateConfig(testData.apiSchemaConfigPair.config);
    });

    /**
     * @target validateSchema should throw exception when a config violating
     * choices constraint is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`validateSchema should throw exception when a config violating choices
    constraint is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongChoice.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongChoice.config
        )
      ).toThrow();
    });

    /**
     * @target validateSchema should throw exception when a config violating
     * regex constraint is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`validateSchema should throw exception when a config violating regex
    constraint is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongRegex.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongRegex.config
        )
      ).toThrow();
    });

    /**
     * @target validateSchema should throw exception when a config violating the
     * "required" constraint is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`validateSchema should throw exception when a config violating the
    "required" constraint is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongRequired.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongRequired.config
        )
      ).toThrow();
    });

    /**
     * @target validateSchema should throw exception when a config violating the
     * value type is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`validateSchema should throw exception when a config violating the value
    type is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongPortType.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongPortType.config
        )
      ).toThrow();
    });

    /**
     * @target validateSchema should throw exception when a config violating the
     * "greater than" constraint, is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`validateSchema should throw exception when a config violating the
    "greater than" constraint, is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongGreater.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongGreater.config
        )
      ).toThrow();
    });
  });
});
