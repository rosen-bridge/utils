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

export const valueValidators: Record<string, any> = {
  object: (value: Record<string, any>, field: types.ObjectField) => {
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
  string: (value: string, field: types.StringField) => {
    if (typeof value !== 'string') {
      throw new Error(`value must be of string type`);
    }
  },
  boolean: (value: boolean, field: types.BooleanField) => {
    if (typeof value !== 'boolean') {
      throw new Error(`value must be of boolean type`);
    }
  },
  number: (value: number, field: types.NumberField) => {
    if (typeof value !== 'number') {
      throw new Error(`value must be of number type`);
    }
  },
  bigint: (value: bigint, field: types.BigIntField) => {
    if (typeof value !== 'bigint') {
      throw new Error(`value must be of bigint type`);
    }
  },
};

const required = (
  value: any,
  validation: VRequired,
  config: Record<string, any>,
  configValidator: ConfigValidator
) => {
  if (validation.when && !configValidator.isWhenTrue(validation.when, config)) {
    return;
  }

  if (validation.required && value == undefined) {
    throw new Error('value is required but not found in config');
  }
};

export const valueValidations: Record<string, Record<string, any>> = {
  boolean: { required },
  string: {
    required,
    regex: (
      value: string,
      validation: VRegex,
      config: Record<string, any>,
      configValidator: ConfigValidator
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
      config: Record<string, any>,
      configValidator: ConfigValidator
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
            ', '
          )}]`
        );
      }
    },
  },
  number: {
    required,
    gt: (
      value: number,
      validation: VGreater<number>,
      config: Record<string, any>,
      configValidator: ConfigValidator
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
      config: Record<string, any>,
      configValidator: ConfigValidator
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
          `value should be greater than or equal to ${validation.gte}`
        );
      }
    },
    lt: (
      value: number,
      validation: VLess<number>,
      config: Record<string, any>,
      configValidator: ConfigValidator
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
      config: Record<string, any>,
      configValidator: ConfigValidator
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
          `value should be less than or equal to ${validation.lte}`
        );
      }
    },
  },
  bigint: {
    required,
    gt: (
      value: bigint,
      validation: VGreater<bigint>,
      config: Record<string, any>,
      configValidator: ConfigValidator
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
      config: Record<string, any>,
      configValidator: ConfigValidator
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
          `value should be greater than or equal to ${validation.gte}`
        );
      }
    },
    lt: (
      value: bigint,
      validation: VLess<bigint>,
      config: Record<string, any>,
      configValidator: ConfigValidator
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
      config: Record<string, any>,
      configValidator: ConfigValidator
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
          `value should be less than or equal to ${validation.lte}`
        );
      }
    },
  },
};
