import { IConfig, IConfigSource } from 'config';
import config from 'config';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import path from 'path';

import JsonBigInt, { JsonBigIntFactory } from '@rosen-bridge/json-bigint';

import {
  ConfigField,
  ConfigSchema,
  UnionField,
  ValueType,
} from './schema/types/fields';
import { When } from './schema/types/validations';
import {
  propertyValidators,
  supportedTypes,
} from './schema/Validators/fieldProperties';
import {
  getSourceName,
  getValueFromConfigSources,
  toPascalCase,
} from './utils';
import { valueValidations, valueValidators } from './value/validators';

export class ConfigValidator {
  private schema: ConfigSchema;

  private constructor(schema: ConfigSchema) {
    this.schema = schema;
    this.validateSchema();
  }

  /**
   * Builds and returns the final configuration object by transforming and validating
   *
   *  T - The type of the final normalized configuration object.
   * @returns {T} The normalized configuration object
   */
  buildConfigs = <T>(): T => {
    const raw = config.util.toObject();
    this.validateConfig(raw);
    return raw;
  };

  /**
   * create ConfigValidator from schema file path
   */
  static fromFile = (schemaPath: string): ConfigValidator => {
    const rawSchemaData = fs.readFileSync(schemaPath, 'utf-8');

    const jsonBigInt = JsonBigIntFactory({
      alwaysParseAsBig: false,
      useNativeBigInt: true,
    });

    const schema = jsonBigInt.parse(rawSchemaData);
    return new ConfigValidator(schema);
  };

  /**
   * create ConfigValidator from schema
   *
   * @param {ConfigSchema} schema
   */
  static fromSchema = (schema: ConfigSchema): ConfigValidator => {
    return new ConfigValidator(schema);
  };

  /**
   * validates the passed config against the instance's schema
   *
   * @param {Record<string, any>} config
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public validateConfig(config: Record<string, any>) {
    this.validateValue(
      config,
      { type: 'object', children: this.schema },
      config,
      [],
    );

    this.validateSubConfig(config, config, this.schema, []);
  }

  /**
   * traverses and validates a subconfig using the subschema
   *
   * @private
   * @param {Record<string, any>} config
   * @param {Record<string, any>} subConfig
   * @param {ConfigSchema} subSchema
   * @param {string[]} path
   * @memberof ConfigValidator
   */
  private validateSubConfig(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subConfig: Record<string, any>,
    subSchema: ConfigSchema,
    path: string[],
  ) {
    const errorPreamble = (path: Array<string>) =>
      `config validation failed for "${path.join('.')}" field`;

    for (const name of Object.keys(subSchema)) {
      const childPath = path.concat([name]);
      try {
        const field = subSchema[name];
        let value = undefined;
        if (subConfig != undefined && Object.hasOwn(subConfig, name)) {
          value = subConfig[name];
        }

        this.validateValue(value, field, config, childPath);
        // if a node/field is of type object and thus is a subtree, traverse it
        if (field.type === 'object') {
          this.validateSubConfig(config, value, field.children, childPath);
        } else if (field.type === 'array') {
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              const item = value[i];
              const itemPath = childPath.concat([String(i)]);

              if (field.items.type === 'object') {
                this.validateSubConfig(
                  config,
                  item,
                  field.items.children,
                  itemPath,
                );
              } else if (field.items.type === 'array') {
                this.validateSubConfig(
                  config,
                  { [name]: item },
                  { [name]: field.items },
                  childPath,
                );
              } else if (field.items.type === 'union') {
                this.validateUnionValue(
                  item,
                  field.items,
                  config,
                  itemPath,
                  name,
                );
              } else {
                // for primitive fields
                this.validateValue(item, field.items, config, itemPath);
              }
            }
            ConfigValidator.modifyObject(config, value, childPath);
          }
        } else if (field.type === 'union') {
          this.validateUnionValue(value, field, config, childPath, name);
        }
        if (
          value === undefined &&
          field.type !== 'object' &&
          field.type !== 'array' &&
          field.type !== 'union'
        ) {
          if (field.default !== undefined) {
            value = field.default;
            ConfigValidator.modifyObject(config, value, childPath);
            if (subConfig != undefined) {
              subConfig[name] = value;
            }
          }
        }
      } catch (error) {
        throw new Error(
          `${errorPreamble(childPath)}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
  }

  /**
   * traverses and validates a union subconfig using the subschema
   *
   * @private
   * @param {any} value
   * @param {UnionField} field
   * @param {Record<string, any>} config
   * @param {ConfigSchema} subSchema
   * @param {string[]} childPath
   * @param {string} name
   */
  private validateUnionValue(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    field: UnionField,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: Record<string, any>,
    childPath: string[],
    name: string,
  ) {
    let isMatched = false;
    let errorMessage = '';

    for (const activeField of field.children) {
      try {
        if (
          activeField.type === 'object' &&
          typeof value === 'object' &&
          value != null
        ) {
          this.validateSubConfig(
            config,
            value,
            activeField.children,
            childPath,
          );
          isMatched = true;
        } else if (activeField.type === 'array' && Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const item = value[i];
            const itemPath = childPath.concat([String(i)]);

            if (activeField.items.type === 'object') {
              this.validateSubConfig(
                config,
                item,
                activeField.items.children,
                itemPath,
              );
            } else if (activeField.items.type === 'union') {
              this.validateUnionValue(
                item,
                activeField.items,
                config,
                itemPath,
                name,
              );
            } else {
              this.validateValue(item, activeField.items, config, itemPath);
            }
          }
          ConfigValidator.modifyObject(config, value, childPath);
          isMatched = true;
        } else if (activeField.type === 'union') {
          this.validateUnionValue(value, activeField, config, childPath, name);
          isMatched = true;
        } else {
          this.validateValue(value, activeField, config, childPath);
          isMatched = true;
        }

        if (isMatched) break;
      } catch (e) {
        errorMessage = `${e instanceof Error ? e.message : e}`;
        isMatched = isMatched === true;
      }
    }

    if (!isMatched) {
      throw new Error(
        `Value for "${childPath.join('.')}" does not match any of the union types for this error: ${errorMessage}. Please provide a valid value.`,
      );
    }
  }

  /**
   * sets an object's specific subtree to the specified value
   *
   * @static
   * @param {Record<string, any>} obj
   * @param {*} newValue
   * @param {string[]} path
   * @return {*}
   * @memberof ConfigValidator
   */
  static modifyObject(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: Record<string, any>,
    newValue: ValueType,
    path: string[],
  ) {
    let value = obj;
    for (const key of path.slice(0, -1)) {
      if (value != undefined && Object.hasOwn(value, key)) {
        value = value[key];
      } else {
        return;
      }
    }
    const lastKey = path.at(-1);
    if (lastKey != undefined) {
      value[lastKey] = newValue;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    field: ConfigField,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: Record<string, any>,
    path: string[],
  ) => {
    if (value != undefined) {
      if (field.type === 'bigint') {
        if (
          typeof value === 'number' &&
          (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER)
        ) {
          throw new Error(
            `Field "${path.join('.')}" is declared as a BigInt, but a Number was provided with insufficient precision. Values exceeding 9007199254740991 must be supplied as a string to ensure accuracy.`,
          );
        }
        try {
          value = BigInt(value);
          ConfigValidator.modifyObject(config, value, path);
        } catch {
          throw new Error(
            `Cannot convert ${value} to a BigInt for field "${path.join('.')}"`,
          );
        }
      }
      if (field.type === 'number') {
        if (isNaN(Number(value))) {
          throw new Error(
            `Field "${path.join('.')}" must be a valid number. Please provide a suitable format.`,
          );
        }
        value = Number(value);
        if (
          value > Number.MAX_SAFE_INTEGER ||
          value < Number.MIN_SAFE_INTEGER
        ) {
          throw new Error(
            `Value for "${path.join('.')}" is too large or too small. Please enter a valid number.`,
          );
        }
        ConfigValidator.modifyObject(config, value, path);
      }
      valueValidators[field.type](value, field);
    }

    if (
      field.type !== 'object' &&
      field.type !== 'array' &&
      field.type !== 'union' &&
      field.validations
    ) {
      for (const validation of field.validations) {
        const name = Object.keys(validation).filter(
          (key) => key !== 'when' && key !== 'error',
        )[0];
        if (Object.hasOwn(valueValidations[field.type], name)) {
          try {
            valueValidations[field.type][name](value, validation, config, this);
          } catch (error) {
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
  public isWhenTrue = (
    when: When,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    localConfig?: Record<string, any>,
    localPath?: string[],
  ): boolean => {
    const pathParts = when.path.split('.');
    if (localConfig != undefined && localPath != undefined) {
      const isUnderLocal = localPath.every((p, i) => pathParts[i] === p);
      if (isUnderLocal) {
        const relativeParts = pathParts.slice(localPath.length);
        const localValue = ConfigValidator.valueAt(localConfig, relativeParts);
        if (localValue != undefined) return localValue === when.value;
      }
    }

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static valueAt = (config: Record<string, any>, path: string[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = config;
    for (const key of path) {
      if (value != undefined && Object.hasOwn(value, key)) {
        value = value[key];
      } else {
        return undefined;
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
              `every schema field must have a "type" property of type "string"`,
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
          } else if (field.type === 'array') {
            stack.push({
              subSchema: { [name]: field.items },
              parentPath: path,
            });
          } else if (field.type === 'union') {
            field.children.forEach((unionChild, index) => {
              stack.push({
                subSchema: { [`${name}_union_${index}`]: unionChild },
                parentPath: path,
              });
            });
          }
        } catch (error) {
          throw new Error(
            `${errorPreamble(path)}: ${error instanceof Error ? error.message : error}`,
          );
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
        !Object.hasOwn(propertyValidators.primitive, key) &&
        !Object.hasOwn(propertyValidators[field.type], key)
      ) {
        throw new Error(`schema field has unknown property "${key}"`);
      }
    }

    for (const validator of Object.values(propertyValidators.all)) {
      validator(field, this);
    }

    if (
      field.type !== 'object' &&
      field.type !== 'array' &&
      field.type !== 'union'
    ) {
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
        if (field.type === 'object') {
          subTree = field.children;
        } else if (field.type === 'array' && field.items.type === 'object') {
          subTree = field.items.children;
        } else {
          subTree = undefined;
        }
      } else {
        if (field?.type === 'union') {
          for (const child of field.children) {
            if (
              child.type === 'object' &&
              Object.hasOwn(child.children, part)
            ) {
              field = child.children[part];
              subTree = field.type === 'object' ? field.children : undefined;
              return field;
            }
          }
        }
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generateDefault = (options?: { validate?: boolean }): Record<string, any> => {
    const valueTree = this.buildDefaultsForSchema(this.schema);
    if (options?.validate) {
      this.validateConfig(valueTree);
    }
    return valueTree;
  };

  // Builds default values for a schema subtree (objects and arrays), recursively
  private buildDefaultsForSchema = (
    schema: ConfigSchema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaults: Record<string, any> = Object.create(null);
    for (const key of Object.keys(schema)) {
      const field = schema[key];
      if (field.type === 'object') {
        const childDefaults = this.buildDefaultsForSchema(field.children);
        if (Object.keys(childDefaults).length > 0) {
          defaults[key] = childDefaults;
        }
      } else if (field.type === 'array') {
        if (field.default != undefined) {
          if (field.items.type === 'object') {
            const itemDefaults = this.buildDefaultsForSchema(
              field.items.children,
            );
            defaults[key] = field.default.map((elem: ValueType) => {
              if (
                elem != null &&
                typeof elem === 'object' &&
                !Array.isArray(elem)
              ) {
                return { ...itemDefaults, ...elem };
              }
              return elem;
            });
          } else {
            defaults[key] = field.default;
          }
        }
      } else if (field.type !== 'union' && field.default != undefined) {
        defaults[key] = field.default;
      }
    }
    return defaults;
  };

  /**
   * generates compatible TypeScript interface for this instance's schema
   *
   * @param {string} name the name of root type
   * @return {string}
   */
  generateTSTypes = (name: string): string => {
    const types: string[] = [];
    const emittedTypeNames: Set<string> = new Set();

    const stack: Array<{
      subSchema: ConfigSchema;
      children: string[];
      parentPath: string[];
      typeName: string;
      attributes: Array<[string, string]>;
    }> = [
      {
        subSchema: this.schema,
        children: Object.keys(this.schema),
        parentPath: [],
        typeName: name,
        attributes: [],
      },
    ];
    // Traverses the schema object tree depth first
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const { subSchema, children, parentPath, typeName, attributes } = current;

      if (children.length === 0) {
        if (!emittedTypeNames.has(typeName)) {
          types.push(this.genTSInterface(typeName, attributes));
          emittedTypeNames.add(typeName);
        }
        stack.pop();
        continue;
      }

      const childName = children.pop()!;
      const field = subSchema[childName];
      const path = parentPath.concat(childName);
      // if a node/field is of type object and thus is a subtree, add it to
      // the stack to be traversed later. Otherwise it's a leaf and needs no
      // traversal.
      const childNameQuoted = childName.includes('-')
        ? `"${childName}"`
        : childName;
      if (field.type === 'union') {
        const unionTypes: string[] = [];

        field.children.forEach((child, index) => {
          if (child.type === 'union') {
            child.children.forEach((nestedChild) => {
              unionTypes.push(nestedChild.type);
            });

            return;
          }

          if (child.type === 'object') {
            const optionPath = path.concat([`Option${index}`]);
            const typeName = optionPath.map(toPascalCase).join('');

            stack.push({
              subSchema: child.children,
              children: Object.keys(child.children).reverse(),
              parentPath: optionPath,
              typeName,
              attributes: [],
            });

            unionTypes.push(typeName);
            return;
          }

          if (child.type === 'array') {
            if (child.items.type === 'object') {
              const itemPath = path.concat([`Item${index}`]);
              const typeName = itemPath.map(toPascalCase).join('');

              stack.push({
                subSchema: child.items.children,
                children: Object.keys(child.items.children).reverse(),
                parentPath: itemPath,
                typeName,
                attributes: [],
              });

              unionTypes.push(`${typeName}[]`);
            } else {
              unionTypes.push(`${child.items.type}[]`);
            }

            return;
          }

          unionTypes.push(child.type);
        });

        attributes.push([childNameQuoted, unionTypes.join(' | ')]);
        continue;
      }
      if (field.type === 'object') {
        const typeName = path.map(toPascalCase).join('');

        stack.push({
          subSchema: field.children,
          children: Object.keys(field.children).reverse(),
          parentPath: path,
          typeName,
          attributes: [],
        });

        attributes.push([childNameQuoted, typeName]);
        continue;
      }
      if (field.type === 'array') {
        if (field.items.type === 'object') {
          const typeName = path.map(toPascalCase).join('');

          stack.push({
            subSchema: field.items.children,
            children: Object.keys(field.items.children).reverse(),
            parentPath: path,
            typeName,
            attributes: [],
          });

          attributes.push([childNameQuoted, `${typeName}[]`]);
        } else if (field.items.type === 'union') {
          const unionTypes: string[] = [];

          field.items.children.forEach((child, index) => {
            if (child.type === 'union') {
              child.children.forEach((nestedChild) => {
                if (nestedChild.type === 'array') {
                  unionTypes.push(`${nestedChild.items.type}[]`);
                  return;
                }

                unionTypes.push(nestedChild.type);
              });

              return;
            }

            if (child.type === 'object') {
              const optionPath = path.concat([`Option${index}`]);
              const typeName = optionPath.map(toPascalCase).join('');

              stack.push({
                subSchema: child.children,
                children: Object.keys(child.children).reverse(),
                parentPath: optionPath,
                typeName,
                attributes: [],
              });

              unionTypes.push(typeName);
              return;
            }
          });

          attributes.push([childNameQuoted, `(${unionTypes.join(' | ')})[]`]);
        } else {
          attributes.push([childNameQuoted, `${field.items.type}[]`]);
        }

        continue;
      }
      let fieldType: string = field.type;
      let isOptional = true;
      if (field.validations) {
        for (const validation of field.validations) {
          if (field.type === 'string' && 'choices' in validation) {
            fieldType = validation.choices.map((c) => `'${c}'`).join(' | ');
          }

          if ('required' in validation && !('when' in validation)) {
            isOptional = false;
          }
        }
      }
      attributes.push([
        isOptional ? `${childNameQuoted}?` : childNameQuoted,
        fieldType,
      ]);
    }

    return types.reverse().join('\n\n') + '\n';
  };

  /**
   * generates a TypeScript interface definition for passed name and attributes
   *
   * @param {string} name
   * @param {Array<[string, string]>} attributes
   * @return {string}
   */
  private genTSInterface = (
    name: string,
    attributes: Array<[string, string]>,
  ): string => {
    return `export interface ${name} {
  ${attributes.map((attr) => `${attr[0]}: ${attr[1]};`).join('\n  ')}
}`;
  };

  /**
   * returns a characteristic object for values at a specific node config level
   *
   * @param {IConfig} config
   * @param {string} level
   * @return {Record<string, any>}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getConfigForLevel(config: IConfig, level: string): Record<string, any> {
    const confLevels = ConfigValidator.getNodeConfigLevels(config);
    const levelIndex = confLevels.indexOf(level);
    if (levelIndex === -1) {
      throw new Error(
        `The "${level}" level not found in the current system configuration levels`,
      );
    }
    const higherLevelSources = config.util
      .getConfigSources()
      .filter(
        (source) => confLevels.indexOf(getSourceName(source)) > levelIndex,
      );
    const currentLevelSource = config.util
      .getConfigSources()
      .filter((source) => getSourceName(source) === level)
      .at(0);
    const lowerLevelSources = config.util
      .getConfigSources()
      .filter(
        (source) => confLevels.indexOf(getSourceName(source)) < levelIndex,
      );

    // Traverses the schema object tree depth first
    const valueTree = ConfigValidator.processConfigForLevelNode(
      this.schema,
      [],
      higherLevelSources,
      currentLevelSource,
      lowerLevelSources,
    );

    return valueTree;
  }

  /**
   *traverses the config schema depth first to produce characteristic object
   *
   * @private
   * @static
   * @param {ConfigSchema} schema
   * @param {string[]} path
   * @param {IConfigSource[]} higherLevelSources
   * @param {(IConfigSource | undefined)} currentLevelSource
   * @param {IConfigSource[]} lowerLevelSources
   * @return {Record<string, any>}
   * @memberof ConfigValidator
   */
  private static processConfigForLevelNode(
    schema: ConfigSchema,
    path: string[],
    higherLevelSources: IConfigSource[],
    currentLevelSource: IConfigSource | undefined,
    lowerLevelSources: IConfigSource[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any> {
    const value = Object.create(null);
    for (const childName of Object.keys(schema).reverse()) {
      const childPath = path.concat([childName]);
      const field = schema[childName];
      // if a field is of type object and thus is a subtree, recurse on it.
      // Otherwise it's a leaf and needs no traversal.
      value[childName] = Object.create(null);
      if (field.type === 'object') {
        value[childName] = ConfigValidator.processConfigForLevelNode(
          field.children,
          childPath,
          higherLevelSources,
          currentLevelSource,
          lowerLevelSources,
        );
      } else {
        value[childName]['label'] =
          field.label != undefined ? field.label : null;
        value[childName]['description'] =
          field.description != undefined ? field.description : null;
        value[childName]['default'] = getValueFromConfigSources(
          lowerLevelSources,
          childPath,
        );
        value[childName]['value'] = getValueFromConfigSources(
          [...(currentLevelSource != undefined ? [currentLevelSource] : [])],
          childPath,
        );
        value[childName]['override'] = getValueFromConfigSources(
          higherLevelSources,
          childPath,
        );
      }
    }

    return value;
  }

  /**
   * returns a list of config sources used by node config package, ordered from
   * the lowest to the highest priority
   *
   * @static
   * @param {IConfig} config
   * @return  {string[]}
   */
  private static getNodeConfigLevels = (config: IConfig): string[] => {
    const instance = config.util.getEnv('NODE_APP_INSTANCE');
    let deployment = config.util.getEnv('NODE_ENV');
    deployment = config.util.getEnv('NODE_CONFIG_ENV');
    const fullHostname = config.util.getEnv('HOSTNAME');
    const shortHostname =
      fullHostname != undefined ? fullHostname.split('.')[0] : undefined;

    const configLevels = [
      'default',
      ...(instance != undefined ? [`default-${instance}`] : []),
      ...(deployment != undefined ? [`${deployment}`] : []),
      ...(instance != undefined && deployment != undefined
        ? [`${deployment}-${instance}`]
        : []),
      ...(shortHostname != undefined ? [`${shortHostname}`] : []),
      ...(shortHostname != undefined && instance != undefined
        ? [`${shortHostname}-${instance}`]
        : []),
      ...(shortHostname != undefined && deployment != undefined
        ? [`${shortHostname}-${deployment}`]
        : []),
      ...(shortHostname != undefined &&
      deployment != undefined &&
      instance != undefined
        ? [`${shortHostname}-${deployment}-${instance}`]
        : []),
      ...(fullHostname != undefined ? [`${fullHostname}`] : []),
      ...(fullHostname != undefined && instance != undefined
        ? [`${fullHostname}-${instance}`]
        : []),
      ...(fullHostname != undefined && deployment != undefined
        ? [`${fullHostname}-${deployment}`]
        : []),
      ...(fullHostname != undefined &&
      deployment != undefined &&
      instance != undefined
        ? [`${fullHostname}-${deployment}-${instance}`]
        : []),
      `local`,
      ...(instance != undefined ? [`local-${instance}`] : []),
      ...(deployment != undefined ? [`local-${deployment}`] : []),
      ...(deployment != undefined && instance != undefined
        ? [`local-${deployment}-${instance}`]
        : []),
      '$NODE_CONFIG',
      'custom-environment-variables',
    ];

    return configLevels;
  };

  /**
   * validates a config object and writes it to the node-config file
   * corresponding to the passed level
   *
   * @param {Record<string, any>} configObj
   * @param {IConfig} config
   * @param {string} level output node-config file level
   * @param {string} format the format of the output file
   */
  validateAndWriteConfig = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configObj: Record<string, any>,
    config: IConfig,
    level: string,
    format: string,
  ) => {
    const confLevels = ConfigValidator.getNodeConfigLevels(config).filter(
      (l) => l !== 'custom-environment-variables',
    );
    const levelIndex = confLevels.indexOf(level);
    if (levelIndex === -1) {
      throw new Error(
        `The [${level}] level not found in the current system's configuration levels`,
      );
    }

    const configDir =
      process.env['NODE_CONFIG_DIR'] != undefined
        ? process.env['NODE_CONFIG_DIR']
        : './config';
    let output = '';
    let ext = '';
    switch (format) {
      case 'json': {
        output = JsonBigInt.stringify(configObj);
        ext = 'json';
        break;
      }
      case 'yaml': {
        output = yaml.dump(configObj);
        ext = 'yaml';
        break;
      }
      default:
        throw Error(`Invalid format: ${format}`);
    }

    const outputPath = path.join(configDir, `${level}.${ext}`);
    const backupPath = path.join(configDir, `${level}-backup.${ext}`);
    const confFileExists = fs.existsSync(outputPath);
    if (confFileExists) {
      fs.renameSync(outputPath, backupPath);
    }
    fs.writeFileSync(outputPath, output);

    const updatedConfObj = config.util.loadFileConfigs();

    try {
      this.validateConfig(updatedConfObj);
      fs.unlinkSync(backupPath);
    } catch (error) {
      fs.unlinkSync(outputPath);
      if (confFileExists) {
        fs.renameSync(backupPath, outputPath);
      }
      throw error;
    }
  };
}
