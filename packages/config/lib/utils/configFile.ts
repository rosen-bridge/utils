import { dump } from 'js-yaml';
import { writeFileSync } from 'node:fs';
import { extname } from 'node:path';

import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigint from '@rosen-bridge/json-bigint';

import {
  FORMAT_BY_EXTENSION,
  SchemaFormat,
  SchemaFormats,
} from '../constants/index.js';

/**
 * `value` as plain values for YAML, which cannot write a `bigint`: each
 * `bigint` becomes its decimal string, read back with every digit.
 * @param value - the value to convert
 */
const toPlain = (value: unknown): unknown =>
  JSON.parse(
    JSON.stringify(value, (_key, item) =>
      typeof item === 'bigint' ? item.toString() : item,
    ),
  );

/**
 * Writes `value` for the `config` package in `format`, or else the format of
 * the file's extension; JSON keeps every digit of a `bigint` (`JsonBigInt`).
 * Throws when the format is not known or the file cannot be written.
 * @param fileName - the file to write
 * @param value - the value to write
 * @param logger - receives the log of the write
 * @param format - the format of the file (default: its extension)
 */
export const writeConfigFile = (
  fileName: string,
  value: unknown,
  logger: AbstractLogger,
  format?: SchemaFormat,
): void => {
  const fileFormat =
    format ?? FORMAT_BY_EXTENSION[extname(fileName).toLowerCase()];
  if (fileFormat === undefined)
    throw new Error(
      `the file ${JSON.stringify(fileName)} has an unknown format: use a .json, .yaml or .yml extension or give the format`,
    );
  const text =
    fileFormat === SchemaFormats.Json
      ? `${JsonBigint.stringify(value, undefined, 2)}\n`
      : dump(toPlain(value));
  writeFileSync(fileName, text);
  logger.info(`written ${JSON.stringify(fileName)} as ${fileFormat}`);
};
