import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { DummyLogger } from '@rosen-bridge/abstract-logger';

import { SchemaFormats } from '../../lib/constants/index';
import { readSchemaFile } from '../../lib/utils/schemaFile';

describe('readSchemaFile', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'schema-file-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  /**
   * Writes `text` to the file `name` of the test folder and returns its path.
   * @param name - the file name
   * @param text - the content
   */
  const file = (name: string, text: string): string => {
    const path = join(dir, name);
    writeFileSync(path, text);
    return path;
  };

  /**
   * @target readSchemaFile should read JSON keeping large integers
   * @dependencies
   * - a temporary file
   * @scenario
   * - read a JSON file with an integer beyond the safe range
   * @expected
   * - the integer as a bigint, a small one as a number
   */
  it('should read JSON keeping large integers', () => {
    const path = file('s.json', '{"big": 10000000000000000001, "small": 5}');
    expect(readSchemaFile(path, new DummyLogger())).toEqual({
      ok: true,
      value: { big: 10000000000000000001n, small: 5 },
    });
  });

  /**
   * @target readSchemaFile should read YAML with the core schema
   * @dependencies
   * - a temporary file
   * @scenario
   * - read a `.yml` file with a date-like value
   * @expected
   * - the value as a string
   */
  it('should read YAML with the core schema', () => {
    const path = file('s.yml', 'day: 2024-01-01\nn: 1\n');
    expect(readSchemaFile(path, new DummyLogger())).toEqual({
      ok: true,
      value: { day: '2024-01-01', n: 1 },
    });
  });

  /**
   * @target readSchemaFile should read in the given format
   * @dependencies
   * - a temporary file
   * @scenario
   * - read a `.txt` file as YAML
   * @expected
   * - the parsed value
   */
  it('should read in the given format', () => {
    const path = file('s.txt', 'a: 1\n');
    expect(readSchemaFile(path, new DummyLogger(), SchemaFormats.Yaml)).toEqual(
      { ok: true, value: { a: 1 } },
    );
  });

  /**
   * @target readSchemaFile should fail at the root for a file it cannot use
   * @dependencies
   * - temporary files
   * @scenario
   * - read a file of unknown format, a missing file and invalid JSON
   * @expected
   * - one problem at `''` for each
   */
  it('should fail at the root for a file it cannot use', () => {
    const paths = [
      file('s.txt', 'a: 1'),
      join(dir, 'missing.json'),
      file('bad.json', '{'),
    ];
    for (const path of paths) {
      const result = readSchemaFile(path, new DummyLogger());
      expect(!result.ok && result.errors.map(({ path }) => path)).toEqual(['']);
    }
  });
});
