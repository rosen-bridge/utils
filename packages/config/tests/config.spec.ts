import { configDir } from './configEnvSetup';
import config from 'config';
import fs from 'fs';
import path from 'path';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { ConfigValidator } from '../lib';
import { ConfigSchema } from '../lib/schema/types/fields';
import * as testData from './configTestData';

afterAll(() => {
  fs.rmSync(configDir, { force: true, recursive: true });
});

beforeEach(() => {
  fs.readdirSync(configDir).forEach((file) => {
    fs.unlinkSync(path.join(configDir, file));
  });
  fs.cpSync(path.join(__dirname, 'configTestFiles'), configDir, {
    recursive: true,
  });
});

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

    /**
     * @target generateDefault should return default values for array fields with
     * string and number items
     * @dependencies
     * @scenario
     * - call generateDefault on schema with array fields
     * - check if correct default value object is returned
     * @expected
     * - correct default value object should have been returned including arrays
     */
    it(`should return default values for array fields with string and number items`, async () => {
      const config = new ConfigValidator(
        <ConfigSchema>testData.arraySchemaDefaultValuePairSample.schema
      );
      expect(config.generateDefault()).toEqual(
        testData.arraySchemaDefaultValuePairSample.defaultVal
      );
    });

    /**
     * @target generateDefault should handle empty array defaults
     * @dependencies
     * @scenario
     * - call generateDefault on schema with empty array default
     * - check if empty array is included in result
     * @expected
     * - empty array should be included in default values
     */
    it(`should handle empty array defaults`, async () => {
      const config = new ConfigValidator(
        <ConfigSchema>testData.emptyArrayDefaultsPair.schema
      );
      const result = config.generateDefault();
      expect(result).toEqual(testData.emptyArrayDefaultsPair.defaultVal);
    });

    /**
     * @target generateDefault should exclude arrays without default values
     * @dependencies
     * @scenario
     * - call generateDefault on schema with array field without default
     * - check if array field is excluded from result
     * @expected
     * - array field without default should be excluded from result
     */
    it(`should exclude arrays without default values`, async () => {
      const config = new ConfigValidator(
        <ConfigSchema>testData.arrayWithoutDefaultPair.schema
      );
      const result = config.generateDefault();
      expect(result).toEqual(testData.arrayWithoutDefaultPair.defaultVal);
      expect(result).not.toHaveProperty('arrayWithoutDefault');
    });

    /**
     * @target generateDefault should merge array of object item defaults with provided elements
     * @dependencies
     * @scenario
     * - define an array of object items with item-level defaults
     * - provide array default with elements that override some fields
     * - call generateDefault
     * @expected
     * - each element is merged with object item defaults
     */
    it(`should merge array of object item defaults with provided elements`, async () => {
      const config = new ConfigValidator(
        <ConfigSchema>testData.logsArraySchemaDefaultsPair.schema
      );
      const result = config.generateDefault();
      expect(result).toEqual(testData.logsArraySchemaDefaultsPair.defaultVal);
    });

    /**
     * @target generateDefault should not validate array item defaults; validateConfig should catch it
     * @dependencies
     * @scenario
     * - define an array of object items with validations (choices/required)
     * - provide an invalid array default (e.g., wrong choice and missing required)
     * - call generateDefault and ensure it returns merged defaults
     * - call validateConfig and ensure it throws
     * @expected
     * - generateDefault should succeed and return merged values
     * - validateConfig should throw due to schema violations in defaults
     */
    it(`should not validate array item defaults; validateConfig should catch it`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.invalidLogsArrayDefaultsPair.schema
      );
      const generated = confValidator.generateDefault();
      expect(generated).toEqual(
        testData.invalidLogsArrayDefaultsPair.defaultVal
      );
      expect(() => confValidator.validateConfig(generated)).toThrow();
    });

    /**
     * @target generateDefault with validate option should throw for invalid defaults
     * @dependencies
     * @scenario
     * - define invalid defaults (choices violation and missing required)
     * - call generateDefault({ validate: true })
     * @expected
     * - generation should throw due to validation
     */
    it(`should throw when generateDefault is called with validate option and defaults are invalid`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.invalidDefaultsValidateOptionSchema.schema
      );
      expect(() => confValidator.generateDefault({ validate: true })).toThrow();
    });

    /**
     * @target generateDefault should carry unknown keys in array item defaults; schema ignores them
     * @dependencies
     * @scenario
     * - define an array of object items with known keys (path, level)
     * - provide defaults containing an unknown key (pathsskddkfjd)
     * - call generateDefault and ensure unknown key is preserved alongside item defaults
     * - call validateConfig and ensure no error is thrown (unknown keys are ignored by schema)
     * @expected
     * - generateDefault returns merged defaults plus unknown key
     * - validateConfig does not throw
     */
    it(`should reject schema defaults with unknown keys at schema validation time`, async () => {
      expect(
        () =>
          new ConfigValidator(
            <ConfigSchema>testData.unknownKeyLogsArrayDefaultsPair.schema
          )
      ).toThrow('key is not found in the schema');
    });

    /**
     * @target generateDefault should handle nested array fields inside array item objects
     * @dependencies
     * @scenario
     * - define an array of objects; each object has a nested array field
     * - provide array default with and without the nested array specified
     * - call generateDefault
     * @expected
     * - item-level non-array defaults are merged
     * - nested array schema default is not merged by current implementation
     * - nested array provided in defaults is preserved
     */
    it(`should handle nested array field inside array item objects`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.nestedArrayInArrayDefaultsPair.schema
      );
      const result = confValidator.generateDefault();
      expect(result).toEqual(
        testData.nestedArrayInArrayDefaultsPair.defaultVal
      );
    });

    /**
     * @target generateDefault should omit required fields without defaults and validation should fail
     * @dependencies
     * @scenario
     * - define a required field without default
     * - call generateDefault and ensure the field is not present
     * - call validateConfig and ensure it throws due to missing required value
     * @expected
     * - defaults omit the field
     * - validation throws
     */
    it(`should omit required fields without defaults and fail validation`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.requiredWithoutDefaultSchema.schema
      );
      const defaults = confValidator.generateDefault();
      expect(defaults).toEqual({});
      expect(() => confValidator.validateConfig(defaults)).toThrow();
      expect(() => confValidator.generateDefault({ validate: true })).toThrow();
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

    /**
     * @target validateSchema should throw exception when array type doesn't
     * have an item property
     * @dependencies
     * @scenario
     * - create a new instance of Config which calls Config.validateSchema
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when array type doesn't have an item property`, async () => {
      expect(
        () =>
          new ConfigValidator(
            <ConfigSchema>testData.arrayTypeSchemaWithoutItems
          )
      ).toThrow();
    });

    /**
     * @target validateSchema should throw exception when object type doesn't
     * have a children property
     * @dependencies
     * @scenario
     * - create a new instance of Config which calls Config.validateSchema
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when object type doesn't have a children property`, async () => {
      expect(
        () =>
          new ConfigValidator(
            <ConfigSchema>testData.objectTypeSchemaWithoutChildren
          )
      ).toThrow();
    });

    /**
     * @target validateSchema should pass when array primitive defaults match items type
     * @dependencies
     * @scenario
     * - construct ConfigValidator with a valid array primitive default
     * @expected
     * - no error thrown
     */
    it(`should pass when array primitive defaults match items type`, async () => {
      new ConfigValidator(
        <ConfigSchema>testData.arrayPrimitiveDefaultsValid.schema
      );
    });

    /**
     * @target validateSchema should fail when array primitive defaults mismatch items type
     * @dependencies
     * @scenario
     * - construct ConfigValidator with an invalid array primitive default
     * @expected
     * - error thrown
     */
    it(`should fail when array primitive defaults mismatch items type`, async () => {
      expect(
        () =>
          new ConfigValidator(
            <ConfigSchema>testData.arrayPrimitiveDefaultsInvalid.schema
          )
      ).toThrow();
    });

    /**
     * @target validateSchema should fail when array object defaults have invalid child types
     * @dependencies
     * @scenario
     * - construct ConfigValidator with an invalid array object default
     * @expected
     * - error thrown
     */
    it(`should fail when array object defaults have invalid child types`, async () => {
      expect(
        () =>
          new ConfigValidator(
            <ConfigSchema>testData.arrayObjectDefaultsInvalidChildType.schema
          )
      ).toThrow();
    });

    /**
     * @target validateSchema should fail when nested array defaults have invalid element types
     * @dependencies
     * @scenario
     * - construct ConfigValidator with invalid nested array defaults
     * @expected
     * - error thrown
     */
    it(`should fail when nested array defaults have invalid element types`, async () => {
      expect(
        () =>
          new ConfigValidator(
            <ConfigSchema>testData.nestedArrayDefaultsInvalid.schema
          )
      ).toThrow();
    });

    /**
     * @target validateSchema should pass when nested array defaults are valid
     * @dependencies
     * @scenario
     * - construct ConfigValidator with valid nested array defaults
     * @expected
     * - no error thrown
     */
    it(`should pass when nested array defaults are valid`, async () => {
      new ConfigValidator(
        <ConfigSchema>testData.nestedArrayDefaultsValid.schema
      );
    });

    /**
     * @target validateSchema should validate nested array of objects defaults (pass)
     * @dependencies
     * @scenario
     * - array of objects, with a key that is an array of objects with defaults
     * - construct ConfigValidator and then generate defaults to ensure merge works
     * @expected
     * - constructor succeeds
     * - defaults merged as expected
     */
    it(`should pass for nested array of objects defaults`, async () => {
      const cv = new ConfigValidator(
        <ConfigSchema>testData.nestedArrayOfObjectsDefaultsValid.schema
      );
      const defaults = cv.generateDefault();
      expect(defaults).toEqual(
        testData.nestedArrayOfObjectsDefaultsValid.defaultVal
      );
    });

    /**
     * @target validateSchema should validate nested array of objects defaults (fail)
     * @dependencies
     * @scenario
     * - array of objects, inner array default has invalid element shapes
     * @expected
     * - constructor throws
     */
    it(`should fail for nested array of objects defaults with invalid inner elements`, async () => {
      expect(
        () =>
          new ConfigValidator(
            <ConfigSchema>testData.nestedArrayOfObjectsDefaultsInvalid.schema
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
    it(`should not throw any exceptions when a correct config is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPair.schema
      );
      confValidator.validateConfig(testData.apiSchemaConfigPair.config);
    });

    /**
     * @target validateConfig should throw exception when a config violating
     * choices constraint is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when a config violating choices constraint is
    passed`, async () => {
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
    it(`should throw exception when a config violating regex constraint is
    passed`, async () => {
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
    it(`should throw exception when a config violating the "required" constraint
    is passed`, async () => {
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
    it(`should throw exception when a config violating the value type is passed`, async () => {
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
    it(`should throw exception when a config violating the "greater than"
    constraint, is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongGreater.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongGreater.config
        )
      ).toThrow();
    });

    /**
     * @target validateSchema should throw exception when a config violating the
     * "greater than or equal" constraint, is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when a config violating the
    "greater than or equal" constraint, is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongGreaterEqual.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongGreaterEqual.config
        )
      ).toThrow();
    });

    /**
     * @target validateSchema should throw exception when a config violating the
     * "less than" constraint, is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when a config violating the "less than"
    constraint, is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongLess.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongLess.config
        )
      ).toThrow();
    });

    /**
     * @target validateSchema should throw exception when a config violating the
     * "less than or equal" constraint, is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when a config violating the "less than or equal"
    constraint, is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongLessEqual.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongLessEqual.config
        )
      ).toThrow();
    });

    /**
     * @target validateSchema should throw exception when a config violating the
     * "greater than for bigint" constraint, is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when a config violating the
    "greater than for bigint" constraint, is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongGreaterBigInt.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongGreaterBigInt.config
        )
      ).toThrow();
    });

    /**
     * @target validateSchema should throw exception when a config violating the
     * "greater than or equal for bigint" constraint, is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when a config violating the
    "greater than or equal for bigint" constraint, is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongGreaterEqualBigInt.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongGreaterEqualBigInt.config
        )
      ).toThrow();
    });

    /**
     * @target validateSchema should throw exception when a config violating the
     * "less than for bigint" constraint, is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when a config violating the
    "less than for bigint" constraint, is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongLessBigInt.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongLessBigInt.config
        )
      ).toThrow();
    });

    /**
     * @target validateSchema should throw exception when a config violating the
     * "less than or equal for bigint" constraint, is passed
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when a config violating the
    "less than or equal for bigint" constraint, is passed`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongLessEqualBigInt.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongLessEqualBigInt.config
        )
      ).toThrow();
    });

    /**
     * @target validateSchema should not throw exception when config violates
     * "required" validation but the "when" clause is false
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should not throw exception when config violates "required" validation
    but the "when" clause is false`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongRequiredFalseWhen.schema
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWrongRequiredFalseWhen.config
      );
    });

    /**
     * @target validateSchema should not throw exception when config violates
     * "regex" validation but the "when" clause is false
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should not throw exception when config violates "regex" validation but
    the "when" clause is false`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongRegexFalseWhen.schema
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWrongRegexFalseWhen.config
      );
    });

    /**
     * @target validateSchema should not throw exception when config violates
     * "choices" validation but the "when" clause is false
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should not throw exception when config violates "choices" validation but
    the "when" clause is false`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongChoiceFalseWhen.schema
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWrongChoiceFalseWhen.config
      );
    });

    /**
     * @target validateSchema should not throw exception when config violates
     * "gt" validation but the "when" clause is false
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should not throw exception when config violates "gt" validation but the
    "when" clause is false`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongGreaterFalseWhen.schema
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWrongGreaterFalseWhen.config
      );
    });

    /**
     * @target validateSchema should not throw exception when config violates
     * "gte" validation but the "when" clause is false
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should not throw exception when config violates "gte" validation but
     the "when" clause is false`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>(
          testData.apiSchemaConfigPairWrongGreaterEqualFalseWhen.schema
        )
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWrongGreaterEqualFalseWhen.config
      );
    });

    /**
     * @target validateSchema should not throw exception when config violates
     * "lt" validation but the "when" clause is false
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should not throw exception when config violates "lt" validation but the
    "when" clause is false`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongLessFalseWhen.schema
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWrongLessFalseWhen.config
      );
    });

    /**
     * @target validateSchema should not throw exception when config violates
     * "lte" validation but the "when" clause is false
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should not throw exception when config violates "lte" validation but the
    "when" clause is false`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongLessEqualFalseWhen.schema
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWrongLessEqualFalseWhen.config
      );
    });

    /**
     * @target validateSchema should not throw exception when config violates
     * "bigint gt" validation but the "when" clause is false
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should not throw exception when config violates "bigint gt" validation
     but the "when" clause is false`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>(
          testData.apiSchemaConfigPairWrongBigIntGreaterFalseWhen.schema
        )
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWrongBigIntGreaterFalseWhen.config
      );
    });

    /**
     * @target validateSchema should not throw exception when config violates
     * "bigint gte" validation but the "when" clause is false
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should not throw exception when config violates "bigint gte" validation
    but the "when" clause is false`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>(
          testData.apiSchemaConfigPairWrongBigIntGreaterEqualFalseWhen.schema
        )
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWrongBigIntGreaterEqualFalseWhen.config
      );
    });

    /**
     * @target validateSchema should not throw exception when config violates
     * "bigint lt" validation but the "when" clause is false
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should not throw exception when config violates "bigint lt" validation
    but the "when" clause is false`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>(
          testData.apiSchemaConfigPairWrongBigIntLessFalseWhen.schema
        )
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWrongBigIntLessFalseWhen.config
      );
    });

    /**
     * @target validateSchema should not throw exception when config violates
     * "bigint lte" validation but the "when" clause is false
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should not throw exception when config violates "bigint lte" validation
    but the "when" clause is false`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>(
          testData.apiSchemaConfigPairWrongBigIntLessEqualFalseWhen.schema
        )
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWrongBigIntLessEqualFalseWhen.config
      );
    });

    /**
     * @target validateSchema should throw exception using the custom message
     * when the validation has error property set
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown with the right message
     * @expected
     * - exception should be thrown with the right message
     */
    it(`should throw exception using the custom message when the validation has
    error property set`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWrongChoice.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongChoice.config
        )
      ).toThrow(
        testData.apiSchemaConfigPairWrongChoice.schema.apiType.validations[1]
          .error
      );
    });

    /**
     * @target validateSchema should not throw exception when "bigint" field is
     * passed in string format
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should not be thrown
     */
    it(`should not throw exception when "bigint" field is passed in string
    format`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWithStringBigInt.schema
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWithStringBigInt.config
      );
    });

    /**
     * @target validateSchema should not throw exception when "number" field is
     * passed in string format
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should not be thrown
     */
    it(`should not throw exception when "number" field is passed in string
    format`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.apiSchemaConfigPairWithStringNumber.schema
      );

      confValidator.validateConfig(
        testData.apiSchemaConfigPairWithStringNumber.config
      );
    });

    /**
     * @target validateConfig should throw exception when value doesn't match
     * the schema array type
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should be thrown
     */
    it(`should throw exception when value doesn't match the schema array type`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.arraySchemaConfigPairWrongValueType.schema
      );

      expect(() =>
        confValidator.validateConfig(
          testData.arraySchemaConfigPairWrongValueType.config
        )
      ).toThrow();
    });
  });

  describe('valueAt', () => {
    /**
     * @target valueAt should return the value at specified path in config
     * object
     * @dependencies
     * @scenario
     * - call valueAt with the config and path
     * - check if correct value is returned
     * @expected
     * - correct value should be returned
     */
    it(`should return the value at specified path in config object`, async () => {
      const configObject = {
        apiType: 'explorer',
        servers: {
          url: 'node256.mydomain.net',
        },
        apis: {
          explorer: {
            url: 'example.com',
            port: 600,
          },
        },
      };

      const value = ConfigValidator.valueAt(configObject, [
        'apis',
        'explorer',
        'url',
      ]);

      expect(value).toEqual('example.com');
    });

    /**
     * @target valueAt should return undefined when invalid path is passed
     * @dependencies
     * @scenario
     * - call valueAt with the config and path
     * - check if undefined is returned
     * @expected
     * - undefined should be returned
     */
    it(`should return undefined when invalid path is passed`, async () => {
      const configObject = {
        apiType: 'explorer',
        servers: {
          url: 'node256.mydomain.net',
        },
        apis: {
          explorer: {
            url: 'example.com',
            port: 600,
          },
        },
      };

      const value = ConfigValidator.valueAt(configObject, [
        'apis',
        'node',
        'url',
      ]);

      expect(value).toEqual(undefined);
    });
  });

  describe('generateTSTypes', () => {
    /**
     * @target generateTSTypes should return TypeScript interfaces for
     * this.schema
     * @dependencies
     * @scenario
     * - call generateTSTypes
     * - check if correct types string is returned
     * @expected
     * - correct types string should be returned
     */
    it(`should return TypeScript interfaces for this.schema`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.schemaTypeScriptTypesPair.schema
      );
      const types = confValidator.generateTSTypes('Infrastructure');
      expect(types).toEqual(testData.schemaTypeScriptTypesPair.types);
    });

    /**
     * @target generateTSTypes should generate unique path-based names without numeric suffixes
     * @dependencies
     * @scenario
     * - define a schema with duplicate child keys under different parents
     * - call generateTSTypes
     * - check for path-based interface names
     * @expected
     * - types should include UserDatabase and ApisExplorer
     * - types should not include numeric suffixes like Database1/Explorer1
     */
    it(`should generate unique path-based names without numeric suffixes`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.duplicateChildKeysSchema.schema
      );
      const types = confValidator.generateTSTypes('Infrastructure');

      expect(types).toContain('export interface UserDatabase');
      expect(types).toContain('export interface ApisExplorer');
      expect(types).not.toContain('Database1');
      expect(types).not.toContain('Explorer1');
    });

    /**
     * @target generateTSTypes should not emit duplicate interface declarations
     * @dependencies
     * @scenario
     * - define a schema with repeated key names under different parents
     * - call generateTSTypes
     * - count interface declarations for each name
     * @expected
     * - each interface name should be emitted only once
     */
    it(`should not emit duplicate interface declarations`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.duplicateChildKeysSchema.schema
      );
      const types = confValidator.generateTSTypes('Infrastructure');

      const countName = (name: string) =>
        (types.match(new RegExp(`export interface ${name}\\b`, 'g')) || [])
          .length;

      expect(countName('UserDatabase')).toBe(1);
      expect(countName('ApisExplorer')).toBe(1);
    });

    /**
     * @target generateTSTypes should generate distinct names for identical structures at different paths
     * @dependencies
     * @scenario
     * - define identical object structures under different parents
     * - call generateTSTypes
     * - check that interfaces are named by path
     * @expected
     * - distinct names should be generated (PrimaryConnection, BackupConnection)
     */
    it(`should generate distinct names for identical structures at different paths`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.identicalStructurePathsSchema.schema
      );
      const types = confValidator.generateTSTypes('Infrastructure');

      expect(types).toContain('export interface PrimaryConnection');
      expect(types).toContain('export interface BackupConnection');
    });

    /**
     * @target generateTSTypes should name array item object types based on path
     * @dependencies
     * @scenario
     * - define an array of objects at root level
     * - call generateTSTypes
     * - check that array item type is generated and referenced correctly
     * @expected
     * - Logs array should reference Logs item interface and it should be emitted once
     */
    it(`should name array item object types based on path`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.arrayItemsAtRootSchema.schema
      );
      const types = confValidator.generateTSTypes('Infrastructure');

      expect(types).toContain('export interface Logs');
      expect((types.match(/export interface Logs\b/g) || []).length).toBe(1);
      expect(types).toContain('logs: Logs[]');
    });
  });

  describe('getConfigForLevel', () => {
    /**
     * @target getConfigForLevel should return the correct characteristic object
     * for passed level of node config package
     * @dependencies
     * @scenario
     * - call getConfigForLevel
     * - check if correct characteristic object is returned
     * @expected
     * - correct characteristic object should be returned
     */
    it(`should return the correct characteristic object for passed level of node
    config package`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.schemaConfigCharPair.schema
      );
      const configCharacteristic = confValidator.getConfigForLevel(
        config,
        'local'
      );

      expect(configCharacteristic).toEqual(
        testData.schemaConfigCharPair.characteristic
      );
    });
  });

  describe('validateAndWriteConfig', () => {
    /**
     * @target validateAndWriteConfig should validate config when merged with
     * passed object and write it to the appropriate config file
     * @dependencies
     * @scenario
     * - call validateAndWriteConfig
     * - check validateAndWriteConfig to throw no exception
     * - check the config file to be correctly saved
     * @expected
     * - validateAndWriteConfig should throw no exception
     * - the config file should be correctly saved
     */
    it(`should validate config when merged with passed object and write it to
    the appropriate config file`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.schemaConfigCharPair.schema
      );
      const obj = { apiType: 'node' };
      confValidator.validateAndWriteConfig(obj, config, 'default', 'json');
      const savedObj = JSON.parse(
        fs.readFileSync(path.join(configDir, 'default.json'), 'utf-8')
      );

      expect(savedObj).toEqual(obj);
    });

    /**
     * @target validateAndWriteConfig should throw exception when config after
     * being merged with passed object is not valid and preserve the original
     * config file
     * @dependencies
     * @scenario
     * - call validateAndWriteConfig
     * - check validateAndWriteConfig to throw exception
     * - check the config file to be unchanged
     * @expected
     * - validateAndWriteConfig should throw exception
     * - config file should be unchanged
     */
    it(`should throw exception when config after being merged with passed object
    is not valid and preserve the original config file`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.schemaConfigCharPair.schema
      );
      const originalObj = JSON.parse(
        fs.readFileSync(path.join(configDir, 'local.json'), 'utf-8')
      );

      const obj = { apiType: 'wrong-value' };

      expect(() =>
        confValidator.validateAndWriteConfig(obj, config, 'local', 'json')
      ).toThrow();

      const savedObj = JSON.parse(
        fs.readFileSync(path.join(configDir, 'local.json'), 'utf-8')
      );
      expect(savedObj).toEqual(originalObj);
    });

    /**
     * @target validateAndWriteConfig should not throw exception when config
     * after being merged with passed object is valid even if the passed object
     * itself is not valid
     * @dependencies
     * @scenario
     * - call validateAndWriteConfig
     * - check validateAndWriteConfig not to throw exception
     * - check the config file to be correctly saved
     * @expected
     * - validateAndWriteConfig should throw exception
     * - config file should be correctly saved
     */
    it(`should throw exception when config after being merged with passed object
    is not valid and preserve the original config file`, async () => {
      const confValidator = new ConfigValidator(
        <ConfigSchema>testData.schemaConfigCharPair.schema
      );
      const originalObj = JSON.parse(
        fs.readFileSync(path.join(configDir, 'local.json'), 'utf-8')
      );

      const obj = {
        servers: {
          url: 555,
        },
      };

      confValidator.validateAndWriteConfig(obj, config, 'local', 'json');

      const savedObj = JSON.parse(
        fs.readFileSync(path.join(configDir, 'local.json'), 'utf-8')
      );
      expect(savedObj).toEqual(obj);
    });
  });
});
