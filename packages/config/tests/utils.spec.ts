import { IConfigSource } from 'config';
import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  getSourceName,
  getValue,
  getValueFromConfigSources,
} from '../lib/utils';
import * as testData from './utilsTestData';

describe('getValue', () => {
  /**
   * @target getValue should return the correct value for a path in the passed
   * object
   * @dependencies
   * @scenario
   * - call getValue
   * - check if correct value is returned
   * @expected
   * - correct value should have been returned
   */
  it(`should return the correct value for a path in the passed object`, async () => {
    const obj = {
      apiType: 'explorer',
      servers: {
        url: 'something.org',
      },
      apis: {
        explorer: {
          url: 'example.com',
          port: 443,
        },
      },
    };

    const { value, defined } = getValue(obj, ['apis', 'explorer', 'port']);

    expect(value).toEqual(443);
    expect(defined).toEqual(true);
  });

  /**
   * @target getValue should return undefined when no value is defined at a path
   * in the object
   * @dependencies
   * @scenario
   * - call getValue
   * - check if correct value is returned
   * @expected
   * - correct value should have been returned
   */
  it(`should return undefined when no value is defined at a path in the object`, async () => {
    const obj = {
      apiType: 'explorer',
      servers: {
        url: 'something.org',
      },
      apis: {
        explorer: 'nothing here',
      },
    };

    const { value, defined } = getValue(obj, ['apis', 'explorer', 'port']);

    expect(value).toEqual(undefined);
    expect(defined).toEqual(false);
  });
});

describe('getSourceName', () => {
  /**
   * @target getSourceName should return the source name for node config source
   * @dependencies
   * @scenario
   * - call getSourceName
   * - check if correct value is returned
   * @expected
   * - correct value should have been returned
   */
  it(`should return the source name for node config source`, async () => {
    const source: IConfigSource = {
      name: path.join('./config', 'default.json'),
      original:
        '{\r\n  "apiType": "explorer",\r\n  "servers": {\r\n    "url": "something.org"\r\n  },\r\n  "apis": {\r\n    "explorer": {\r\n      "url": "example.com",\r\n      "port": 443\r\n    }\r\n  }\r\n}\r\n',
      parsed: {
        apiType: 'explorer',
        servers: { url: 'something.org' },
        apis: { explorer: { url: 'example.com', port: 443 } },
      },
    };
    const sourceName = getSourceName(source);

    expect(sourceName).toEqual('default');
  });
});

describe('getValueFromConfigSources', () => {
  /**
   * @target getValueFromConfigSources should return the value in highest
   * priority config source at the specified path
   * @dependencies
   * @scenario
   * - call getValueFromConfigSources
   * - check if correct value is returned
   * @expected
   * - correct value should have been returned
   */
  it(`should return the value in highest priority config source at the specified
  path`, async () => {
    const value = getValueFromConfigSources(testData.sampleConfigSources, [
      'servers',
      'url',
    ]);

    expect(value).toEqual('example.org');
  });
});
