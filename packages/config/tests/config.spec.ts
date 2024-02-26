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
      ).toThrow('value should be one of the choices');

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
