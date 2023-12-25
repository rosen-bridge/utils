import { stringify } from 'querystring';
import {
  propertyValidators,
  supportedTypes,
} from './schema/Validators/fieldProperties';
import { ConfigField, ConfigSchema } from './schema/types/fields';
import { valueValidations, valueValidators } from './value/validators';
import { VString, When } from './schema/types/validations';

export class ConfigValidator {
  constructor(private schema: ConfigSchema) {
    this.validateSchema();
  }

  /**
   * validates the passed config against the instance's schema
   *
   * @param {Record<string, any>} config
   */
  public validateConfig(config: Record<string, any>) {
    const errorPreamble = (path: Array<string>) =>
      `config validation failed for "${path.join('.')}" field`;

    const stack: Array<{
      subSchema: ConfigSchema;
      subConfig: Record<string, any> | undefined;
      parentPath: Array<string>;
    }> = [
      {
        subSchema: this.schema,
        subConfig: config,
        parentPath: [],
      },
    ];

    this.validateValue(
      config,
      { type: 'object', children: this.schema },
      config
    );

    // Traverses the schema object tree depth first in coordination with config
    // object tree and validate config using the schema
    while (stack.length > 0) {
      const { subSchema, subConfig, parentPath } = stack.pop()!;
      // Process children of current field
      for (const name of Object.keys(subSchema)) {
        const path = parentPath.concat([name]);
        try {
          const field = subSchema[name];
          let value = undefined;
          if (subConfig != undefined && Object.hasOwn(subConfig, name)) {
            value = subConfig[name];
          }

          this.validateValue(value, field, config);

          // if a node/field is of type object and thus is a subtree, add it to
          // the stack to be traversed later
          if (field.type === 'object') {
            stack.push({
              subSchema: field.children,
              subConfig: value,
              parentPath: path,
            });
          }
        } catch (error: any) {
          throw new Error(`${errorPreamble(path)}: ${error.message}`);
        }
      }
    }
  }

  /**
   * validates a value in config object
   *
   * @private
   * @param {*} value
   * @param {ConfigField} field the field specification in schema
   * @param {Record<string, any>} config the config object
   */
  private validateValue = (
    value: any,
    field: ConfigField,
    config: Record<string, any>
  ) => {
    if (value != undefined) {
      valueValidators[field.type](value, field);
    }

    if (field.type != 'object' && field.validations) {
      for (const validation of field.validations) {
        const name = Object.keys(validation).filter(
          (key) => key !== 'when' && key !== 'error'
        )[0];
        if (Object.hasOwn(valueValidations[field.type], name)) {
          try {
            valueValidations[field.type][name](value, validation, config, this);
          } catch (error: any) {
            if (validation.error != undefined) {
              throw new Error(validation.error);
            }
            throw error;
          }
        }
      }
    }
  };

  /**
   * determines if a when clause in validations section of a schema field is
   * satisfied
   *
   * @param {When} when
   * @param {Record<string, any>} config
   * @return {boolean}
   */
  public isWhenTrue = (when: When, config: Record<string, any>): boolean => {
    const pathParts = when.path.split('.');
    const value = ConfigValidator.valueAt(config, pathParts);
    return value != undefined && value === when.value;
  };

  /**
   * returns the value at specified path in config object
   *
   * @static
   * @param {Record<string, any>} config
   * @param {string[]} path
   * @return {*}
   */
  static valueAt = (config: Record<string, any>, path: string[]) => {
    let value: any = config;
    for (const key of path) {
      if (value != undefined && Object.hasOwn(value, key)) {
        value = value[key];
      } else {
        break;
      }
    }

    return value;
  };

  /**
   * validates this.schema and throws exception if any errors found
   */
  private validateSchema = () => {
    const errorPreamble = (path: Array<string>) =>
      `Schema validation failed for "${path.join('.')}" field`;

    const stack: Array<{
      subSchema: ConfigSchema;
      parentPath: Array<string>;
    }> = [
      {
        subSchema: this.schema,
        parentPath: [],
      },
    ];

    // Traverses the schema object tree depth first and validate fields
    while (stack.length > 0) {
      const { subSchema, parentPath } = stack.pop()!;

      // process children of current object field
      for (const name of Object.keys(subSchema).reverse()) {
        const path = parentPath.concat([name]);
        try {
          this.validateConfigName(name);
          const field = subSchema[name];

          if (!Object.hasOwn(field, 'type') || typeof field.type !== 'string') {
            throw new Error(
              `every schema field must have a "type" property of type "string"`
            );
          }

          if (!supportedTypes.includes(field.type)) {
            throw new Error(`unsupported field type "${field.type}"`);
          }

          this.validateSchemaField(field);

          // if the child is an object field itself add it to stack for
          // processing
          if (field.type === 'object') {
            stack.push({
              subSchema: field.children,
              parentPath: path,
            });
          }
        } catch (error: any) {
          throw new Error(`${errorPreamble(path)}: ${error.message}`);
        }
      }
    }
  };

  /**
   * validates config key name
   *
   * @param {string} name
   */
  private validateConfigName = (name: string) => {
    if (name.includes('.')) {
      throw new Error(`config key name can not contain the '.' character`);
    }
  };

  /**
   * validates passed schema field structure
   *
   * @param {ConfigField} field
   */
  private validateSchemaField = (field: ConfigField) => {
    for (const key of Object.keys(field)) {
      if (
        !Object.hasOwn(propertyValidators.all, key) &&
        !(
          field.type !== 'object' &&
          Object.hasOwn(propertyValidators.primitive, key)
        ) &&
        !Object.hasOwn(propertyValidators[field.type], key)
      ) {
        throw new Error(`schema field has unknown property "${key}"`);
      }
    }

    for (const validator of Object.values(propertyValidators.all)) {
      validator(field, this);
    }

    if (field.type !== 'object') {
      for (const validator of Object.values(propertyValidators.primitive)) {
        validator(field, this);
      }
    }

    for (const validator of Object.values(propertyValidators[field.type])) {
      validator(field, this);
    }
  };

  /**
   * returns a field corresponding to a path in schema tree
   *
   * @param {string[]} path
   * @return {(ConfigField | undefined)} returns undefined if field is not found
   */
  getSchemaField = (path: string[]): ConfigField | undefined => {
    let subTree: ConfigSchema | undefined = this.schema;
    let field: ConfigField | undefined = undefined;
    for (const part of path) {
      if (subTree != undefined && Object.hasOwn(subTree, part)) {
        field = subTree[part];
        subTree = 'children' in field ? field.children : undefined;
      } else {
        return undefined;
      }
    }
    return field;
  };

  /**
   * extracts default values from a schema
   *
   * @return {Record<string, any>} object of default values
   */
  generateDefault = (): Record<string, any> => {
    const valueTree: Record<string, any> = Object.create(null);

    const stack: {
      schema: ConfigSchema;
      parentValue: Record<string, any> | undefined;
      fieldName: string;
      children: string[];
    }[] = [
      {
        schema: this.schema,
        parentValue: undefined,
        fieldName: '',
        children: Object.keys(this.schema).reverse(),
      },
    ];

    // Traverses the schema object tree depth first
    while (stack.length > 0) {
      const { schema, parentValue, fieldName, children } = stack.at(-1)!;

      // if a subtree's processing is finished go to the previous level
      if (children.length === 0) {
        // if a subtree is empty (has no values) remove it from the result
        if (
          parentValue != undefined &&
          Object.keys(parentValue[fieldName]).length === 0
        ) {
          delete parentValue[fieldName];
        }
        stack.pop();
        continue;
      }

      const childName = children.pop()!;
      const value =
        parentValue != undefined ? parentValue[fieldName] : valueTree;
      const field = schema[childName];
      // if a node/field is of type object and thus is a subtree, add it both to
      // value tree and to the stack to be traversed later. Otherwise it's a
      // leaf and needs no traversal, so add it only to the value tree.
      if (field.type === 'object') {
        value[childName] = Object.create(null);
        stack.push({
          schema: field.children,
          parentValue: value,
          fieldName: childName,
          children: Object.keys(field.children).reverse(),
        });
      } else if (field.default != undefined) {
        value[childName] = field.default;
      }
    }

    return valueTree;
  };
}
