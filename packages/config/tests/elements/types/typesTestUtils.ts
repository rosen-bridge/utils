import { DummyLogger } from '@rosen-bridge/abstract-logger';

import type {
  TypeElement,
  TypeScriptResult,
} from '../../../lib/elements/types/typeElement';
import {
  EnvironmentNames,
  EnvironmentVariable,
} from '../../../lib/generators/environmentNames';
import { TypeNames } from '../../../lib/generators/typeNames';
import { createReading } from '../../../lib/parsing/reading';
import { ParseResult } from '../../../lib/parsing/result';
import { parseType, unwrap } from '../../testUtils';

/**
 * A type parsed from `node`, which must be valid.
 * @param node - the type node
 */
export const type = (node: unknown): TypeElement => unwrap(parseType(node));

/**
 * Reads `value` with `element` as a configuration value at `pointer`.
 * @param element - the type
 * @param value - the value, `undefined` when it is not set
 * @param pointer - the configuration path of the value
 */
export const read = (
  element: TypeElement,
  value: unknown,
  pointer = 'value',
): ParseResult<unknown> =>
  element.normalize(value, pointer, createReading('', {}));

/**
 * The TypeScript of `element` at the path `['config']`, generated in two
 * passes like `SchemaDocument.generateTypes`.
 * @param element - the type
 */
export const code = (element: TypeElement): TypeScriptResult => {
  const names = new TypeNames();
  element.code(['config'], names);
  names.finish();
  return element.code(['config'], names);
};

/**
 * The environment variables of `element` at the path `['app']`.
 * @param element - the type
 * @param all - whether every value gets a variable
 */
export const environment = (
  element: TypeElement,
  all = false,
): EnvironmentVariable | undefined =>
  element.environment(
    ['app'],
    new EnvironmentNames(all, '', new DummyLogger()),
  );

/**
 * The paths of the problems of a failed result.
 * @param result - the result
 */
export const errorPaths = (result: ParseResult<unknown>): string[] =>
  result.ok ? [] : result.errors.map(({ path }) => path);

/**
 * The problems of a failed result.
 * @param result - the result
 */
export const errors = (result: ParseResult<unknown>) =>
  result.ok ? [] : result.errors;
