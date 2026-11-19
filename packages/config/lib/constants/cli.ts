/**
 * Exit codes of the CLI: invalid configuration or stale types (`invalid`),
 * schema problems (`schemaError`), a wrong command line (`usage`), or a
 * failed read, write or configuration load (`failed`).
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
