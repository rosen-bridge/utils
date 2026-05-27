#!/usr/bin/env -S tsx

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import packageJson from '../package.json' with { type: 'json' };
import { generateDependencyGraph, type OutputFormat } from './dependencyGraph';

yargs(hideBin(process.argv))
  .version(packageJson.version)
  .alias('version', 'V')
  .help()
  .alias('help', 'h')
  .command(
    'dependency-graph <path>',
    'Draw the dependency graph of services under the given path',
    (yargs) => {
      return yargs
        .positional('path', {
          type: 'string',
          demandOption: true,
          describe: 'Path to the project root to scan for services',
        })
        .option('dependency', {
          alias: 'd',
          description: "Filter by dependency type: 'assemble' or 'start'",
          type: 'string',
          choices: ['assemble', 'start'] as const,
        })
        .option('service', {
          alias: 's',
          description: 'Draw the dependency tree only for the given service',
          type: 'string',
        })
        .option('output', {
          alias: 'o',
          description:
            'Base name for the generated output files (without extension)',
          type: 'string',
          default: 'graph',
        })
        .option('format', {
          alias: 'f',
          description: 'Output format(s) to generate',
          type: 'string',
          choices: ['svg', 'dot'] as const,
          array: true,
          default: ['svg'],
        })
        .option('verbose', {
          alias: 'v',
          description: 'Enable verbose logging (debug, info, and warnings)',
          type: 'boolean',
          default: false,
        });
    },
    async (argv) => {
      await generateDependencyGraph({
        projectRoot: argv.path as string,
        dependencyFilter: argv.dependency as 'assemble' | 'start' | undefined,
        serviceFilter: argv.service,
        outputName: argv.output,
        formats: argv.format as OutputFormat[],
        verbose: argv.verbose,
      });
    },
  )
  .demandCommand(1, 'You must provide a command')
  .parse();
