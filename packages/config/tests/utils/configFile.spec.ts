import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { DummyLogger } from '@rosen-bridge/abstract-logger';

import { SchemaFormats } from '../../lib/constants/index';
import { writeConfigFile } from '../../lib/utils/configFile';

describe('writeConfigFile', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'config-file-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  /**
   * @target writeConfigFile should write JSON with every digit of a bigint
   * @dependencies
   * - a temporary folder
   * @scenario
   * - write a value with a large bigint to a `.json` file
   * @expected
   * - indented JSON with the bigint as a number
   */
  it('should write JSON with every digit of a bigint', () => {
    const path = join(dir, 'default.json');
    writeConfigFile(path, { fee: 10000000000000000001n }, new DummyLogger());
    expect(readFileSync(path, 'utf8')).toEqual(
      '{\n  "fee": 10000000000000000001\n}\n',
    );
  });

  /**
   * @target writeConfigFile should write YAML with a bigint as a string
   * @dependencies
   * - a temporary folder
   * @scenario
   * - write a value with a bigint to a `.txt` file in YAML
   * @expected
   * - YAML with the bigint quoted
   */
  it('should write YAML with a bigint as a string', () => {
    const path = join(dir, 'default.txt');
    writeConfigFile(path, { fee: 10n }, new DummyLogger(), SchemaFormats.Yaml);
    expect(readFileSync(path, 'utf8')).toEqual("fee: '10'\n");
  });

  /**
   * @target writeConfigFile should throw for an unknown format
   * @dependencies
   * - a temporary folder
   * @scenario
   * - write to a `.txt` file without a format
   * @expected
   * - an error is thrown
   */
  it('should throw for an unknown format', () => {
    expect(() => {
      writeConfigFile(join(dir, 'a.txt'), {}, new DummyLogger());
    }).toThrow(Error);
  });
});
