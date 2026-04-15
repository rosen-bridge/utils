#!/usr/bin/env -S node --experimental-specifier-resolution=node

import chalk from 'chalk';
import { execSync } from 'child_process';
import ora from 'ora';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .command(
    'generate:sqlite',
    'generates a SQLite migration for the project',
    (yargs) =>
      yargs.option('output', {
        alias: 'o',
        demandOption: true,
        description: 'output path for the SQLite migration',
        type: 'string',
      }),
    async (argv) => {
      const spinner = ora();
      spinner.start('Generating SQLite migration');

      try {
        execSync(
          `npx run typeorm migration:generate ${argv.output} -- -p -d ./config/dataSource.ts`,
          { stdio: 'inherit' },
        );
        spinner.succeed(
          chalk.green(`SQLite migration generated at "${argv.output}"`),
        );
      } catch (error) {
        spinner.fail(chalk.red('Failed to generate SQLite migration'));
        console.error(error);
      }
    },
  )
  .command(
    'generate:postgres',
    'generates a PostgreSQL migration for the project',
    (yargs) =>
      yargs.option('output', {
        alias: 'o',
        demandOption: true,
        description: 'output path for the PostgreSQL migration',
        type: 'string',
      }),
    async (argv) => {
      const spinner = ora();
      spinner.start('Generating PostgreSQL migration');

      try {
        execSync(
          `npm run typeorm migration:generate ${argv.output} -- -p -d ./config/dataSource.ts`,
          { stdio: 'inherit' },
        );
        spinner.succeed(
          chalk.green(`PostgreSQL migration generated at "${argv.output}"`),
        );
      } catch (error) {
        spinner.fail(chalk.red('Failed to generate PostgreSQL migration'));
        console.error(error);
      }
    },
  )
  .command('migrate', 'runs the migration for the project', async () => {
    const spinner = ora();
    spinner.start('Running migrations');

    try {
      execSync('npm run typeorm migration:run -- -d ./config/dataSource.ts', {
        stdio: 'inherit',
      });
      spinner.succeed(chalk.green('Migrations run successfully'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to run migrations'));
      console.error(error);
    }
  })
  .command('run', 'runs TypeORM CLI', async () => {
    const spinner = ora();
    spinner.start('Running TypeORM CLI');

    try {
      execSync('npx typeorm', {
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
