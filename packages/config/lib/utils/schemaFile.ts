import { CORE_SCHEMA, load } from 'js-yaml';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { JsonBigIntFactory } from '@rosen-bridge/json-bigint';

import {
  FORMAT_BY_EXTENSION,
  SchemaFormat,
  SchemaFormats,
} from '../constants/index.js';
import { ParseResult, fail, ok } from '../parsing/result.js';
import { isRecord } from './guards.js';

/**
 * Parses JSON keeping every digit of an integer: an integer beyond the safe
 * integer range is a `bigint`, any other number a `number`.
 */
const JsonBigInt = JsonBigIntFactory({
  alwaysParseAsBig: false,
  useNativeBigInt: true,
});

/**
 * Parses the text of a schema file in `format`. YAML is read with the core
 * schema, so it only has JSON values (no dates or other YAML types).
 * @param text - the content of the file
 * @param format - the format of the file
 */
const parseSchemaText = (text: string, format: SchemaFormat): unknown => {
  return format === SchemaFormats.Json
    ? JsonBigInt.parse(text)
    : load(text, { schema: CORE_SCHEMA });
};

/**
 * The problem at `''` of the schema file, with the reason of `error` when it
 * has a message (JSON's parser throws objects that are not `Error`s).
 * @param filePath - the path of the schema file
 * @param text - what is wrong with the file
 * @param error - the error thrown while reading or parsing it
 */
const fileError = (
  filePath: string,
  text: string,
  error?: unknown,
): ParseResult<never> => {
  const reason =
    isRecord(error) && typeof error.message === 'string'
      ? `: ${error.message}`
      : '';
  return fail([
    {
      path: '',
      message: `the schema file ${JSON.stringify(filePath)} ${text}${reason}`,
    },
  ]);
};

/**
 * The schema in a file, parsed in `format` or else in the format of its
 * extension (`.json`, `.yaml` or `.yml`), or a problem when it cannot be read.
 * @param filePath - the path of the schema file
 * @param logger - receives the logs of reading
 * @param format - the format of the file (default: its extension)
 */
export const readSchemaFile = (
  filePath: string,
  logger: AbstractLogger,
  format?: SchemaFormat,
): ParseResult<unknown> => {
  const fileFormat =
    format ?? FORMAT_BY_EXTENSION[extname(filePath).toLowerCase()];
  if (fileFormat === undefined)
    return fileError(
      filePath,
      'has an unknown format: use a .json, .yaml or .yml extension or give the format',
    );
  logger.debug(
    `reading the schema file ${JSON.stringify(filePath)} as ${fileFormat}`,
  );
  let text: string;
  try {
    text = readFileSync(filePath, 'utf8');
  } catch (error) {
    return fileError(filePath, 'cannot be read', error);
  }
  try {
    return ok(parseSchemaText(text, fileFormat));
  } catch (error) {
    return fileError(
      filePath,
      `is not valid ${fileFormat === SchemaFormats.Json ? 'JSON' : 'YAML'}`,
      error,
    );
  }
};
