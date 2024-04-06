#!/usr/bin/env -S node --experimental-specifier-resolution=node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import ora from 'ora';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

import { downloadRosenAssets } from '@rosen-bridge/utils';
import { ECDSA, EdDSA } from '@rosen-bridge/tss';
import { blake2b } from 'blakejs';
import { randomBytes } from 'crypto';

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
    'generate Tss publicKey/secret',
    (yargs) => {
      return yargs.option('type', {
        alias: 't',
        description: "type of publicKey/secret 'ecdsa' or 'eddsa'",
        type: 'string',
        demandOption: true,
      });
    },
    async (argv) => {
      if (argv.type && argv.type.toLowerCase() === 'eddsa') {
        const secret = await EdDSA.randomKey();
        const eddsa = new EdDSA(secret);

        console.log(`EdDSA SECRET: ${secret}`);
        console.log(`EdDSA PK: ${await eddsa.getPk()}`);
      } else if (argv.type && argv.type.toLowerCase() === 'ecdsa') {
        const secret = await ECDSA.randomKey();
        const ecdsa = new ECDSA(secret);

        console.log(`ECDSA SECRET: ${secret}`);
        console.log(`ECDSA PK: ${await ecdsa.getPk()}`);
      } else
        console.error(
          `Type of your secret is wrong should be one of 'ecdsa', 'eddsa'`
        );
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

      const passwordCheck = zxcvbn(argv.input);
      if (!argv.weak) {
        if (![3, 4].includes(passwordCheck.score)) {
          if (passwordCheck.feedback.warning)
            console.error(`Error: ${passwordCheck.feedback}`);
          else console.error('Your api-key is weak!');

          if (passwordCheck.feedback.suggestions.length > 0) {
            console.warn('Suggestions:');
            passwordCheck.feedback.suggestions.forEach((s) =>
              console.warn(`- ${s}`)
            );
          }
          return;
        }
      }
      // size of salt should be between 8 and 96 bits
      const saltSizeInBytes = (Math.random() * (96 - 8) + 8) / 8;
      const randomSalt = randomBytes(saltSizeInBytes);
      const saltedPass = Buffer.concat([randomSalt, Buffer.from(argv.input)]);
      console.log(
        `HASH: $${randomSalt.toString('base64')}$${Buffer.from(
          blake2b(saltedPass, undefined, 32)
        ).toString('base64')}`
      );
    }
  )
  .demandCommand(1)
  .parse();
