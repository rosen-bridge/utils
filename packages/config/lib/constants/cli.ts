/**
 * Exit codes of the CLI: the configuration is not valid or the types are out
 * of date (`invalid`), the schema has problems (`schemaError`), the command
 * line is wrong (`usage`), or a file cannot be read or written or the
 * configuration cannot be loaded (`failed`).
 */
export const EXIT = {
  ok: 0,
  invalid: 1,
  schemaError: 2,
  usage: 3,
  failed: 4,
} as const;

/**
 * Commands of the CLI.
 */
export const CliCommands = {
  Check: 'check',
  CheckTypes: 'check-types',
  GenerateTsTypes: 'generate-ts-types',
  GenerateDefault: 'generate-default',
  GenerateEnv: 'generate-env',
  Validate: 'validate',
} as const;

/**
 * Options of the CLI commands.
 */
export const CliOptions = {
  Schema: 'schema',
  SchemaFormat: 'schema-format',
  Output: 'output',
  Types: 'types',
  RootType: 'root-type',
  Format: 'format',
  All: 'all',
  Prefix: 'prefix',
  ConfigDir: 'config-dir',
  Env: 'env',
  Hash: 'hash',
} as const;

/**
 * Short names of CLI options.
 */
export const CliShortOptions = {
  Schema: 's',
  Output: 'o',
  Types: 't',
  Format: 'f',
  RootType: 'r',
  All: 'a',
} as const;

/**
 * The package manifest, relative to the CLI module (`lib/cli.ts` and
 * `dist/cli.js` alike), which `--version` reads.
 */
export const PACKAGE_MANIFEST = '../package.json';
