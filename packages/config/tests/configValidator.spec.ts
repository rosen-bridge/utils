import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ConfigValidator } from '../lib/configValidator';
import { SchemaFormats } from '../lib/constants/index';
import { unwrap } from './testUtils';

const fixtures = new URL('./fixtures/', import.meta.url).pathname;
const schemaFile = join(fixtures, 'service.schema.json');

describe('ConfigValidator', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'config-validator-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  describe('fromSchema', () => {
    /**
     * @target ConfigValidator.fromSchema should read a parsed schema
     * @dependencies
     * - SchemaDocument
     * @scenario
     * - create a validator from a schema object, then from an invalid one
     * @expected
     * - a validator, then the problem of the schema
     */
    it('should read a parsed schema', () => {
      const validator = ConfigValidator.fromSchema({
        schema: { type: 'number' },
      });
      expect(unwrap(validator).validate('5')).toEqual({ ok: true, value: 5 });
      const invalid = ConfigValidator.fromSchema({ schema: { type: 'x' } });
      expect(!invalid.ok && invalid.errors.map(({ path }) => path)).toEqual([
        'schema.type',
      ]);
    });
  });

  describe('fromFile', () => {
    /**
     * @target ConfigValidator.fromFile should read a schema file
     * @dependencies
     * - the fixture schema
     * @scenario
     * - create a validator from the fixture
     * @expected
     * - a validator of the service schema
     */
    it('should read a schema file', () => {
      const validator = unwrap(ConfigValidator.fromFile(schemaFile));
      expect(validator.validate({ mode: 'dev' })).toEqual({
        ok: true,
        value: { port: 8080, mode: 'dev' },
      });
    });

    /**
     * @target ConfigValidator.fromFile should fail for a file that is not a
     * schema document
     * @dependencies
     * - temporary files
     * @scenario
     * - read a missing file, then a YAML list read in the given format
     * @expected
     * - one problem at the root each time
     */
    it('should fail for a file that is not a schema document', () => {
      const list = join(dir, 'list.txt');
      writeFileSync(list, '- 1\n');
      for (const result of [
        ConfigValidator.fromFile(join(dir, 'missing.json')),
        ConfigValidator.fromFile(list, SchemaFormats.Yaml),
      ])
        expect(!result.ok && result.errors.map(({ path }) => path)).toEqual([
          '',
        ]);
    });
  });

  describe('validate', () => {
    /**
     * @target ConfigValidator.validate should report problems and check the
     * hash
     * @dependencies
     * - SchemaDocument
     * @scenario
     * - validate a configuration with a bad mode, then with a wrong hash
     * @expected
     * - the problem at `mode`, then one at the root
     */
    it('should report problems and check the hash', () => {
      const validator = unwrap(ConfigValidator.fromFile(schemaFile));
      expect(validator.validate({ mode: 'test' })).toEqual({
        ok: false,
        errors: [
          { path: 'mode', message: 'must be one of "dev", "prod", got "test"' },
        ],
      });
      const result = validator.validate({}, 'sha256:old');
      expect(!result.ok && result.errors.map(({ path }) => path)).toEqual(['']);
    });
  });

  describe('buildConfig', () => {
    /**
     * @target ConfigValidator.buildConfig should validate the configuration
     * of the config package
     * @dependencies
     * - the config package, reading `tests/fixtures/config`
     * @scenario
     * - point NODE_CONFIG_DIR at the fixtures and build the configuration
     * @expected
     * - the fixture's values, converted
     */
    it('should validate the configuration of the config package', () => {
      vi.stubEnv('NODE_CONFIG_DIR', join(fixtures, 'config'));
      vi.stubEnv('SUPPRESS_NO_CONFIG_WARNING', 'true');
      const validator = unwrap(ConfigValidator.fromFile(schemaFile));
      expect(validator.buildConfig()).toEqual({
        ok: true,
        value: { port: 9000, mode: 'dev' },
      });
      vi.unstubAllEnvs();
    });
  });

  describe('checkTypes', () => {
    /**
     * @target ConfigValidator.checkTypes should tell whether generated types
     * still have the schema hash
     * @dependencies
     * - a temporary folder
     * @scenario
     * - write the types and check them
     * - check them with another schema
     * @expected
     * - `true`, then `false`
     */
    it('should tell whether generated types still have the schema hash', () => {
      const validator = unwrap(ConfigValidator.fromFile(schemaFile));
      const file = join(dir, 'config.ts');
      validator.generateTypes(file);
      expect(validator.checkTypes(file)).toEqual(true);
      const other = unwrap(
        ConfigValidator.fromSchema({ schema: { type: 'number' } }),
      );
      expect(other.checkTypes(file)).toEqual(false);
    });

    /**
     * @target ConfigValidator.checkTypes should throw for a file without the
     * hash
     * @dependencies
     * - a temporary folder
     * @scenario
     * - check a TypeScript file with no `SCHEMA_HASH`
     * @expected
     * - an error naming `SCHEMA_HASH`
     */
    it('should throw for a file without the hash', () => {
      const validator = unwrap(ConfigValidator.fromFile(schemaFile));
      const file = join(dir, 'config.ts');
      writeFileSync(file, 'export {};\n');
      expect(() => validator.checkTypes(file)).toThrow('has no SCHEMA_HASH');
    });
  });

  describe('generateTypes', () => {
    /**
     * @target ConfigValidator.generateTypes should write the types to a file
     * @dependencies
     * - a temporary folder
     * @scenario
     * - write the types with the default and another root name
     * @expected
     * - files with `Service`, then `Settings`, and the hash
     */
    it('should write the types to a file', () => {
      const validator = unwrap(ConfigValidator.fromFile(schemaFile));
      const file = join(dir, 'config.ts');
      validator.generateTypes(file);
      expect(readFileSync(file, 'utf8')).toContain(
        'export interface Service {',
      );
      validator.generateTypes(file, 'Settings');
      expect(readFileSync(file, 'utf8')).toContain('export const SCHEMA_HASH');
      expect(readFileSync(file, 'utf8')).toContain(
        'export interface Settings {',
      );
    });
  });

  describe('defaults', () => {
    /**
     * @target ConfigValidator.defaults should write the default configuration
     * @dependencies
     * - a temporary folder
     * @scenario
     * - write the defaults as JSON, then as YAML in a `.txt` file
     * @expected
     * - the default port in both formats
     */
    it('should write the default configuration', () => {
      const validator = unwrap(ConfigValidator.fromFile(schemaFile));
      validator.defaults(join(dir, 'default.json'));
      validator.defaults(join(dir, 'default.txt'), SchemaFormats.Yaml);
      expect(readFileSync(join(dir, 'default.json'), 'utf8')).toEqual(
        '{\n  "port": 8080\n}\n',
      );
      expect(readFileSync(join(dir, 'default.txt'), 'utf8')).toEqual(
        'port: 8080\n',
      );
    });
  });

  describe('environment', () => {
    /**
     * @target ConfigValidator.environment should write the
     * custom-environment-variables file
     * @dependencies
     * - a temporary folder
     * @scenario
     * - write the secret variables, then every one with a prefix as YAML
     * @expected
     * - the token, then every key with the prefix
     */
    it('should write the custom-environment-variables file', () => {
      const validator = unwrap(ConfigValidator.fromFile(schemaFile));
      validator.environment(join(dir, 'env.json'));
      validator.environment(join(dir, 'env.yaml'), undefined, true, 'svc');
      expect(JSON.parse(readFileSync(join(dir, 'env.json'), 'utf8'))).toEqual({
        token: 'TOKEN',
      });
      expect(readFileSync(join(dir, 'env.yaml'), 'utf8')).toEqual(
        'port: SVC_PORT\nmode: SVC_MODE\ntoken: SVC_TOKEN\n',
      );
    });

    /**
     * @target ConfigValidator.environment should throw for an unknown format
     * @dependencies
     * - a temporary folder
     * @scenario
     * - write to a `.txt` file without a format
     * @expected
     * - an error is thrown
     */
    it('should throw for an unknown format', () => {
      const validator = unwrap(ConfigValidator.fromFile(schemaFile));
      expect(() => {
        validator.environment(join(dir, 'env.txt'));
      }).toThrow(Error);
    });
  });
});
