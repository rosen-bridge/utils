import { ErgoBox } from 'ergo-lib-wasm-nodejs';

import { CorruptedConfigBoxError, parseTokenMapBoxes } from '../lib';
import {
  configBoxes,
  duplicateTokenConfigBox,
  inconsistentDataCardanoConfigBox,
  inconsistentDataErgoConfigBox,
  missingHeaderFieldConfigBox,
  sampleConfigBoxForDuplication,
  sampleErgoConfigBoxForDuplication,
  thirdTokenMap,
  unbridgeableTokenConfigBoxes,
  unbridgeableTokens,
  wrongFieldIndexConfigBox,
} from './testData';

describe('parseTokenMapBoxes', () => {
  /**
   * @target TokenMap.parseTokenMapBoxes should successfully extract config from given boxes
   * @dependencies
   * @scenario
   * - mock config boxes
   * - run test
   * - check returned value
   * @expected
   * - it should return expected config
   */
  it('should successfully extract config from given boxes', async () => {
    const serializedBoxes = Object.values(configBoxes).map((boxJson) =>
      Buffer.from(ErgoBox.from_json(boxJson).sigma_serialize_bytes()).toString(
        'hex',
      ),
    );

    const res = parseTokenMapBoxes(serializedBoxes);
    expect(res).toEqual(thirdTokenMap);
  });

  /**
   * @target TokenMap.parseTokenMapBoxes should successfully extract config from given boxes
   * respecting unbridgeable tokens
   * @dependencies
   * @scenario
   * - mock config boxes
   * - run test
   * - check returned value
   * @expected
   * - it should return expected config
   */
  it('should successfully extract config from given boxes respecting unbridgeable tokens', async () => {
    const targetConfigBoxes = [
      ...Object.values(configBoxes),
      unbridgeableTokenConfigBoxes.cardano,
    ];
    const serializedBoxes = targetConfigBoxes.map((boxJson) =>
      Buffer.from(ErgoBox.from_json(boxJson).sigma_serialize_bytes()).toString(
        'hex',
      ),
    );

    const res = parseTokenMapBoxes(serializedBoxes);
    expect(res).toEqual([...thirdTokenMap, ...unbridgeableTokens]);
  });

  /**
   * @target TokenMap.parseTokenMapBoxes should throw CorruptedConfigBoxError
   * when one of the required fields is missing in the headers
   * @dependencies
   * @scenario
   * - mock config boxes
   * - run test & check thrown exception
   * @expected
   * - CorruptedConfigBoxError should be thrown
   */
  it('should throw CorruptedConfigBoxError when one of the required fields is missing in the headers', async () => {
    const serializedBox = Buffer.from(
      ErgoBox.from_json(missingHeaderFieldConfigBox).sigma_serialize_bytes(),
    ).toString('hex');

    expect(() => {
      parseTokenMapBoxes([serializedBox]);
    }).toThrow(CorruptedConfigBoxError);
  });

  /**
   * @target TokenMap.parseTokenMapBoxes should throw CorruptedConfigBoxError
   * when `ergoSideTokenId` is in wrong index in the headers
   * @dependencies
   * @scenario
   * - mock config boxes
   * - run test & check thrown exception
   * @expected
   * - CorruptedConfigBoxError should be thrown
   */
  it('should throw CorruptedConfigBoxError when `ergoSideTokenId` is in wrong index in the headers', async () => {
    const serializedBox = Buffer.from(
      ErgoBox.from_json(wrongFieldIndexConfigBox).sigma_serialize_bytes(),
    ).toString('hex');

    expect(() => {
      parseTokenMapBoxes([serializedBox]);
    }).toThrow(CorruptedConfigBoxError);
  });

  /**
   * @target TokenMap.parseTokenMapBoxes should throw CorruptedConfigBoxError
   * when headers and data length are inconsistent in Ergo config
   * @dependencies
   * @scenario
   * - mock config boxes
   * - run test & check thrown exception
   * @expected
   * - CorruptedConfigBoxError should be thrown
   */
  it('should throw CorruptedConfigBoxError when headers and data length are inconsistent in Ergo config', async () => {
    const serializedBox = Buffer.from(
      ErgoBox.from_json(inconsistentDataErgoConfigBox).sigma_serialize_bytes(),
    ).toString('hex');

    expect(() => {
      parseTokenMapBoxes([serializedBox]);
    }).toThrow(CorruptedConfigBoxError);
  });

  /**
   * @target TokenMap.parseTokenMapBoxes should throw CorruptedConfigBoxError
   * when duplicate ergo token is found in multiple boxes
   * @dependencies
   * @scenario
   * - mock config boxes
   * - run test & check thrown exception
   * @expected
   * - CorruptedConfigBoxError should be thrown
   */
  it('should throw CorruptedConfigBoxError when duplicate ergo token is found in multiple boxes', async () => {
    const serializedBoxes = [
      sampleErgoConfigBoxForDuplication,
      configBoxes.ergo0,
    ].map((boxJson) =>
      Buffer.from(ErgoBox.from_json(boxJson).sigma_serialize_bytes()).toString(
        'hex',
      ),
    );

    expect(() => {
      parseTokenMapBoxes(serializedBoxes);
    }).toThrow(CorruptedConfigBoxError);
  });

  /**
   * @target TokenMap.parseTokenMapBoxes should throw CorruptedConfigBoxError
   * when duplicate ergo token is found in single box
   * @dependencies
   * @scenario
   * - mock config boxes
   * - run test & check thrown exception
   * @expected
   * - CorruptedConfigBoxError should be thrown
   */
  it('should throw CorruptedConfigBoxError when duplicate ergo token is found in single box', async () => {
    const serializedBoxes = [duplicateTokenConfigBox].map((boxJson) =>
      Buffer.from(ErgoBox.from_json(boxJson).sigma_serialize_bytes()).toString(
        'hex',
      ),
    );

    expect(() => {
      parseTokenMapBoxes(serializedBoxes);
    }).toThrow(CorruptedConfigBoxError);
  });

  /**
   * @target TokenMap.parseTokenMapBoxes should throw CorruptedConfigBoxError
   * when headers and data length are inconsistent in non-Ergo config
   * @dependencies
   * @scenario
   * - mock config boxes
   * - run test & check thrown exception
   * @expected
   * - CorruptedConfigBoxError should be thrown
   */
  it('should throw CorruptedConfigBoxError when headers and data length are inconsistent in non-Ergo config', async () => {
    const serializedBoxes = [
      inconsistentDataCardanoConfigBox,
      configBoxes.ergo0,
    ].map((boxJson) =>
      Buffer.from(ErgoBox.from_json(boxJson).sigma_serialize_bytes()).toString(
        'hex',
      ),
    );

    expect(() => {
      parseTokenMapBoxes(serializedBoxes);
    }).toThrow(CorruptedConfigBoxError);
  });

  /**
   * @target TokenMap.parseTokenMapBoxes should throw CorruptedConfigBoxError
   * when ergo side token is not found
   * @dependencies
   * @scenario
   * - mock config boxes
   * - run test & check thrown exception
   * @expected
   * - CorruptedConfigBoxError should be thrown
   */
  it('should throw CorruptedConfigBoxError when ergo side token is not found', async () => {
    const serializedBoxes = [
      configBoxes.ergo0,
      configBoxes.cardano,
      configBoxes.bitcoin,
    ].map((boxJson) =>
      Buffer.from(ErgoBox.from_json(boxJson).sigma_serialize_bytes()).toString(
        'hex',
      ),
    );

    expect(() => {
      parseTokenMapBoxes(serializedBoxes);
    }).toThrow(CorruptedConfigBoxError);
  });

  /**
   * @target TokenMap.parseTokenMapBoxes should throw CorruptedConfigBoxError
   * when duplicate token for single ergo token is found
   * @dependencies
   * @scenario
   * - mock config boxes
   * - run test & check thrown exception
   * @expected
   * - CorruptedConfigBoxError should be thrown
   */
  it('should throw CorruptedConfigBoxError when duplicate token for single ergo token is found', async () => {
    const serializedBoxes = [
      configBoxes.ergo0,
      configBoxes.cardano,
      sampleConfigBoxForDuplication,
      configBoxes.bitcoin,
    ].map((boxJson) =>
      Buffer.from(ErgoBox.from_json(boxJson).sigma_serialize_bytes()).toString(
        'hex',
      ),
    );

    expect(() => {
      parseTokenMapBoxes(serializedBoxes);
    }).toThrow(CorruptedConfigBoxError);
  });
});
