import { IConfig } from 'config';
import config from 'config';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import JsonBigIntFactory from 'json-bigint';
import path from 'path';
import {
  propertyValidators,
  supportedTypes,
} from './schema/Validators/fieldProperties';
import { ConfigField, ConfigSchema } from './schema/types/fields';
import { When } from './schema/types/validations';
import { getSourceName, getValueFromConfigSources } from './utils';
import { valueValidations, valueValidators } from './value/validators';

declare const require: any;
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

  /**
   * generates compatible TypeScript interface for this instance's schema
   *
   * @param {string} name the name of root type
   * @return {string}
   */
  generateTSTypes = (name: string): string => {
    const errorPreamble = (path: Array<string>) =>
      `TypeScript type generation failed for "${path.join('.')}" field`;

    const types: Array<string> = [];

    const typeNames: Map<string, bigint> = new Map<string, bigint>();
    typeNames.set(name, 1n);

    const stack: Array<{
      subSchema: ConfigSchema;
      children: string[];
      parentPath: Array<string>;
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
      const { subSchema, children, parentPath, typeName, attributes } =
        stack.at(-1)!;
      const path = parentPath.concat([name]);
      try {
        // if a subtree's processing is finished go to the previous level
        if (children.length == 0) {
          types.push(this.genTSInterface(typeName, attributes));
          stack.pop();
          continue;
        }

        const childName = children.pop()!;
        const field = subSchema[childName];

        // if a node/field is of type object and thus is a subtree, add it to
        // the stack to be traversed later. Otherwise it's a leaf and needs no
        // traversal.
        if (field.type === 'object') {
          let childTypeName = `${childName[0].toUpperCase()}${childName.substring(
            1
          )}`;
          const typeNameCount = typeNames.get(childTypeName);
          typeNames.set(childTypeName, (typeNames.get(childName) || 0n) + 1n);
          if (typeNameCount) {
            childTypeName += typeNameCount.toString();
          }

          stack.push({
            subSchema: field.children,
            children: Object.keys(field.children).reverse(),
            parentPath: path,
            typeName: childTypeName,
            attributes: [],
          });

          attributes.push([childName, childTypeName]);
        } else {
          attributes.push([childName, field.type]);
        }
      } catch (error: any) {
        throw new Error(`${errorPreamble(path)}: ${error.message}`);
      }
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
    attributes: Array<[string, string]>
  ): string => {
    return `interface ${name} {
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
  getConfigForLevel(config: IConfig, level: string): Record<string, any> {
    const confLevels = ConfigValidator.getNodeConfigLevels(config);
    const levelIndex = confLevels.indexOf(level);
    if (levelIndex === -1) {
      throw new Error(
        `The "${level}" level not found in the current system configuration levels`
      );
    }
    const higherLevelSources = config.util
      .getConfigSources()
      .filter(
        (source) => confLevels.indexOf(getSourceName(source)) > levelIndex
      );
    const currentLevelSource = config.util
      .getConfigSources()
      .filter((source) => getSourceName(source) === level)
      .at(0);
    const lowerLevelSources = config.util
      .getConfigSources()
      .filter(
        (source) => confLevels.indexOf(getSourceName(source)) < levelIndex
      );

    const valueTree: Record<string, any> = Object.create(null);

    const stack: {
      schema: ConfigSchema;
      parentValue: Record<string, any> | undefined;
      parentPath: string[];
      name: string;
      children: string[];
    }[] = [
      {
        schema: this.schema,
        parentValue: undefined,
        parentPath: [],
        name: '',
        children: Object.keys(this.schema).reverse(),
      },
    ];

    // Traverses the schema object tree depth first
    while (stack.length > 0) {
      const { schema, parentValue, parentPath, name, children } = stack.at(-1)!;

      // if a subtree's processing is finished go to the previous level
      if (children.length === 0) {
        // if a subtree is empty (has no values) remove it from the result
        if (
          parentValue != undefined &&
          Object.keys(parentValue[name]).length === 0
        ) {
          delete parentValue[name];
        }
        stack.pop();
        continue;
      }

      const childName = children.pop()!;
      const childPath = parentPath.concat([childName]);
      const value = parentValue != undefined ? parentValue[name] : valueTree;
      const field = schema[childName];
      // if a field is of type object and thus is a subtree, add it to the stack
      // to be traversed later. Otherwise it's a leaf and needs no traversal.
      value[childName] = Object.create(null);
      if (field.type === 'object') {
        stack.push({
          schema: field.children,
          parentValue: value,
          parentPath: childPath,
          name: childName,
          children: Object.keys(field.children).reverse(),
        });
      } else {
        value[childName]['label'] =
          field.label != undefined ? field.label : null;
        value[childName]['description'] =
          field.description != undefined ? field.description : null;
        value[childName]['default'] = getValueFromConfigSources(
          lowerLevelSources,
          childPath
        );
        value[childName]['value'] = getValueFromConfigSources(
          [...(currentLevelSource != undefined ? [currentLevelSource] : [])],
          childPath
        );
        value[childName]['override'] = getValueFromConfigSources(
          higherLevelSources,
          childPath
        );
      }
    }

    return valueTree;
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
    configObj: Record<string, any>,
    config: IConfig,
    level: string,
    format: string
  ) => {
    const confLevels = ConfigValidator.getNodeConfigLevels(config).filter(
      (l) => l !== 'custom-environment-variables'
    );
    const levelIndex = confLevels.indexOf(level);
    if (levelIndex === -1) {
      throw new Error(
        `The "${level}" level not found in the current system's configuration levels`
      );
    }

    console.log(`RRRRRR`);
    fs.readdirSync('/').forEach((file) => {
      console.log(file);
    });
    console.log(`EEEEEE ${JSON.stringify(config.util.toObject())}`);

    const configDir =
      process.env['NODE_CONFIG_DIR'] != undefined
        ? process.env['NODE_CONFIG_DIR']
        : './config';
    let output = '';
    let ext = '';
    switch (format) {
      case 'json': {
        const JsonBigInt = JsonBigIntFactory({
          alwaysParseAsBig: false,
          useNativeBigInt: true,
        });
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
        throw Error(`Invalid format=${format}`);
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

// const schema = {
//   apiType: {
//     type: 'string',
//     default: 'explorer',
//     description: 'type of api to use',
//     label: 'api type',
//     validations: [
//       {
//         required: true,
//         error: 'error message when value not validated',
//       },
//       { choices: ['node', 'explorer'] },
//     ],
//   },
//   servers: {
//     type: 'object',
//     children: {
//       url: {
//         type: 'string',
//       },
//       port: {
//         type: 'number',
//       },
//     },
//   },
//   apis: {
//     type: 'object',
//     children: {
//       explorer: {
//         type: 'object',
//         children: {
//           url: {
//             type: 'string',
//             default: 'example.com',
//           },
//           port: {
//             type: 'number',
//             default: 443,
//           },
//         },
//       },
//     },
//   },
// };
// const confValidator = new ConfigValidator(<ConfigSchema>schema);
// const obj = { apiType: 'water' };
// confValidator.validateAndWriteConfig(obj, config, 'default', 'json');
