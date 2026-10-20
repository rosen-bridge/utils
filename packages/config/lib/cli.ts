#!/usr/bin/env node
import { createRequire } from 'node:module';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { ConfigValidator } from './configValidator.js';
import {
  CliCommands,
  CliOptions,
  CliShortOptions,
  EXIT,
  PACKAGE_MANIFEST,
  SchemaFormat,
  SchemaFormats,
} from './constants/index.js';
import { SchemaError } from './parsing/result.js';

/**
 * The name of the command, in usage and messages.
 */
const SCRIPT_NAME = 'config';

/**
 * Loads the package manifest for `--version`.
 */
const load = createRequire(import.meta.url);

/**
 * The formats of schema and output files.
 */
const FORMATS: readonly SchemaFormat[] = Object.values(SchemaFormats);

/**
 * Prints the problems of `subject`, one per line at its path.
 * @param subject - what has the problems (a schema file, the configuration)
 * @param errors - the problems
 */
const printErrors = (subject: string, errors: readonly SchemaError[]): void => {
  console.error(`${subject}: ${errors.length} problem(s)`);
  for (const { path, message } of errors)
    console.error(`  ${path || '(root)'}: ${message}`);
};

/**
 * The validator of a schema file, or `undefined` (with the schema-error exit
 * code) after printing its problems.
 * @param schema - the schema file
 * @param format - the format of the file (default: its extension)
 */
const readSchema = (
  schema: string,
  format?: SchemaFormat,
): ConfigValidator | undefined => {
  const validator = ConfigValidator.fromFile(schema, format);
  if (validator.ok) return validator.value;
  printErrors(schema, validator.errors);
  process.exitCode = EXIT.schemaError;
  return undefined;
};

/**
 * Prints an error that stopped a command and sets the failed exit code.
 * @param error - the thrown error
 */
const failed = (error: unknown): void => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = EXIT.failed;
};

/**
 * Runs `action`, then prints `done`; when it throws, prints the error
 * instead and sets the failed exit code.
 * @param action - writes a file
 * @param done - the line printed when it succeeds
 */
const run = (action: () => void, done: string): void => {
  try {
    action();
    console.log(done);
  } catch (error) {
    failed(error);
  }
};

/**
 * Prints a usage error and exits.
 * @param message - the problem with the command line
 */
const usageError = (message: string): never => {
  console.error(`${message}\nRun ${SCRIPT_NAME} --help for usage.`);
  process.exit(EXIT.usage);
};

const schema = {
  type: 'string',
  alias: CliShortOptions.Schema,
  demandOption: true,
  describe: 'The schema file (.json, .yaml or .yml)',
} as const;

const output = {
  type: 'string',
  alias: CliShortOptions.Output,
  demandOption: true,
  describe: 'The file to write (replaced when it exists)',
} as const;

const format = {
  choices: FORMATS,
  alias: CliShortOptions.Format,
  describe: 'The format of the file to write (default: its extension)',
} as const;

const schemaFormat = {
  choices: FORMATS,
  describe: 'The format of the schema file (default: its extension)',
} as const;

yargs(hideBin(process.argv))
  .scriptName(SCRIPT_NAME)
  .command(
    CliCommands.Check,
    'Read a schema and report its problems',
    (y) =>
      y.options({
        [CliOptions.Schema]: schema,
        [CliOptions.Format]: { ...schemaFormat, alias: CliShortOptions.Format },
      }),
    (args) => {
      const validator = readSchema(
        args.schema,
        args[CliOptions.Format] as SchemaFormat | undefined,
      );
      if (validator) console.log(`${args.schema}: valid`);
    },
  )
  .command(
    CliCommands.CheckTypes,
    'Check that generated types still have the SCHEMA_HASH of the schema',
    (y) =>
      y.options({
        [CliOptions.Schema]: schema,
        [CliOptions.Types]: {
          type: 'string',
          alias: CliShortOptions.Types,
          demandOption: true,
          describe: `The TypeScript file written by ${CliCommands.GenerateTsTypes}`,
        },
        [CliOptions.Format]: { ...schemaFormat, alias: CliShortOptions.Format },
      }),
    (args) => {
      const validator = readSchema(
        args.schema,
        args[CliOptions.Format] as SchemaFormat | undefined,
      );
      if (!validator) return;
      try {
        if (validator.checkTypes(args.types)) {
          console.log(`${args.types}: up to date`);
          return;
        }
        console.error(
          `${args.types}: the schema changed since these types were generated: run ${SCRIPT_NAME} ${CliCommands.GenerateTsTypes} again`,
        );
        process.exitCode = EXIT.invalid;
      } catch (error) {
        failed(error);
      }
    },
  )
  .command(
    CliCommands.GenerateTsTypes,
    'Write the TypeScript types of the configuration',
    (y) =>
      y.options({
        [CliOptions.Schema]: schema,
        [CliOptions.SchemaFormat]: schemaFormat,
        [CliOptions.Output]: output,
        [CliOptions.RootType]: {
          type: 'string',
          alias: CliShortOptions.RootType,
          describe: 'The name of the root type (default: from the schema id)',
        },
      }),
    (args) => {
      const validator = readSchema(
        args.schema,
        args[CliOptions.SchemaFormat] as SchemaFormat | undefined,
      );
      if (validator)
        run(
          () => validator.generateTypes(args.output, args[CliOptions.RootType]),
          `${args.schema}: types written to ${args.output}`,
        );
    },
  )
  .command(
    CliCommands.GenerateDefault,
    'Write the default configuration',
    (y) =>
      y.options({
        [CliOptions.Schema]: schema,
        [CliOptions.SchemaFormat]: schemaFormat,
        [CliOptions.Output]: output,
        [CliOptions.Format]: format,
      }),
    (args) => {
      const validator = readSchema(
        args.schema,
        args[CliOptions.SchemaFormat] as SchemaFormat | undefined,
      );
      if (validator)
        run(
          () =>
            validator.defaults(
              args.output,
              args[CliOptions.Format] as SchemaFormat | undefined,
            ),
          `${args.schema}: defaults written to ${args.output}`,
        );
    },
  )
  .command(
    CliCommands.GenerateEnv,
    'Write the custom-environment-variables file of the config package',
    (y) =>
      y.options({
        [CliOptions.Schema]: schema,
        [CliOptions.SchemaFormat]: schemaFormat,
        [CliOptions.Output]: output,
        [CliOptions.Format]: format,
        [CliOptions.All]: {
          type: 'boolean',
          alias: CliShortOptions.All,
          default: false,
          describe: 'Map every value, not only the secret ones',
        },
        [CliOptions.Prefix]: {
          type: 'string',
          default: '',
          describe: 'The prefix of every variable name',
        },
      }),
    (args) => {
      const validator = readSchema(
        args.schema,
        args[CliOptions.SchemaFormat] as SchemaFormat | undefined,
      );
      if (validator)
        run(
          () =>
            validator.environment(
              args.output,
              args[CliOptions.Format] as SchemaFormat | undefined,
              args[CliOptions.All],
              args[CliOptions.Prefix],
            ),
          `${args.schema}: environment variables written to ${args.output}`,
        );
    },
  )
  .command(
    CliCommands.Validate,
    'Validate the configuration loaded by the config package',
    (y) =>
      y.options({
        [CliOptions.Schema]: schema,
        [CliOptions.Format]: { ...schemaFormat, alias: CliShortOptions.Format },
        [CliOptions.ConfigDir]: {
          type: 'string',
          describe:
            'The configuration directory (default: NODE_CONFIG_DIR or ./config)',
        },
        [CliOptions.Env]: {
          type: 'string',
          describe:
            'The deployment to load (default: NODE_CONFIG_ENV or NODE_ENV)',
        },
        [CliOptions.Hash]: {
          type: 'string',
          describe: 'The SCHEMA_HASH of the generated types, to check first',
        },
      }),
    (args) => {
      const validator = readSchema(
        args.schema,
        args[CliOptions.Format] as SchemaFormat | undefined,
      );
      if (!validator) return;
      // The config package reads these when it is loaded, on the first
      // buildConfig.
      const configDir = args[CliOptions.ConfigDir];
      if (configDir !== undefined) process.env.NODE_CONFIG_DIR = configDir;
      if (args.env !== undefined) process.env.NODE_CONFIG_ENV = args.env;
      try {
        const result = validator.buildConfig(args[CliOptions.Hash]);
        if (result.ok) {
          console.log('the configuration is valid');
          return;
        }
        printErrors('configuration', result.errors);
        process.exitCode = EXIT.invalid;
      } catch (error) {
        failed(error);
      }
    },
  )
  .demandCommand(1, 'expected a command')
  .strict()
  .alias('h', 'help')
  .version((load(PACKAGE_MANIFEST) as { version: string }).version)
  .fail((message, error) => usageError(message ?? error.message))
  .parse();
