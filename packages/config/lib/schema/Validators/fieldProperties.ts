import { ConfigValidator } from '../../config';
import * as types from '../types/fields';
import { VAll, VNumeric, VString } from '../types/validations';

// Ensures a provided value structurally matches a field schema (non-traversal of schema tree)
const assertShapeMatchesField = (value: any, field: types.ConfigField) => {
  if (field.type === 'object') {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('value must be of object type');
    }
    for (const k of Object.keys(value)) {
      if (!Object.hasOwn((field as types.ObjectField).children, k)) {
        throw new Error(`"${k}" key is not found in the schema`);
      }
      assertShapeMatchesField(
        (value as Record<string, any>)[k],
        (field as types.ObjectField).children[k],
      );
    }
    return;
  }

  if (field.type === 'array') {
    if (!Array.isArray(value)) {
      throw new Error('value must be of array type');
    }
    for (const item of value) {
      assertShapeMatchesField(item, (field as types.ArrayField).items);
    }
    return;
  }

  if (value == undefined) return;
  switch (field.type) {
    case 'string':
      if (typeof value !== 'string')
        throw new Error('value must be of string type');
      break;
    case 'number':
      if (typeof value !== 'number')
        throw new Error('value must be of number type');
      break;
    case 'boolean':
      if (typeof value !== 'boolean')
        throw new Error('value must be of boolean type');
      break;
    case 'bigint':
      if (
        !(
          typeof value === 'bigint' ||
          ((typeof value === 'number' || typeof value === 'string') &&
            BigInt(value))
        )
      )
        throw new Error('value must be of bigint type');
      break;
  }
};

export const propertyValidators = {
  all: {
    // eslint-disable-next-line no-unused-vars
    type: (field: types.ConfigField, _config: ConfigValidator) => {
      if (!Object.hasOwn(field, 'type') || typeof field.type !== 'string') {
        throw new Error(
          `every schema field must have a "type" property of type "string"`,
        );
      }

      if (!supportedTypes.includes(field.type)) {
        throw new Error(`unsupported field type "${field.type}"`);
      }
    },
    // eslint-disable-next-line no-unused-vars
    label: (field: types.ConfigField, _config: ConfigValidator) => {
      if (Object.hasOwn(field, 'label') && typeof field.label !== 'string') {
        throw new Error(`"label" property should be a "string"`);
      }
    },
    // eslint-disable-next-line no-unused-vars
    description: (field: types.ConfigField, _config: ConfigValidator) => {
      if (
        Object.hasOwn(field, 'description') &&
        typeof field.description !== 'string'
      ) {
        throw new Error(`"description" property should be a "string"`);
      }
    },
  },
  primitive: {
    validations: (field: types.PrimitiveField, config: ConfigValidator) => {
      if (!Object.hasOwn(field, 'validations')) {
        return;
      }

      if (!Array.isArray(field.validations)) {
        throw new Error(
          '"validations" property must be an array of validation descriptions',
        );
      }

      for (const validation of field.validations) {
        if (
          Object.hasOwn(validation, 'error') &&
          typeof validation.error !== 'string'
        ) {
          throw new Error(
            '"error" property of a validation description must be a string',
          );
        }

        if (Object.hasOwn(validation, 'when') && validation.when != undefined) {
          if (
            !Object.hasOwn(validation.when, 'path') ||
            typeof validation.when.path !== 'string'
          ) {
            throw new Error(
              `"when" property of a validation description must have a "path" property of type "string"`,
            );
          }

          if (
            config.getSchemaField(validation.when.path.split('.')) == undefined
          ) {
            throw new Error(
              `"when" property of a validation description has a non-existent path=[${validation.when.path}]`,
            );
          }

          if (!Object.hasOwn(validation.when, 'value')) {
            throw new Error(
              `"when" property of a validation description must have a "value" property`,
            );
          }
        }

        const validationProperties = Object.keys(validation).filter(
          (key) => key !== 'when' && key !== 'error',
        );
        if (validationProperties.length !== 1) {
          throw new Error('validation description format is wrong');
        }

        const validationName = validationProperties[0];
        const primitiveValidator = fieldValidations.primitive[validationName];
        const typeValidator = fieldValidations[field.type][validationName];
        if (primitiveValidator == undefined && typeValidator == undefined) {
          throw new Error(
            `validation description has an unknown validator "${validationName}"`,
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
    // eslint-disable-next-line no-unused-vars
    children: (field: types.ObjectField, _config: ConfigValidator) => {
      if (
        !Object.hasOwn(field, 'children') ||
        typeof field.children !== 'object'
      ) {
        throw new Error(
          `object field type must have a "children" property of type "object"`,
        );
      }
      return;
    },
  },
  array: {
    // eslint-disable-next-line no-unused-vars
    items: (field: types.ArrayField, _config: ConfigValidator) => {
      if (!Object.hasOwn(field, 'items') || typeof field.items !== 'object') {
        throw new Error(
          `array field type must have a "items" property of type "object"`,
        );
      }
    },
    // eslint-disable-next-line no-unused-vars
    default: (field: types.ArrayField, _config: ConfigValidator) => {
      if (!Object.hasOwn(field, 'default')) return;
      if (!Array.isArray((field as any).default)) {
        throw new Error(
          `default value=[${
            (field as any).default
          }] doesn't match field type=[${field.type}]`,
        );
      }

      for (const elem of (field as any).default as any[]) {
        assertShapeMatchesField(elem, field.items);
      }
    },
  },
  string: {
    // eslint-disable-next-line no-unused-vars
    default: (field: types.StringField, _config: ConfigValidator) => {
      if (
        Object.hasOwn(field, 'default') &&
        typeof field.default !== 'string'
      ) {
        throw new Error(
          `default value=[${field.default}] doesn't match field type=[${field.type}]`,
        );
      }
    },
  },
  boolean: {
    // eslint-disable-next-line no-unused-vars
    default: (field: types.BooleanField, _config: ConfigValidator) => {
      if (
        Object.hasOwn(field, 'default') &&
        typeof field.default !== 'boolean'
      ) {
        throw new Error(
          `default value=[${field.default}] doesn't match field type=[${field.type}]`,
        );
      }
    },
  },
  number: {
    // eslint-disable-next-line no-unused-vars
    default: (field: types.NumberField, _config: ConfigValidator) => {
      if (
        Object.hasOwn(field, 'default') &&
        typeof field.default !== 'number'
      ) {
        throw new Error(
          `default value=[${field.default}] doesn't match field type=[${field.type}]`,
        );
      }
    },
  },
  bigint: {
    // eslint-disable-next-line no-unused-vars
    default: (field: types.BigIntField, _config: ConfigValidator) => {
      if (
        Object.hasOwn(field, 'default') &&
        !(
          typeof field.default === 'bigint' ||
          ((typeof field.default === 'number' ||
            typeof field.default === 'string') &&
            BigInt(field.default))
        )
      ) {
        throw new Error(
          `default value=[${field.default}] doesn't match field type=[${field.type}]`,
        );
      }
    },
  },
};

export const supportedTypes = Object.keys(propertyValidators).filter(
  (key) => key !== 'all' && key !== 'primitive',
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
          `"choices" validation property should be an "array" of strings`,
        );
      }

      for (const choice of validation.choices) {
        if (typeof choice !== 'string') {
          throw new Error(
            `"choices" validation property should be an array of "strings"`,
          );
        }
      }
    },
  },
  boolean: {},
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
