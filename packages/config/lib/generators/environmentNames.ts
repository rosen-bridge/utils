import type { AbstractLogger } from '@rosen-bridge/abstract-logger';

import { ENV_NAME_SEPARATOR, PATH_SEPARATOR } from '../constants/index.js';
import { envName } from '../utils/format.js';
import { isRecord } from '../utils/guards.js';

/**
 * What the `custom-environment-variables` file of the `config` package maps
 * a configuration key to: the name of the environment variable that sets
 * it, or the mapping of its own keys.
 */
export type EnvironmentVariable = string | EnvironmentTree;

/**
 * The mapping of the keys of an object to their environment variables, the
 * content of the `custom-environment-variables` file.
 */
export interface EnvironmentTree {
  readonly [key: string]: EnvironmentVariable;
}

/**
 * Names the environment variables of a configuration after their paths in
 * UPPER_SNAKE_CASE, after the prefix (`server.tls.key` → `SERVER_TLS_KEY`),
 * for secret values only or every value; two paths with one name are logged
 * as a warning.
 */
export class EnvironmentNames {
  /**
   * The path of each name given so far.
   */
  private readonly paths = new Map<string, string>();

  private readonly prefix: string;

  /**
   * Names the variables of every value, or only of the secret ones.
   * @param all - whether every value gets a variable, not only secret ones
   * @param prefix - the prefix of every name, converted to UPPER_SNAKE_CASE
   * @param logger - receives the warnings about names
   */
  constructor(
    readonly all: boolean,
    prefix: string,
    private readonly logger: AbstractLogger,
  ) {
    this.prefix = envName(prefix);
  }

  /**
   * The variable of the value at `path`, or `undefined` when its path has no
   * letters or digits; two paths with one name are logged as a warning.
   * @param path - the configuration path of the value
   */
  name = (path: readonly string[]): string | undefined => {
    const shown = JSON.stringify(path.join(PATH_SEPARATOR));
    const words = path.map(envName).filter((word) => word !== '');
    if (words.length === 0) {
      this.logger.warn(
        `${shown} has no letters or digits, so it gets no environment variable`,
      );
      return undefined;
    }
    const name = [this.prefix, ...words]
      .filter((word) => word !== '')
      .join(ENV_NAME_SEPARATOR);
    const other = this.paths.get(name);
    if (other === undefined) this.paths.set(name, shown);
    else if (other !== shown)
      this.logger.warn(
        `${other} and ${shown} both get the environment variable ${name}`,
      );
    return name;
  };
}

/**
 * The variables of the options of a union merged: the keys of every tree,
 * merged again when several trees have them; a tree wins over a variable
 * name. `undefined` when no option gives one.
 * @param variables - the variables of each option
 */
export const mergeVariables = (
  variables: readonly (EnvironmentVariable | undefined)[],
): EnvironmentVariable | undefined => {
  const found = variables.filter(
    (variable): variable is EnvironmentVariable => variable !== undefined,
  );
  const trees = found.filter(isRecord) as EnvironmentTree[];
  if (trees.length === 0) return found[0];
  const keys = [...new Set(trees.flatMap((tree) => Object.keys(tree)))];
  return Object.fromEntries(
    keys.map((key) => [
      key,
      mergeVariables(trees.map((tree) => tree[key])) as EnvironmentVariable,
    ]),
  );
};
