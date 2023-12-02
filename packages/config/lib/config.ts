import {
  propertyValidators,
  supportedTypes,
} from './schema/Validators/fieldProperties';
import { ConfigField, ConfigSchema } from './schema/types/fields';

export class Config {
  constructor(private schema: ConfigSchema) {
    this.validateSchema();
  }

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

    while (stack.length > 0) {
      const { subSchema, parentPath } = stack.pop()!;
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
    for (const name of Object.keys(field)) {
      if (
        !Object.hasOwn(propertyValidators.all, name) &&
        !(
          field.type !== 'object' &&
          Object.hasOwn(propertyValidators.primitive, name)
        ) &&
        !Object.hasOwn(propertyValidators[field.type], name)
      ) {
        throw new Error(`schema field has unknown property "${name}"`);
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
   *
   *
   * @param {string[]} path
   * @return {(ConfigField | undefined)}
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
   * @return {{ [index: string]: any }} object of default values
   */
  generateDefault = (): { [index: string]: any } => {
    const valueTree: { [index: string]: any } = Object.create(null);

    const stack: {
      schema: ConfigSchema;
      parentValue: { [index: string]: any } | undefined;
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

    while (stack.length > 0) {
      const { schema, parentValue, fieldName, children } = stack.at(-1)!;
      if (children.length === 0) {
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
