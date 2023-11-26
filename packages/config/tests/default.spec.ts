import { describe, expect, it } from 'vitest';
import { generateDefault } from '../lib';
import * as testData from './defaultTestData';

describe('generateDefault', () => {
  /**
   * @target should return default values object for the passed schema
   * @dependencies
   * @scenario
   * - call generateDefault
   * - check if correct default value object is returned
   * @expected
   * - correct default value object should have been returned
   */
  it(`should return default values object for the passed schema`, async () => {
    testData.samples.forEach(({ schema, defaultVal }) => {
      expect(generateDefault(schema)).toEqual(defaultVal);
    });
  });
});
