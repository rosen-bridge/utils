import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { EXIT } from '../lib/constants/index';

const packageDir = new URL('..', import.meta.url).pathname;
const fixtures = join(packageDir, 'tests/fixtures');
const schemaFile = join(fixtures, 'service.schema.json');

/**
 * Runs the CLI with `args` from the package folder.
 * @param args - the command-line arguments
 * @param env - extra environment variables
 */
const cli = (args: string[], env: Record<string, string> = {}) => {
  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', join(packageDir, 'lib/cli.ts'), ...args],
    {
      cwd: packageDir,
      encoding: 'utf8',
      env: { ...process.env, SUPPRESS_NO_CONFIG_WARNING: 'true', ...env },
    },
  );
  return { code: result.status, out: result.stdout, err: result.stderr };
};

describe('cli', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'cli-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  describe('check', () => {
    /**
     * @target cli check should report a valid schema and the problems of an
     * invalid one
     * @dependencies
     * - the fixture schema, a temporary file
     * @scenario
     * - check the fixture, then a schema with an unknown type
     * @expected
     * - `valid` with exit 0, then the problem with the schema-error exit
     */
    it('should report a valid schema and the problems of an invalid one', () => {
      const valid = cli(['check', '--schema', schemaFile]);
      expect([valid.code, valid.out]).toEqual([
        EXIT.ok,
        `${schemaFile}: valid\n`,
      ]);
      const bad = join(dir, 'bad.json');
      writeFileSync(bad, '{"schema": {"type": "x"}}');
      const invalid = cli(['check', '-s', bad]);
      expect(invalid.code).toEqual(EXIT.schemaError);
      expect(invalid.err).toContain('schema.type:');
    });

    /**
     * @target cli check should read a schema in the format given with `-f`
     * @dependencies
     * - a temporary file
     * @scenario
     * - check a YAML schema in a `.txt` file with `-f yaml`, then without it
     * @expected
     * - `valid` with exit 0, then the schema-error exit
     */
    it('should read a schema in the format given with `-f`', () => {
      const file = join(dir, 'schema.txt');
      writeFileSync(file, 'schema:\n  type: number\n');
      expect(cli(['check', '-s', file, '-f', 'yaml']).code).toEqual(EXIT.ok);
      expect(cli(['check', '-s', file]).code).toEqual(EXIT.schemaError);
    });
  });

  describe('check-types', () => {
    /**
     * @target cli check-types should accept up-to-date types and reject
     * outdated ones
     * @dependencies
     * - the fixture schema, a temporary folder
     * @scenario
     * - generate the types and check them
     * - replace their hash with another one and check them again
     * @expected
     * - `up to date` with exit 0, then the invalid exit
     */
    it('should accept up-to-date types and reject outdated ones', () => {
      const types = join(dir, 'config.ts');
      cli(['generate-ts-types', '-s', schemaFile, '-o', types]);
      const current = cli(['check-types', '-s', schemaFile, '-t', types]);
      expect([current.code, current.out]).toEqual([
        EXIT.ok,
        `${types}: up to date\n`,
      ]);
      const text = readFileSync(types, 'utf8');
      writeFileSync(
        types,
        text.replace(/SCHEMA_HASH = '[^']*'/, "SCHEMA_HASH = 'sha256:old'"),
      );
      const outdated = cli(['check-types', '-s', schemaFile, '-t', types]);
      expect(outdated.code).toEqual(EXIT.invalid);
      expect(outdated.err).toContain('the schema changed');
    });

    /**
     * @target cli check-types should fail when the types cannot be read
     * @dependencies
     * - the fixture schema, a temporary folder
     * @scenario
     * - check a file that does not exist, then a file without `SCHEMA_HASH`
     * @expected
     * - the failed exit both times
     */
    it('should fail when the types cannot be read', () => {
      expect(
        cli(['check-types', '-s', schemaFile, '-t', join(dir, 'missing.ts')])
          .code,
      ).toEqual(EXIT.failed);
      const empty = join(dir, 'empty.ts');
      writeFileSync(empty, 'export {};\n');
      expect(cli(['check-types', '-s', schemaFile, '-t', empty]).code).toEqual(
        EXIT.failed,
      );
    });

    /**
     * @target cli check-types should require `--types`
     * @dependencies
     * - the fixture schema
     * @scenario
     * - run the command with the types file as a positional argument
     * @expected
     * - the usage exit
     */
    it('should require `--types`', () => {
      expect(cli(['check-types', '-s', schemaFile, 'config.ts']).code).toEqual(
        EXIT.usage,
      );
    });
  });

  describe('generate-ts-types', () => {
    /**
     * @target cli generate-ts-types should write the types
     * @dependencies
     * - the fixture schema, a temporary folder
     * @scenario
     * - generate the types with `--schema`, `--output` and `--root-type`
     * - generate them with `-s`, `-o` and `-r`
     * @expected
     * - exit 0 and the file with `Root`, then with `Settings`
     */
    it('should write the types', () => {
      const out = join(dir, 'config.ts');
      expect(
        cli([
          'generate-ts-types',
          '--schema',
          schemaFile,
          '--output',
          out,
          '--root-type',
          'Root',
        ]).code,
      ).toEqual(EXIT.ok);
      expect(readFileSync(out, 'utf8')).toContain('export interface Root {');
      expect(
        cli([
          'generate-ts-types',
          '-s',
          schemaFile,
          '-o',
          out,
          '-r',
          'Settings',
        ]).code,
      ).toEqual(EXIT.ok);
      expect(readFileSync(out, 'utf8')).toContain(
        'export interface Settings {',
      );
    });

    /**
     * @target cli generate-ts-types should require `--schema`
     * @dependencies
     * - a temporary folder
     * @scenario
     * - run the command with the schema as a positional argument
     * @expected
     * - the usage exit
     */
    it('should require `--schema`', () => {
      expect(
        cli(['generate-ts-types', schemaFile, '-o', join(dir, 'config.ts')])
          .code,
      ).toEqual(EXIT.usage);
    });
  });

  describe('generate-default', () => {
    /**
     * @target cli generate-default should write the defaults, or fail for an
     * unknown format
     * @dependencies
     * - the fixture schema, a temporary folder
     * @scenario
     * - write the defaults with `--schema` and `--output` to a YAML file
     * - write them with `-s` and `-o` to a `.txt` file without a format
     * @expected
     * - the YAML file, then the failed exit
     */
    it('should write the defaults, or fail for an unknown format', () => {
      const out = join(dir, 'default.yaml');
      expect(
        cli(['generate-default', '--schema', schemaFile, '--output', out]).code,
      ).toEqual(EXIT.ok);
      expect(readFileSync(out, 'utf8')).toEqual('port: 8080\n');
      expect(
        cli(['generate-default', '-s', schemaFile, '-o', join(dir, 'd.txt')])
          .code,
      ).toEqual(EXIT.failed);
    });

    /**
     * @target cli generate-default should write the format given with `-f`
     * @dependencies
     * - the fixture schema, a temporary folder
     * @scenario
     * - write the defaults to a `.txt` file with `-f json`
     * @expected
     * - exit 0 and the JSON defaults
     */
    it('should write the format given with `-f`', () => {
      const out = join(dir, 'default.txt');
      expect(
        cli(['generate-default', '-s', schemaFile, '-o', out, '-f', 'json'])
          .code,
      ).toEqual(EXIT.ok);
      expect(JSON.parse(readFileSync(out, 'utf8'))).toEqual({ port: 8080 });
    });

    /**
     * @target cli generate-default should require `--schema`
     * @dependencies
     * - a temporary folder
     * @scenario
     * - run the command with the schema as a positional argument
     * @expected
     * - the usage exit
     */
    it('should require `--schema`', () => {
      expect(
        cli(['generate-default', schemaFile, '-o', join(dir, 'd.json')]).code,
      ).toEqual(EXIT.usage);
    });
  });

  describe('generate-env', () => {
    /**
     * @target cli generate-env should write every variable with `--all`
     * @dependencies
     * - the fixture schema, a temporary folder
     * @scenario
     * - write the variables with the long options, `--all` and a prefix as
     *   JSON
     * @expected
     * - every key with the prefix
     */
    it('should write every variable with `--all`', () => {
      const out = join(dir, 'env.txt');
      expect(
        cli([
          'generate-env',
          '--schema',
          schemaFile,
          '--output',
          out,
          '--format',
          'json',
          '--all',
          '--prefix',
          'APP',
        ]).code,
      ).toEqual(EXIT.ok);
      expect(JSON.parse(readFileSync(out, 'utf8'))).toEqual({
        port: 'APP_PORT',
        mode: 'APP_MODE',
        token: 'APP_TOKEN',
      });
    });

    /**
     * @target cli generate-env should accept the short options
     * @dependencies
     * - the fixture schema, a temporary folder
     * @scenario
     * - write the variables with `-s`, `-o`, `-f json` and `-a`
     * @expected
     * - every key without a prefix
     */
    it('should accept the short options', () => {
      const out = join(dir, 'env.txt');
      expect(
        cli(['generate-env', '-s', schemaFile, '-o', out, '-f', 'json', '-a'])
          .code,
      ).toEqual(EXIT.ok);
      expect(JSON.parse(readFileSync(out, 'utf8'))).toEqual({
        port: 'PORT',
        mode: 'MODE',
        token: 'TOKEN',
      });
    });

    /**
     * @target cli generate-env should require `--schema`
     * @dependencies
     * - a temporary folder
     * @scenario
     * - run the command with the schema as a positional argument
     * @expected
     * - the usage exit
     */
    it('should require `--schema`', () => {
      expect(
        cli(['generate-env', schemaFile, '-o', join(dir, 'env.json')]).code,
      ).toEqual(EXIT.usage);
    });
  });

  describe('validate', () => {
    /**
     * @target cli validate should validate the configuration of a folder
     * @dependencies
     * - the fixture schema and configuration
     * @scenario
     * - validate the fixture folder, then with a wrong hash
     * @expected
     * - exit 0, then the invalid exit
     */
    it('should validate the configuration of a folder', () => {
      const configDir = join(fixtures, 'config');
      expect(
        cli(['validate', '-s', schemaFile, '--config-dir', configDir]).code,
      ).toEqual(EXIT.ok);
      expect(
        cli([
          'validate',
          '--schema',
          schemaFile,
          '--config-dir',
          configDir,
          '--hash',
          'sha256:old',
        ]).code,
      ).toEqual(EXIT.invalid);
    });
  });

  describe('--version', () => {
    /**
     * @target cli --version should print the version of the package
     * @dependencies
     * - the package manifest
     * @scenario
     * - run the CLI with `--version`
     * @expected
     * - exit 0 and the version in package.json
     */
    it('should print the version of the package', () => {
      const { version } = JSON.parse(
        readFileSync(join(packageDir, 'package.json'), 'utf8'),
      );
      expect(cli(['--version'])).toEqual({
        code: EXIT.ok,
        out: `${version}\n`,
        err: '',
      });
    });
  });

  describe('usage', () => {
    /**
     * @target cli should fail with the usage exit for a wrong command line
     * @dependencies
     * @scenario
     * - run no command, then `generate-ts-types` without `--output`
     * @expected
     * - the usage exit both times
     */
    it('should fail with the usage exit for a wrong command line', () => {
      expect(cli([]).code).toEqual(EXIT.usage);
      expect(cli(['generate-ts-types', '-s', schemaFile]).code).toEqual(
        EXIT.usage,
      );
    });
  });
});
