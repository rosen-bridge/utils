import { describe, expect, it, vi } from 'vitest';
import { AssetBalance, ErgoBoxProxy, selectErgoBoxes } from '../lib';
import * as testData from './testData';

describe('selectErgoBoxes', () => {
  const boxes = testData.boxes;
  const tokenId1 = testData.tokenId1;
  const emptyTrackMap = testData.emptyMap;

  const createMockedGeneratorFunction = (boxes: Array<ErgoBoxProxy>) =>
    boxes.values();

  /**
   * @target selectErgoBoxes should return enough boxes
   * as covered when boxes cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock an AssetBalance object with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return first serialized box
   */
  it('should return enough boxes as covered when boxes cover required assets', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(boxes.slice(0, 2));

    // Mock an AssetBalance object with assets less than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 500000n,
      tokens: [{ id: tokenId1, value: 50n }],
    };

    // Run test
    const result = await selectErgoBoxes(
      requiredAssets,
      [],
      emptyTrackMap,
      nextUtxo
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual([boxes[0]]);
  });

  /**
   * @target selectErgoBoxes should return all boxes as
   * NOT covered when boxes do NOT cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock an AssetBalance object with assets more than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return both serialized boxes
   */
  it('should return all boxes as NOT covered when boxes do NOT cover required assets', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(boxes.slice(0, 2));

    // Mock an AssetBalance object with assets more than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 30000000n,
      tokens: [{ id: tokenId1, value: 50n }],
    };

    // Run test
    const result = await selectErgoBoxes(
      requiredAssets,
      [],
      emptyTrackMap,
      nextUtxo
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual(boxes.slice(0, 2));
  });

  /**
   * @target selectErgoBoxes should return all useful boxes
   * as NOT covered key when boxes do NOT cover required tokens
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   *   (second box doesn't contain required token)
   * - mock an AssetBalance object with tokens more than box tokens
   * - run test
   * - check returned value
   * @expected
   * - it should return first serialized box
   */
  it('should return all useful boxes as NOT covered when boxes do NOT cover required tokens', async () => {
    // Mock a function to return 2 boxes
    //  (second box doesn't contain required token)
    const nextUtxo = createMockedGeneratorFunction(boxes.slice(0, 2));

    // Mock an AssetBalance object with tokens more than box tokens
    const requiredAssets: AssetBalance = {
      nativeToken: 600000n,
      tokens: [{ id: tokenId1, value: 300n }],
    };

    // Run test
    const result = await selectErgoBoxes(
      requiredAssets,
      [],
      emptyTrackMap,
      nextUtxo
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual(boxes.slice(0, 1));
  });

  /**
   * @target selectErgoBoxes should return enough boxes
   * as covered when two pages boxes cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 12 boxes
   * - mock an AssetBalance object with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return all serialized boxes except the last one
   */
  it('should return enough boxes as covered when two pages boxes cover required assets', async () => {
    // Mock a function to return 12 boxes
    const nextUtxo = createMockedGeneratorFunction(boxes.slice(0, 12));

    // Mock an AssetBalance object with assets less than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 90000000n,
      tokens: [{ id: tokenId1, value: 50n }],
    };

    // Run test
    const result = await selectErgoBoxes(
      requiredAssets,
      [],
      emptyTrackMap,
      nextUtxo
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual(boxes.slice(0, 11));
  });

  /**
   * @target selectErgoBoxes should return all boxes as
   * NOT covered when two pages boxes do NOT cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 12 boxes
   * - mock an AssetBalance object with assets more than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return all 12 serialized boxes
   */
  it('should return all boxes as NOT covered when two pages boxes do NOT cover required assets', async () => {
    // Mock a function to return 12 boxes
    const nextUtxo = createMockedGeneratorFunction(boxes.slice(0, 12));

    // Mock an AssetBalance object with assets more than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 130000000n,
      tokens: [],
    };

    // Run test
    const result = await selectErgoBoxes(
      requiredAssets,
      [],
      emptyTrackMap,
      nextUtxo
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual(boxes);
  });

  /**
   * @target selectErgoBoxes should return no boxes as
   * NOT covered when address has no boxes
   * @dependencies
   * @scenario
   * - mock a function to return NO boxes
   * - mock an AssetBalance object with some assets
   * - run test
   * - check returned value
   * @expected
   * - it should return empty list
   */
  it('should return no boxes as NOT covered when address has no boxes', async () => {
    // Mock a function to return NO boxes
    const nextUtxo = createMockedGeneratorFunction([]);

    // Mock an AssetBalance object with some assets
    const requiredAssets: AssetBalance = {
      nativeToken: 100000n,
      tokens: [{ id: tokenId1, value: 900n }],
    };

    // Run test
    const result = await selectErgoBoxes(
      requiredAssets,
      [],
      emptyTrackMap,
      nextUtxo
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual([]);
  });

  /**
   * @target selectErgoBoxes should return enough boxes
   * as covered when tracked boxes cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock a Map to track first box to a new box
   * - mock an AssetBalance object with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return serialized tracked box
   */
  it('should return enough boxes as covered when tracked boxes cover required assets', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(boxes.slice(0, 2));

    // Mock a Map to track first box to a new box
    const trackMap = new Map<string, ErgoBoxProxy>();
    trackMap.set(boxes[0].boxId, boxes[2]);

    // Mock an AssetBalance object with assets less than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 500000n,
      tokens: [{ id: tokenId1, value: 50n }],
    };

    // Run test
    const result = await selectErgoBoxes(
      requiredAssets,
      [],
      trackMap,
      nextUtxo
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual([boxes[2]]);
  });

  /**
   * @target selectErgoBoxes should return all boxes as
   * NOT covered when tracked boxes do NOT cover required assets
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock a Map to track first box to a new box
   * - mock an AssetBalance object with assets more than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return serialized tracked boxes
   */
  it('should return all boxes as NOT covered when tracked boxes do NOT cover required assets', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(boxes.slice(0, 2));

    // Mock a Map to track first box to a new box
    const trackMap = new Map<string, ErgoBoxProxy>();
    trackMap.set(boxes[0].boxId, boxes[2]);

    // Mock an AssetBalance object with assets less than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 19000000n,
      tokens: [{ id: tokenId1, value: 110n }],
    };

    // Run test
    const result = await selectErgoBoxes(
      requiredAssets,
      [],
      trackMap,
      nextUtxo
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual([boxes[2], boxes[1]]);
  });

  /**
   * @target selectErgoBoxes should return second box
   * as covered when first box is not allowed
   * @dependencies
   * @scenario
   * - mock a function to return 2 boxes
   * - mock first box as forbidden
   * - mock an AssetBalance object with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return second serialized box
   */
  it('should return second box as covered when first box is not allowed', async () => {
    // Mock a function to return 2 boxes
    const nextUtxo = createMockedGeneratorFunction(boxes.slice(0, 2));

    // Mock first box as forbidden
    const forbiddenIds = [boxes[0].boxId];

    // Mock an AssetBalance object with assets less than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 900000n,
      tokens: [],
    };

    // Run test
    const result = await selectErgoBoxes(
      requiredAssets,
      forbiddenIds,
      emptyTrackMap,
      nextUtxo
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual([boxes[1]]);
  });

  /**
   * @target selectErgoBoxes should return no boxes as
   * NOT covered when tracking ends to no box
   * @dependencies
   * @scenario
   * - mock a function to return one box
   * - mock a Map to track first box to no box
   * - mock an AssetBalance object with assets less than box assets
   * - run test
   * - check returned value
   * @expected
   * - it should return empty list
   */
  it('should return no boxes as NOT covered when tracking ends to no box', async () => {
    // Mock a function to return one box
    const nextUtxo = createMockedGeneratorFunction(boxes.slice(0, 1));

    // Mock a Map to track first box to no box
    const trackMap = new Map<string, ErgoBoxProxy | undefined>();
    trackMap.set(boxes[0].boxId, undefined);

    // Mock an AssetBalance object with assets less than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 500000n,
      tokens: [],
    };

    // Run test
    const result = await selectErgoBoxes(
      requiredAssets,
      [],
      trackMap,
      nextUtxo
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual([]);
  });
});
