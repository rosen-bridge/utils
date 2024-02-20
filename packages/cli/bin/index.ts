#!/usr/bin/env -S node --experimental-specifier-resolution=node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import ora from 'ora';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

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
      return yargs
        .positional('input', {
          type: 'string',
          demandOption: 'true',
        })
        .option('weak', {
          alias: 'w',
          description:
            "choose a weak api-key with own risk! (it isn't a recommended flag!)",
          default: false,
          type: 'boolean',
        });
    },
    (argv) => {
      const options = {
        translations: zxcvbnEnPackage.translations,
        graphs: zxcvbnCommonPackage.adjacencyGraphs,
        dictionary: {
          ...zxcvbnCommonPackage.dictionary,
          ...zxcvbnEnPackage.dictionary,
        },
      };

      zxcvbnOptions.setOptions(options);

      if (argv.weak) {
        console.log(
          `HASH: ${Buffer.from(blake2b(argv.input, undefined, 32)).toString(
            'hex'
          )}`
        );
        return;
      }
      const password_check = zxcvbn(argv.input);
      switch (password_check.score) {
        case 3:
        case 4:
          console.log(
            `HASH: ${Buffer.from(blake2b(argv.input, undefined, 32)).toString(
              'hex'
            )}`
          );
          break;
        default:
          if (password_check.feedback.warning)
            console.error(`Error: ${password_check.feedback}`);
          else console.error('your api-key is weak!');

          if (password_check.feedback.suggestions.length > 0) {
            console.warn('Suggestions:');
            password_check.feedback.suggestions.forEach((s) =>
              console.warn(`- ${s}`)
            );
          }
          break;
      }
    }
  )
  .demandCommand(1)
  .parse();
