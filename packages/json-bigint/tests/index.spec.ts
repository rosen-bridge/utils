import { describe, it, expect } from 'vitest';

import JsonBigInt from '../lib';

import { jsonString, json } from './testData';

describe('JsonBigInt', () => {
  it('should parse JSON strings according to pre-set configs correctly', () => {
    const parsedJson = JsonBigInt.parse(jsonString);

    expect(parsedJson).toEqual(json);
  });

  it('should stringify JSONs according to pre-set configs correctly', () => {
    const stringifiedJson = JsonBigInt.stringify(json);

    expect(stringifiedJson).toEqual(jsonString);
  });
});
