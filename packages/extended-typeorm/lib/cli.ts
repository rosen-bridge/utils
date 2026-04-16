#!/usr/bin/env -S node --experimental-specifier-resolution=node

import chalk from 'chalk';
import { execSync } from 'child_process';
import ora from 'ora';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .command('$0', 'runs TypeORM CLI', {}, () => {
    const spinner = ora();
    spinner.start('Running TypeORM CLI');
    let argv = process.argv.slice(2).join(' ');
    try {
      execSync(`typeorm ${argv}`, {
        stdio: 'inherit',
      });
      spinner.succeed(chalk.green('TypeORM CLI executed successfully'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to run TypeORM CLI'));
      console.error(error);
    }
  })
  .demandCommand(1)
  .parse();
