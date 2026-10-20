/**
 * The formats a schema file can be written in.
 */
export const SchemaFormats = {
  Json: 'json',
  Yaml: 'yaml',
} as const;

export type SchemaFormat = (typeof SchemaFormats)[keyof typeof SchemaFormats];

/**
 * The format of a schema file by its extension.
 */
export const FORMAT_BY_EXTENSION: Readonly<Record<string, SchemaFormat>> = {
  '.json': SchemaFormats.Json,
  '.yaml': SchemaFormats.Yaml,
  '.yml': SchemaFormats.Yaml,
};

/**
 * The string forms of the booleans, which a `boolean` accepts (an
 * environment variable is always a string).
 */
export const BOOLEAN_BY_STRING: Readonly<Record<string, boolean>> = {
  true: true,
  false: false,
};
