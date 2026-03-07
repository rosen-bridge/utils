import { configDir } from './bootstrap';

import config from 'config';
import fs from 'fs';
import path from 'path';

import { ConfigValidator } from '../lib';
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
    afterEach(() => {
      vi.restoreAllMocks();
    });
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValue(testData.apiSchemaDefaultValuePairSample.schema);
      const config = new ConfigValidator('whatever.json');

      expect(config.generateDefault()).toEqual(
        testData.apiSchemaDefaultValuePairSample.defaultVal,
      );
    });

    /**
     * @target generateDefault({ validate: true }) should fail when defaults violate choices
     * @dependencies
     * @scenario
     * - define a primitive with choices and a wrong default
     * - define a nested array object where a field has choices and wrong default
     * - call generateDefault({ validate: true }) and expect failure
     * @expected
     * - generateDefault with validate should throw
     */
    it(`should fail validate=true when defaults violate choices (primitive and nested)`, async () => {
      vi.spyOn(ConfigValidator.prototype as any, 'fromSchemaFile')
        .mockReturnValueOnce(testData.wrongChoiceDefaultSchema.schema)
        .mockReturnValueOnce(testData.nestedWrongChoiceDefaultSchema.schema);

      const cv1 = new ConfigValidator('schema1.json');
      expect(() => cv1.generateDefault({ validate: true })).toThrow();

      const cv2 = new ConfigValidator('schema2.json');
      expect(() => cv2.generateDefault({ validate: true })).toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.arraySchemaDefaultValuePairSample.schema);
      const config = new ConfigValidator('arraySchemaDefaultValuePairSample');
      expect(config.generateDefault()).toEqual(
        testData.arraySchemaDefaultValuePairSample.defaultVal,
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.emptyArrayDefaultsPair.schema);
      const config = new ConfigValidator('empty-array');
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.arrayWithoutDefaultPair.schema);
      const config = new ConfigValidator('arrayWithoutDefaultPair');
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.logsArraySchemaDefaultsPair.schema);
      const config = new ConfigValidator('logsArraySchemaDefaultsPair');
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.invalidLogsArrayDefaultsPair.schema);
      const confValidator = new ConfigValidator('invalidLogsArrayDefaultsPair');
      const generated = confValidator.generateDefault();
      expect(generated).toEqual(
        testData.invalidLogsArrayDefaultsPair.defaultVal,
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.invalidDefaultsValidateOptionSchema.schema,
      );
      const confValidator = new ConfigValidator(
        'invalidDefaultsValidateOptionSchema',
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.unknownKeyLogsArrayDefaultsPair.schema);
      expect(
        () => new ConfigValidator('unknownKeyLogsArrayDefaultsPair'),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.nestedArrayInArrayDefaultsPair.schema);
      const confValidator = new ConfigValidator(
        'nestedArrayInArrayDefaultsPair',
      );
      const result = confValidator.generateDefault();
      expect(result).toEqual(
        testData.nestedArrayInArrayDefaultsPair.defaultVal,
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.requiredWithoutDefaultSchema.schema);
      const confValidator = new ConfigValidator('requiredWithoutDefaultSchema');
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.correctApiSchema);
      expect(() => {
        new ConfigValidator('correctApiSchema');
      }).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.schemaWithIncorrectPortDefaultValueTypeSample,
      );
      expect(
        () =>
          new ConfigValidator('schemaWithIncorrectPortDefaultValueTypeSample'),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.arrayTypeSchemaWithoutItems);
      expect(
        () => new ConfigValidator('arrayTypeSchemaWithoutItems'),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.objectTypeSchemaWithoutChildren);
      expect(
        () => new ConfigValidator('objectTypeSchemaWithoutChildren'),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.arrayPrimitiveDefaultsValid.schema);
      expect(() => {
        new ConfigValidator('arrayPrimitiveDefaultsValid');
      }).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.arrayPrimitiveDefaultsInvalid.schema);
      expect(
        () => new ConfigValidator('arrayPrimitiveDefaultsInvalid'),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.arrayObjectDefaultsInvalidChildType.schema,
      );
      expect(
        () => new ConfigValidator('arrayObjectDefaultsInvalidChildType'),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.nestedArrayDefaultsInvalid.schema);
      expect(() => new ConfigValidator('nestedArrayDefaultsInvalid')).toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.nestedArrayDefaultsValid.schema);
      expect(() => {
        new ConfigValidator('nestedArrayDefaultsValid');
      }).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.nestedArrayOfObjectsDefaultsValid.schema);
      const cv = new ConfigValidator('nestedArrayOfObjectsDefaultsValid');
      const defaults = cv.generateDefault();
      expect(defaults).toEqual(
        testData.nestedArrayOfObjectsDefaultsValid.defaultVal,
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.nestedArrayOfObjectsDefaultsInvalid.schema,
      );
      expect(
        () => new ConfigValidator('nestedArrayOfObjectsDefaultsInvalid'),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.apiSchemaConfigPair.schema);
      const confValidator = new ConfigValidator('apiSchemaConfigPair');
      expect(() =>
        confValidator.validateConfig(testData.apiSchemaConfigPair.config),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.apiSchemaConfigPairWrongChoice.schema);
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongChoice',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongChoice.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.apiSchemaConfigPairWrongRegex.schema);
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongRegex',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongRegex.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.apiSchemaConfigPairWrongRequired.schema);
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongRequired',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongRequired.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.apiSchemaConfigPairWrongPortType.schema);
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongPortType',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongPortType.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.apiSchemaConfigPairWrongGreater.schema);
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongGreater',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongGreater.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongGreaterEqual.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongGreaterEqua',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongGreaterEqual.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.apiSchemaConfigPairWrongLess.schema);
      const confValidator = new ConfigValidator('apiSchemaConfigPairWrongLess');

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongLess.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.apiSchemaConfigPairWrongLessEqual.schema);
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongLessEqual',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongLessEqual.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongGreaterBigInt.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongGreaterBigInt',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongGreaterBigInt.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongGreaterEqualBigInt.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongGreaterEqualBigInt',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongGreaterEqualBigInt.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.apiSchemaConfigPairWrongLessBigInt.schema);
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongLessBigInt',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongLessBigInt.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongLessEqualBigInt.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongLessEqualBigInt',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongLessEqualBigInt.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongRequiredFalseWhen.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongRequiredFalseWhen',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongRequiredFalseWhen.config,
        ),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongRegexFalseWhen.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongRegexFalseWhen',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongRegexFalseWhen.config,
        ),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongChoiceFalseWhen.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongChoiceFalseWhen',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongChoiceFalseWhen.config,
        ),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongGreaterFalseWhen.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongGreaterFalseWhen',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongGreaterFalseWhen.config,
        ),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongGreaterEqualFalseWhen.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongGreaterEqualFalseWhen',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongGreaterEqualFalseWhen.config,
        ),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongLessFalseWhen.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongLessFalseWhen',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongLessFalseWhen.config,
        ),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongLessEqualFalseWhen.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongLessEqualFalseWhen',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongLessEqualFalseWhen.config,
        ),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongBigIntGreaterFalseWhen.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongBigIntGreaterFalseWhen',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongBigIntGreaterFalseWhen.config,
        ),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongBigIntGreaterEqualFalseWhen.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongBigIntGreaterEqualFalseWhen',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongBigIntGreaterEqualFalseWhen.config,
        ),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongBigIntLessFalseWhen.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongBigIntLessFalseWhen',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongBigIntLessFalseWhen.config,
        ),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWrongBigIntLessEqualFalseWhen.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongBigIntLessEqualFalseWhen',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongBigIntLessEqualFalseWhen.config,
        ),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.apiSchemaConfigPairWrongChoice.schema);
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWrongChoice',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWrongChoice.config,
        ),
      ).toThrow(
        testData.apiSchemaConfigPairWrongChoice.schema.apiType.validations[1]
          .error,
      );
    });

    /**
     * @target validateSchema should not throw exception when "bigint" field is
     * passed in string format in config and default field in schema
     * @dependencies
     * @scenario
     * - call validateConfig with the config
     * - check if any exception is thrown
     * @expected
     * - exception should not be thrown
     */
    it(`should not throw exception when "bigint" field is passed in string format in config and default field in schema`, async () => {
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWithStringBigInt.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWithStringBigInt',
      );

      expect(() => {
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWithStringBigInt.config,
        );
      }).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.apiSchemaConfigPairWithStringNumber.schema,
      );
      const confValidator = new ConfigValidator(
        'apiSchemaConfigPairWithStringNumber',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.apiSchemaConfigPairWithStringNumber.config,
        ),
      ).not.toThrow();
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(
        testData.arraySchemaConfigPairWrongValueType.schema,
      );
      const confValidator = new ConfigValidator(
        'arraySchemaConfigPairWrongValueType',
      );

      expect(() =>
        confValidator.validateConfig(
          testData.arraySchemaConfigPairWrongValueType.config,
        ),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.schemaTypeScriptTypesPair.schema);
      const confValidator = new ConfigValidator('schemaTypeScriptTypesPair');
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.duplicateChildKeysSchema.schema);
      const confValidator = new ConfigValidator('duplicateChildKeysSchema');
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.duplicateChildKeysSchema.schema);
      const confValidator = new ConfigValidator('duplicateChildKeysSchema');
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.identicalStructurePathsSchema.schema);
      const confValidator = new ConfigValidator(
        'identicalStructurePathsSchema',
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.arrayItemsAtRootSchema.schema);
      const confValidator = new ConfigValidator('arrayItemsAtRootSchema');
      const types = confValidator.generateTSTypes('Infrastructure');

      expect(types).toContain('export interface Logs');
      expect((types.match(/export interface Logs\b/g) || []).length).toBe(1);
      expect(types).toContain('logs: Logs[]');
    });

    /**
     * @target generateTSTypes should support hyphenated keys (kebab-case) in type names and quoted props
     * @dependencies
     * @scenario
     * - define a schema with a key like "bitcoin-runes" under "chains"
     * - call generateTSTypes
     * @expected
     * - interface name is PascalCase without hyphen (ChainsBitcoinRunes)
     * - property is quoted: "bitcoin-runes": ChainsBitcoinRunes
     */
    it(`should support hyphenated keys (bitcoin-runes -> ChainsBitcoinRunes, quoted prop)`, async () => {
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.schemaHyphenatedKeysTypeScriptPair.schema);
      const confValidator = new ConfigValidator(
        'schemaHyphenatedKeysTypeScriptPair',
      );
      const types = confValidator.generateTSTypes('Root');
      expect(types).toEqual(testData.schemaHyphenatedKeysTypeScriptPair.types);
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.schemaConfigCharPair.schema);
      const confValidator = new ConfigValidator('schemaConfigCharPair');
      const configCharacteristic = confValidator.getConfigForLevel(
        config,
        'local',
      );

      expect(configCharacteristic).toEqual(
        testData.schemaConfigCharPair.characteristic,
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.schemaConfigCharPair.schema);
      const confValidator = new ConfigValidator('schemaConfigCharPair');
      const obj = { apiType: 'node' };
      confValidator.validateAndWriteConfig(obj, config, 'default', 'json');
      const savedObj = JSON.parse(
        fs.readFileSync(path.join(configDir, 'default.json'), 'utf-8'),
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
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.schemaConfigCharPair.schema);
      const confValidator = new ConfigValidator('schemaConfigCharPair');
      const originalObj = JSON.parse(
        fs.readFileSync(path.join(configDir, 'local.json'), 'utf-8'),
      );

      const obj = { apiType: 'wrong-value' };

      expect(() =>
        confValidator.validateAndWriteConfig(obj, config, 'local', 'json'),
      ).toThrow();

      const savedObj = JSON.parse(
        fs.readFileSync(path.join(configDir, 'local.json'), 'utf-8'),
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
    is not valid and preserve the original config file (duplicate?!)`, async () => {
      vi.spyOn(
        ConfigValidator.prototype as any,
        'fromSchemaFile',
      ).mockReturnValueOnce(testData.schemaConfigCharPair.schema);
      const confValidator = new ConfigValidator('schemaConfigCharPair');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const originalObj = JSON.parse(
        fs.readFileSync(path.join(configDir, 'local.json'), 'utf-8'),
      );

      const obj = {
        servers: {
          url: 555,
        },
      };

      confValidator.validateAndWriteConfig(obj, config, 'local', 'json');

      const savedObj = JSON.parse(
        fs.readFileSync(path.join(configDir, 'local.json'), 'utf-8'),
      );
      expect(savedObj).toEqual(obj);
    });
  });
});
