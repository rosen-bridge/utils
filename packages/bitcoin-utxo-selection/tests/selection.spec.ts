import { BitcoinUtxo, selectBitcoinUtxos } from '../lib';
import * as testData from './testData';

describe('selectBitcoinUtxos', () => {
  const utxos = testData.utxos;
  const emptyTrackMap = testData.emptyMap;

  const createMockedGeneratorFunction = (boxes: Array<BitcoinUtxo>) =>
    boxes.values();

  /**
   * @target selectBitcoinUtxos should return enough boxes
   * as covered when boxes cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock required BTC with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return first serialized box
   */
  it('should return enough boxes as covered when boxes cover required assets', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 2));

    // Mock required BTC with assets less than box assets
    const requiredBtc = 500000n;

    // Run test
    const result = await selectBitcoinUtxos(
      requiredBtc,
      [],
      emptyTrackMap,
      nextUtxo,
      0n,
      0,
      0,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual([utxos[0]]);
  });

  /**
   * @target selectBitcoinUtxos should return all boxes as
   * NOT covered when boxes do NOT cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock required BTC with assets more than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return both serialized boxes
   */
  it('should return all boxes as NOT covered when boxes do NOT cover required assets', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 2));

    // Mock required BTC with assets more than box assets
    const requiredBtc = 30000000n;

    // Run test
    const result = await selectBitcoinUtxos(
      requiredBtc,
      [],
      emptyTrackMap,
      nextUtxo,
      0n,
      0,
      0,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual(utxos.slice(0, 2));
  });

  /**
   * @target selectBitcoinUtxos should return enough boxes
   * as covered when two pages boxes cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 12 boxes
   * - mock required BTC with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return all serialized boxes except the last one
   */
  it('should return enough boxes as covered when two pages boxes cover required assets', async () => {
    // Mock a function to return 12 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 12));

    // Mock required BTC with assets less than box assets
    const requiredBtc = 90000000n;

    // Run test
    const result = await selectBitcoinUtxos(
      requiredBtc,
      [],
      emptyTrackMap,
      nextUtxo,
      0n,
      0,
      0,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual(utxos.slice(0, 11));
  });

  /**
   * @target selectBitcoinUtxos should return all boxes as
   * NOT covered when two pages boxes do NOT cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 12 boxes
   * - mock required BTC with assets more than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return all 12 serialized boxes
   */
  it('should return all boxes as NOT covered when two pages boxes do NOT cover required assets', async () => {
    // Mock a function to return 12 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 12));

    // Mock required BTC with assets more than box assets
    const requiredBtc = 130000000n;
    // Run test
    const result = await selectBitcoinUtxos(
      requiredBtc,
      [],
      emptyTrackMap,
      nextUtxo,
      0n,
      0,
      0,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual(utxos);
  });

  /**
   * @target selectBitcoinUtxos should return no boxes as
   * NOT covered when address has no boxes
   * @dependencies
   * @scenario
   * - mock a function to return NO boxes
   * - mock required BTC with some assets
   * - run test
   * - check returned value
   * @expected
   * - it should return empty list
   */
  it('should return no boxes as NOT covered when address has no boxes', async () => {
    // Mock a function to return NO boxes
    const nextUtxo = createMockedGeneratorFunction([]);

    // Mock required BTC with some assets
    const requiredBtc = 100000n;

    // Run test
    const result = await selectBitcoinUtxos(
      requiredBtc,
      [],
      emptyTrackMap,
      nextUtxo,
      0n,
      0,
      0,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual([]);
  });

  /**
   * @target selectBitcoinUtxos should return enough boxes
   * as covered when tracked boxes cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock a Map to track first box to a new box
   * - mock required BTC with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return serialized tracked box
   */
  it('should return enough boxes as covered when tracked boxes cover required assets', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 2));

    // Mock a Map to track first box to a new box
    const trackMap = new Map<string, BitcoinUtxo>();
    trackMap.set(`${utxos[0].txId}.${utxos[0].index}`, utxos[2]);

    // Mock required BTC with assets less than box assets
    const requiredBtc = 500000n;

    // Run test
    const result = await selectBitcoinUtxos(
      requiredBtc,
      [],
      trackMap,
      nextUtxo,
      0n,
      0,
      0,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual([utxos[2]]);
  });

  /**
   * @target selectBitcoinUtxos should return all boxes as
   * NOT covered when tracked boxes do NOT cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock a Map to track first box to a new box
   * - mock required BTC with assets more than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return serialized tracked boxes
   */
  it('should return all boxes as NOT covered when tracked boxes do NOT cover required assets', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 2));

    // Mock a Map to track first box to a new box
    const trackMap = new Map<string, BitcoinUtxo>();
    trackMap.set(`${utxos[0].txId}.${utxos[0].index}`, utxos[2]);

    // Mock required BTC with assets less than box assets
    const requiredBtc = 19000000n;

    // Run test
    const result = await selectBitcoinUtxos(
      requiredBtc,
      [],
      trackMap,
      nextUtxo,
      0n,
      0,
      0,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual([utxos[2], utxos[1]]);
  });

  /**
   * @target selectBitcoinUtxos should return second box
   * as covered when first box is not allowed
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock first box as forbidden
   * - mock required BTC with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return second serialized box
   */
  it('should return second box as covered when first box is not allowed', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 2));

    // Mock first box as forbidden
    const forbiddenIds = [`${utxos[0].txId}.${utxos[0].index}`];

    // Mock required BTC with assets less than box assets
    const requiredBtc = 900000n;

    // Run test
    const result = await selectBitcoinUtxos(
      requiredBtc,
      forbiddenIds,
      emptyTrackMap,
      nextUtxo,
      0n,
      0,
      0,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual([utxos[1]]);
  });

  /**
   * @target selectBitcoinUtxos should return no boxes as
   * NOT covered when tracking ends to no box
   * @dependencies
   * @scenario
   * - mock a function to return one box
   * - mock a Map to track first box to no box
   * - mock required BTC with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return empty list
   */
  it('should return no boxes as NOT covered when tracking ends to no box', async () => {
    // Mock a function to return one box
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 1));

    // Mock a Map to track first box to no box
    const trackMap = new Map<string, BitcoinUtxo | undefined>();
    trackMap.set(`${utxos[0].txId}.${utxos[0].index}`, undefined);

    // Mock required BTC with assets less than box assets
    const requiredBtc = 500000n;

    // Run test
    const result = await selectBitcoinUtxos(
      requiredBtc,
      [],
      trackMap,
      nextUtxo,
      0n,
      0,
      0,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual([]);
  });

  /**
   * @target selectBitcoinUtxos should return all boxes as
   * NOT covered when two boxes are tracked to same box
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock a Map to track both boxes to a box
   * - mock required BTC with assets more than tracked box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return single tracked box
   */
  it('should return all boxes as NOT covered when two boxes are tracked to same box', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 2));

    // Mock a Map to track both boxes to a box
    const trackMap = new Map<string, BitcoinUtxo | undefined>();
    trackMap.set(`${utxos[0].txId}.${utxos[0].index}`, utxos[2]);
    trackMap.set(`${utxos[1].txId}.${utxos[1].index}`, utxos[2]);

    // Mock required BTC with assets more than tracked box assets
    const requiredBtc = 4000000n;

    // Run test
    const result = await selectBitcoinUtxos(
      requiredBtc,
      [],
      trackMap,
      nextUtxo,
      0n,
      0,
      0,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual([utxos[2]]);
  });

  /**
   * @target selectBitcoinUtxos should return no boxes and
   * NOT covered when box values are insufficient
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock required BTC with assets less than box assets
   * - mock minimum allowed satoshi more than both boxes assets
   * - run test
   * - check returned value
   * @expected
   * - it should return false with no box
   */
  it('should return no boxes and NOT covered when box values are insufficient', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 2));

    // Mock required BTC with assets less than box assets
    const requiredBtc = 500000n;

    // Mock minimum allowed satoshi more than both boxes assets
    const minimumAllowedSatoshi = 12300000n;

    // Run test
    const result = await selectBitcoinUtxos(
      requiredBtc,
      [],
      emptyTrackMap,
      nextUtxo,
      minimumAllowedSatoshi,
      0,
      0,
      1
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes.length).toEqual(0);
  });

  /**
   * @target selectBitcoinUtxos should return enough boxes to satisfy estimated fee
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock required BTC equal to first box value
   * - mock input weight, estimated tx weight and fee ratio
   * - run test
   * - check returned value
   * @expected
   * - it should return true with two boxes
   */
  it('should return enough boxes to satisfy estimated fee', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(utxos.slice(0, 2));

    // Mock required BTC equal to first box value
    const requiredBtc = utxos[0].value;

    // Mock input weight, estimated tx weight and fee ratio
    const inputWeight = 2;
    const estimatedTxWeight = 4;
    const feeRatio = 2;

    // Run test
    const result = await selectBitcoinUtxos(
      requiredBtc,
      [],
      emptyTrackMap,
      nextUtxo,
      0n,
      inputWeight,
      estimatedTxWeight,
      feeRatio
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual(utxos.slice(0, 2));
  });
});
