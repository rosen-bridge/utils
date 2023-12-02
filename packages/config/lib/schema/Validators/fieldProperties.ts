import { Config } from '../../config';
import * as types from '../types/fields';
import { VAll, VNumeric, VString } from '../types/validations';

export const propertyValidators = {
  all: {
    type: (field: types.ConfigField, config: Config) => {
      if (!Object.hasOwn(field, 'type') || typeof field.type !== 'string') {
        throw new Error(
          `every schema field must have a "type" property of type "string"`
        );
      }

      if (!supportedTypes.includes(field.type)) {
        throw new Error(`unsupported field type "${field.type}"`);
      }
    },
    label: (field: types.ConfigField, config: Config) => {
      if (Object.hasOwn(field, 'label') && typeof field.label !== 'string') {
        throw new Error(`"label" property should be a "string"`);
      }
    },
    description: (field: types.ConfigField, config: Config) => {
      if (
        Object.hasOwn(field, 'description') &&
        typeof field.description !== 'string'
      ) {
        throw new Error(`"description" property should be a "string"`);
      }
    },
  },
  primitive: {
    validations: (field: types.PrimitiveField, config: Config) => {
      if (!Object.hasOwn(field, 'validations')) {
        return;
      }

      if (!Array.isArray(field.validations)) {
        throw new Error(
          '"validations" property must be an array of validation descriptions'
        );
      }

      for (const validation of field.validations) {
        if (
          Object.hasOwn(validation, 'error') &&
          typeof validation.error !== 'string'
        ) {
          throw new Error(
            '"error" property of a validation description must be a string'
          );
        }

        if (Object.hasOwn(validation, 'when') && validation.when != undefined) {
          if (
            !Object.hasOwn(validation.when, 'path') ||
            typeof validation.when.path !== 'string'
          ) {
            throw new Error(
              `"when" property of a validation description must have a "path" property of type "string"`
            );
          }

          if (
            config.getSchemaField(validation.when.path.split('.')) == undefined
          ) {
            throw new Error(
              `"when" property of a validation description has a non-existent path=[${validation.when.path}]`
            );
          }

          if (!Object.hasOwn(validation.when, 'value')) {
            throw new Error(
              `"when" property of a validation description must have a "value" property`
            );
          }
        }

        const validationProperties = Object.keys(validation).filter(
          (key) => key !== 'when' && key !== 'error'
        );
        if (validationProperties.length !== 1) {
          throw new Error('validation description format is wrong');
        }

        const validationName = validationProperties[0];
        const primitiveValidator = fieldValidations.primitive[validationName];
        const typeValidator = fieldValidations[field.type][validationName];
        if (primitiveValidator == undefined && typeValidator == undefined) {
          throw new Error(
            `validation description has an unknown validator "${validationName}"`
          );
        }

        if (primitiveValidator != undefined) {
          primitiveValidator(validation);
        } else {
          typeValidator(validation);
        }
      }
    },
  },
  object: {
    children: (field: types.ObjectField, config: Config) => {
      return;
    },
  },
  string: {
    default: (field: types.StringField, config: Config) => {
      if (
        Object.hasOwn(field, 'default') &&
        typeof field.default !== 'string'
      ) {
        throw new Error(
          `default value=[${field.default}] doesn't match field type=[${field.type}]`
        );
      }
    },
  },
  boolean: {
    default: (field: types.BooleanField, config: Config) => {
      if (
        Object.hasOwn(field, 'default') &&
        typeof field.default !== 'boolean'
      ) {
        throw new Error(
          `default value=[${field.default}] doesn't match field type=[${field.type}]`
        );
      }
    },
  },
  number: {
    default: (field: types.NumberField, config: Config) => {
      if (
        Object.hasOwn(field, 'default') &&
        typeof field.default !== 'number'
      ) {
        throw new Error(
          `default value=[${field.default}] doesn't match field type=[${field.type}]`
        );
      }
    },
  },
  bigint: {
    default: (field: types.BigIntField, config: Config) => {
      if (
        Object.hasOwn(field, 'default') &&
        typeof field.default !== 'bigint'
      ) {
        throw new Error(
          `default value=[${field.default}] doesn't match field type=[${field.type}]`
        );
      }
    },
  },
};

export const supportedTypes = Object.keys(propertyValidators).filter(
  (key) => key !== 'all' && key !== 'primitive'
);

const fieldValidations: Record<string, Record<string, any>> = {
  primitive: {
    required: (validation: VAll) => {
      if (!('required' in validation)) {
        return;
      }

      if (typeof validation.required !== 'boolean') {
        throw new Error(`"required" validation property should be a boolean`);
      }
    },
  },
  string: {
    regex: (validation: VString) => {
      if (!('regex' in validation)) {
        return;
      }
      if (typeof validation.regex !== 'string') {
        throw new Error(`"regex" validation property should be a string`);
      }
    },
    choices: (validation: VString) => {
      if (!('choices' in validation)) {
        return;
      }
      if (!Array.isArray(validation.choices)) {
        throw new Error(
          `"choices" validation property should be an "array" of strings`
        );
      }

      for (const choice of validation.choices) {
        if (typeof choice !== 'string') {
          throw new Error(
            `"choices" validation property should be an array of "strings"`
          );
        }
      }
    },
  },
  number: {
    gt: (validation: VNumeric<number>) => {
      if (!('gt' in validation)) {
        return;
      }
      if (typeof validation.gt !== 'number') {
        throw new Error(`"gt" validation property should be a number`);
      }
    },
    gte: (validation: VNumeric<number>) => {
      if (!('gte' in validation)) {
        return;
      }
      if (typeof validation.gte !== 'number') {
        throw new Error(`"gte" validation property should be a number`);
      }
    },
    lt: (validation: VNumeric<number>) => {
      if (!('lt' in validation)) {
        return;
      }

      if (typeof validation.lt !== 'number') {
        throw new Error(`"lt" validation property should be a number`);
      }
    },
    lte: (validation: VNumeric<number>) => {
      if (!('lte' in validation)) {
        return;
      }

      if (typeof validation.lte !== 'number') {
        throw new Error(`"lte" validation property should be a number`);
      }
    },
  },
  bigint: {
    gt: (validation: VNumeric<bigint>) => {
      if (!('gt' in validation)) {
        return;
      }

      if (typeof validation.gt !== 'bigint') {
        throw new Error(`"gt" validation property should be a bigint`);
      }
    },
    gte: (validation: VNumeric<bigint>) => {
      if (!('gte' in validation)) {
        return;
      }
      if (typeof validation.gte !== 'bigint') {
        throw new Error(`"gte" validation property should be a bigint`);
      }
    },
    lt: (validation: VNumeric<bigint>) => {
      if (!('lt' in validation)) {
        return;
      }
      if (typeof validation.lt !== 'bigint') {
        throw new Error(`"lt" validation property should be a bigint`);
      }
    },
    lte: (validation: VNumeric<bigint>) => {
      if (!('lte' in validation)) {
        return;
      }
      if (typeof validation.lte !== 'bigint') {
        throw new Error(`"lte" validation property should be a bigint`);
      }
    },
  },
};
