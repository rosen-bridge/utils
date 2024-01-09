#!/usr/bin/env -S node --experimental-specifier-resolution=node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import ora from 'ora';

import { downloadRosenAssets } from '@rosen-bridge/utils';
import { EdDSA } from '@rosen-bridge/tss';
import { blake2b } from 'blakejs';

yargs(hideBin(process.argv))
  .command(
    'download-assets',
    'download required Rosen assets (addresses and tokens files) from github',
    (yargs) =>
      yargs
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
        }),
    async (argv) => {
      const spinner = ora();
      spinner.start(
        `downloading Rosen assets for "${argv.chainType}" chain type`
      );

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
    }
  )
  .command(
    'tss-secret-generate',
    'generate EdDSA Tss publicKey/secret',
    async () => {
      const secret = await EdDSA.randomKey();
      const eddsa = new EdDSA(secret);

      console.log(`SECRET: ${secret}`);
      console.log(`PK: ${await eddsa.getPk()}`);
    }
  )
  .command(
    'blake2b-hash [input]',
    'blake2b hash of specified input',
    (yargs) => {
      return yargs.positional('input', {
        type: 'string',
        demandOption: 'true',
      });
    },
    (argv) => {
      console.log(
        `HASH: ${Buffer.from(blake2b(argv.input, undefined, 32)).toString(
          'hex'
        )}`
      );
    }
  )
  .demandCommand(1)
  .parse();
