import { ConfigValidator } from '../config';
import * as types from '../schema/types/fields';
import {
  VChoices,
  VGreater,
  VGreaterEqual,
  VLess,
  VLessEqual,
  VRegex,
  VRequired,
} from '../schema/types/validations';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const valueValidators: Record<string, any> = {
  object: (
    value: Record<string, types.ValueType>,
    field: types.ObjectField,
  ) => {
    if (typeof value !== 'object') {
      throw new Error(`value must be of object type`);
    }

    const schemaKeys = new Set(Object.keys(field.children));
    for (const key of Object.keys(value)) {
      if (!schemaKeys.has(key)) {
        throw new Error(`"${key}" key is not found in the schema`);
      }
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  union: (value: types.UnionField, _field: types.UnionField) => {
    const validUnionTypes = [
      'object',
      'array',
      'boolean',
      'union',
      'string',
      'number',
      'bigint',
    ];
    if (!validUnionTypes.includes(typeof value)) {
      throw new Error(
        'Value does not match any of the valid union children types.',
      );
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  array: (value: Array<types.ValueType>, _field: types.ArrayField) => {
    if (!Array.isArray(value)) {
      throw new Error(`value must be of array type`);
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  string: (value: string, _field: types.StringField) => {
    if (typeof value !== 'string') {
      throw new Error(`value must be of string type`);
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  boolean: (value: boolean, _field: types.BooleanField) => {
    if (typeof value !== 'boolean') {
      throw new Error(`value must be of boolean type`);
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  number: (value: number, _field: types.NumberField) => {
    if (typeof value !== 'number') {
      throw new Error(`value must be of number type`);
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bigint: (value: bigint, _field: types.BigIntField) => {
    if (typeof value !== 'bigint') {
      throw new Error(`value must be of bigint type`);
    }
  },
};

const required = (
  value: types.ValueType,
  validation: VRequired,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>,
  configValidator: ConfigValidator,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>,
) => {
  if (
    validation.when &&
    !configValidator.isWhenTrue(validation.when, config, context)
  ) {
    return;
  }
  if (validation.required && value == undefined) {
    throw new Error('value is required but not found in config');
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const valueValidations: Record<string, Record<string, any>> = {
  boolean: { required },
  string: {
    required,
    regex: (
      value: string,
      validation: VRegex,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: Record<string, any>,
      configValidator: ConfigValidator,
    ) => {
      if (
        value == undefined ||
        (validation.when &&
          !configValidator.isWhenTrue(validation.when, config))
      ) {
        return;
      }

      const re = new RegExp(validation.regex);
      const match = value.match(re);
      if (match == null || match[0] !== value) {
        throw new Error(`value should match the regex="${validation.regex}"`);
      }
    },
    choices: (
      value: string,
      validation: VChoices,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: Record<string, any>,
      configValidator: ConfigValidator,
    ) => {
      if (
        value == undefined ||
        (validation.when &&
          !configValidator.isWhenTrue(validation.when, config))
      ) {
        return;
      }

      if (!validation.choices.includes(value)) {
        throw new Error(
          `value should be one of the choices=[${validation.choices.join(
            ', ',
          )}]`,
        );
      }
    },
  },
  number: {
    required,
    gt: (
      value: number,
      validation: VGreater<number>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: Record<string, any>,
      configValidator: ConfigValidator,
    ) => {
      if (
        value == undefined ||
        (validation.when &&
          !configValidator.isWhenTrue(validation.when, config))
      ) {
        return;
      }

      if (value <= validation.gt) {
        throw new Error(`value should be greater than ${validation.gt}`);
      }
    },
    gte: (
      value: number,
      validation: VGreaterEqual<number>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: Record<string, any>,
      configValidator: ConfigValidator,
    ) => {
      if (
        value == undefined ||
        (validation.when &&
          !configValidator.isWhenTrue(validation.when, config))
      ) {
        return;
      }

      if (value < validation.gte) {
        throw new Error(
          `value should be greater than or equal to ${validation.gte}`,
        );
      }
    },
    lt: (
      value: number,
      validation: VLess<number>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: Record<string, any>,
      configValidator: ConfigValidator,
    ) => {
      if (
        value == undefined ||
        (validation.when &&
          !configValidator.isWhenTrue(validation.when, config))
      ) {
        return;
      }

      if (value >= validation.lt) {
        throw new Error(`value should be less than ${validation.lt}`);
      }
    },
    lte: (
      value: number,
      validation: VLessEqual<number>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: Record<string, any>,
      configValidator: ConfigValidator,
    ) => {
      if (
        value == undefined ||
        (validation.when &&
          !configValidator.isWhenTrue(validation.when, config))
      ) {
        return;
      }

      if (value > validation.lte) {
        throw new Error(
          `value should be less than or equal to ${validation.lte}`,
        );
      }
    },
  },
  bigint: {
    required,
    gt: (
      value: bigint,
      validation: VGreater<bigint>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: Record<string, any>,
      configValidator: ConfigValidator,
    ) => {
      if (
        value == undefined ||
        (validation.when &&
          !configValidator.isWhenTrue(validation.when, config))
      ) {
        return;
      }

      if (value <= validation.gt) {
        throw new Error(`value should be greater than ${validation.gt}`);
      }
    },
    gte: (
      value: bigint,
      validation: VGreaterEqual<bigint>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: Record<string, any>,
      configValidator: ConfigValidator,
    ) => {
      if (
        value == undefined ||
        (validation.when &&
          !configValidator.isWhenTrue(validation.when, config))
      ) {
        return;
      }

      if (value < validation.gte) {
        throw new Error(
          `value should be greater than or equal to ${validation.gte}`,
        );
      }
    },
    lt: (
      value: bigint,
      validation: VLess<bigint>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: Record<string, any>,
      configValidator: ConfigValidator,
    ) => {
      if (
        value == undefined ||
        (validation.when &&
          !configValidator.isWhenTrue(validation.when, config))
      ) {
        return;
      }

      if (value >= validation.lt) {
        throw new Error(`value should be less than ${validation.lt}`);
      }
    },
    lte: (
      value: bigint,
      validation: VLessEqual<bigint>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config: Record<string, any>,
      configValidator: ConfigValidator,
    ) => {
      if (
        value == undefined ||
        (validation.when &&
          !configValidator.isWhenTrue(validation.when, config))
      ) {
        return;
      }

      if (value > validation.lte) {
        throw new Error(
          `value should be less than or equal to ${validation.lte}`,
        );
      }
    },
  },
  union: { required },
};
