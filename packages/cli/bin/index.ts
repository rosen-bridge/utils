#!/usr/bin/env node --experimental-specifier-resolution=node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import ora from 'ora';

import { downloadRosenAssets } from '@rosen-bridge/utils';

const argv = yargs(hideBin(process.argv))
  .command(
    'download-assets',
    'download required Rosen assets (addresses and tokens files) from github',
    (argv) =>
      argv
        .option('chain-type', {
          alias: 'c',
          demandOption: true,
          description:
            'chain type whose assets will be downloaded (e.g. mainnet, testnet, etc.)',
          type: 'string',
        })
        .option('include-prereleases', {
          alias: 'p',
          description:
            'include pre-releases when searching for a matching release',
          type: 'boolean',
        })
        .option('out', {
          alias: 'o',
          demandOption: true,
          description: 'output directory path',
          type: 'string',
        })
        .option('suffix', {
          alias: 's',
          description: 'a suffix to be appended to all downloaded file names',
          type: 'string',
        })
  )
  .demandCommand(1)
  .parseSync();

const spinner = ora();
spinner.start(`downloading Rosen assets for "${argv.chainType}" chain type`);

await downloadRosenAssets(
  argv.chainType,
  argv.out,
  argv.includePrereleases,
  argv.suffix
);

spinner.succeed(
  chalk.green(
    `downloaded Rosen assets for "${argv.chainType}" chain type successfully`
  )
);
