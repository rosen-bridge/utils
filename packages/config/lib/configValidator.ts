import type nodeConfig from 'config';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

import {
  HASH_CONSTANT,
  HASH_PATTERN,
  SchemaFormat,
} from './constants/index.js';
import { SchemaDocument } from './elements/document/schemaDocument.js';
import { ParseResult, SchemaError, fail, ok } from './parsing/result.js';
import { writeConfigFile } from './utils/configFile.js';
import { isRecord } from './utils/guards.js';
import { readSchemaFile } from './utils/schemaFile.js';

/**
 * Loads `config` with CommonJS, so `buildConfig` can load it synchronously
 * on its first call instead of when this package is imported.
 */
const load = createRequire(import.meta.url);

/**
 * Logs the problems of a schema as a warning and fails with them.
 * @param errors - the problems found
 * @param logger - receives the warning
 */
const invalid = (
  errors: readonly SchemaError[],
  logger: AbstractLogger,
): ParseResult<never> => {
  logger.warn(`the schema has ${errors.length} problems`, { errors });
  return fail(errors);
};

/**
 * Validates configurations against a schema. It is created from a parsed
 * schema with `fromSchema`, or from a schema file with `fromFile`, which
 * read the schema into a `SchemaDocument` once.
 */
export class ConfigValidator {
  /**
   * A validator of the schema `document`; it is created with `fromSchema` or
   * `fromFile`.
   * @param document - the parsed schema document
   */
  private constructor(private readonly document: SchemaDocument) {}

  /**
   * A validator for a parsed schema document (`{ definitions?, schema }`), or
   * every problem found in the schema, at its path in it.
   * @param schema - the parsed schema document
   * @param logger - receives the logs of the document (none by default)
   * @param file - the file it was read from, for imports (none: no imports)
   */
  static fromSchema = (
    schema: Record<string, unknown>,
    logger: AbstractLogger = new DummyLogger(),
    file?: string,
  ): ParseResult<ConfigValidator> => {
    const document = SchemaDocument.initialize(
      logger,
      file === undefined ? undefined : resolve(file),
    ).parse(schema);
    if (!document.ok) return invalid(document.errors, logger);
    logger.info('the schema is read');
    return ok(new ConfigValidator(document.value));
  };

  /**
   * A validator for the schema in a JSON or YAML file, passed to `fromSchema`,
   * or every problem found (a file that cannot be read is one problem at `''`).
   * @param fileName - the schema file
   * @param format - the format of the file (default: its extension)
   * @param logger - receives the logs of reading and of the document
   */
  static fromFile = (
    fileName: string,
    format?: SchemaFormat,
    logger: AbstractLogger = new DummyLogger(),
  ): ParseResult<ConfigValidator> => {
    const schema = readSchemaFile(fileName, logger, format);
    if (!schema.ok) return invalid(schema.errors, logger);
    if (!isRecord(schema.value))
      return invalid(
        [{ path: '', message: 'the schema document must be an object' }],
        logger,
      );
    return ConfigValidator.fromSchema(schema.value, logger, fileName);
  };

  /**
   * Whether the `SCHEMA_HASH` of a file written by `generateTypes` is still
   * the hash of the schema. Throws when the file cannot be read or has no
   * `SCHEMA_HASH`.
   * @param fileName - the generated TypeScript file
   */
  checkTypes = (fileName: string): boolean => {
    const found = HASH_PATTERN.exec(readFileSync(fileName, 'utf8'));
    if (found === null)
      throw new Error(
        `${JSON.stringify(fileName)} has no ${HASH_CONSTANT}: generate the types again`,
      );
    const hash = this.document.hash();
    const upToDate = found[1] === hash;
    this.document.logger.info(
      `the types in ${JSON.stringify(fileName)} are ${upToDate ? 'up to date' : 'out of date'}`,
      { expectedHash: found[1], hash },
    );
    return upToDate;
  };

  /**
   * Writes the default configuration (`{}` when there is none) in `format` or
   * the format of its extension. Throws when the format is not known or the
   * file cannot be written.
   * @param fileName - the file to write
   * @param format - the format of the file (default: its extension)
   */
  defaults = (fileName: string, format?: SchemaFormat): void => {
    writeConfigFile(
      fileName,
      this.document.defaultValue() ?? {},
      this.document.logger,
      format,
    );
  };

  /**
   * Writes the `custom-environment-variables` file of the `config` package,
   * in `format` or the format of its extension. Throws when the format is not
   * known or the file cannot be written.
   * @param fileName - the file to write
   * @param format - the format of the file (default: its extension)
   * @param all - whether every value gets a variable, not only secret ones
   * @param prefix - the prefix of every variable name
   */
  environment = (
    fileName: string,
    format?: SchemaFormat,
    all = false,
    prefix = '',
  ): void => {
    writeConfigFile(
      fileName,
      this.document.environment(all, prefix),
      this.document.logger,
      format,
    );
  };

  /**
   * Writes the TypeScript types of the configuration and `SCHEMA_HASH` to a
   * file. Throws when the file cannot be written.
   * @param fileName - the file to write
   * @param rootName - the name of the root type (default: from the schema `id`)
   */
  generateTypes = (fileName: string, rootName?: string): void => {
    writeFileSync(fileName, this.document.generateTypes(rootName));
    this.document.logger.info(
      `the types are written to ${JSON.stringify(fileName)}`,
    );
  };

  /**
   * Validates a configuration object: the read configuration (string forms
   * converted, defaults applied), deeply frozen, or every problem found.
   * @param config - a configuration object (parsed JSON, or a loaded one)
   * @param expectedHash - the `SCHEMA_HASH` the schema must still have
   */
  validate = <T = unknown>(
    config: unknown,
    expectedHash?: string,
  ): ParseResult<T> => {
    return this.document.validate<T>(config, expectedHash);
  };

  /**
   * Validates the configuration of the `config` package singleton with
   * `validate`; `config` is loaded on the first call, then once per process.
   * Throws when the configuration cannot be loaded.
   * @param expectedHash - the `SCHEMA_HASH` the schema must still have
   */
  buildConfig = <T = unknown>(expectedHash?: string): ParseResult<T> => {
    const { logger } = this.document;
    logger.debug('loading the configuration with the config package');
    let config: unknown;
    try {
      config = (load('config') as typeof nodeConfig).util.toObject();
    } catch (error) {
      logger.error('the configuration cannot be loaded', error);
      throw error;
    }
    return this.validate<T>(config, expectedHash);
  };
}
