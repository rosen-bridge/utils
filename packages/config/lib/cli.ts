#!/usr/bin/env -S node --experimental-specifier-resolution=node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import ora from 'ora';
import { ConfigValidator } from './index';
import * as fs from 'fs';
import JsonBigIntFactory from 'json-bigint';
import * as yaml from 'js-yaml';

const JsonBigInt = JsonBigIntFactory({
  alwaysParseAsBig: false,
  useNativeBigInt: true,
});

yargs(hideBin(process.argv))
  .command(
    'generate-default',
    'generates an object using the default values of the passed schema',
    (yargs) =>
      yargs
        .option('schema', {
          demandOption: true,
          description: 'input schema file path which should be in json format',
          type: 'string',
        })
        .option('output', {
          demandOption: true,
          description: 'generated default values output path',
          type: 'string',
        })
        .option('format', {
          demandOption: true,
          description: 'generated default values output path',
          choices: ['json', 'yaml'],
          default: 'json',
          type: 'string',
        }),
    async (argv) => {
      const spinner = ora();
      spinner.start(`Generating config default values`);

      const rawSchemaData = fs.readFileSync(argv.schema, 'utf-8');
      const schema = JsonBigInt.parse(rawSchemaData);

      const confValidator = new ConfigValidator(schema);
      const defaultConf = confValidator.generateDefault();

      let output = '';
      switch (argv.format) {
        case 'json': {
          output = JsonBigInt.stringify(defaultConf);
          break;
        }
        case 'yaml': {
          output = yaml.dump(defaultConf);
          break;
        }
      }

      fs.writeFileSync(argv.output, output);

      spinner.succeed(
        chalk.green(`default config values were output at "${argv.output}"`)
      );
    }
  )
  .command(
    'generate-ts-types',
    'generates compatible TypeScript interface types for the passed schema',
    (yargs) =>
      yargs
        .option('schema', {
          demandOption: true,
          description: 'input schema file path which should be in json format',
          type: 'string',
        })
        .option('output', {
          demandOption: true,
          description: 'generated TypeScript interfaces',
          type: 'string',
        })
        .option('rootType', {
          alias: 'root-type',
          demandOption: true,
          description: 'Name of top root interface',
          type: 'string',
        }),
    async (argv) => {
      const spinner = ora();
      spinner.start(`Generating TypeScript types`);

      const rawSchemaData = fs.readFileSync(argv.schema, 'utf-8');
      const schema = JsonBigInt.parse(rawSchemaData);

      const confValidator = new ConfigValidator(schema);
      const tsTypes = confValidator.generateTSTypes(argv.rootType);

      fs.writeFileSync(argv.output, tsTypes);

      spinner.succeed(
        chalk.green(`TypeScript types were output at "${argv.output}"`)
      );
    }
  )
  .demandCommand(1)
  .parse();
