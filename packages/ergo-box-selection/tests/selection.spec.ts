import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { describe, expect, it } from 'vitest';
import {
  AssetBalance,
  ErgoBoxProxy,
  calcChangeValue,
  calcTokenChange,
  createChangeBox,
  selectErgoBoxes,
} from '../lib';
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

describe('createChangeBox', () => {
  const height = 2000000;
  const candidateBoxTokensToArray = (box: ergoLib.ErgoBoxCandidate) => {
    const changeBoxTokens: Array<[string, bigint]> = [];
    const tokens = box!.tokens();
    const tokenCount = tokens.len();
    for (let i = 0; i < tokenCount; i++) {
      const token = tokens.get(i);
      changeBoxTokens.push([
        token.id().to_str(),
        BigInt(token.amount().as_i64().to_str()),
      ]);
    }
    return changeBoxTokens;
  };

  /**
   * @target should return a box with correct Erg value when there is no other
   * tokens
   * @dependencies
   * @scenario
   * - create input and output boxes with no tokens
   * - call createChangeBox
   * - check return value not to be undefined
   * - check returned box to have correct change value
   * - check returned box to have no tokens
   * - check returned box to have the correct change address
   * @expected
   * - return value should not be undefined
   * - returned box should have correct change value
   * - returned box should have no tokens
   * - returned box should have the correct change address
   */
  it(`should return a box with correct Erg value when there is no other tokens`, async () => {
    const noTokenBoxes = testData.boxesAscending.filter(
      (box) => box.assets.length === 0
    );

    const outputBoxes = noTokenBoxes.slice(0, 2);
    const inputBoxes = noTokenBoxes.slice(2, 5);
    const changeValue = calcChangeValue(
      inputBoxes,
      outputBoxes.map(testData.fromErgoBoxCandidateProxy),
      testData.txFee
    );

    const changeBox = createChangeBox(
      testData.changeAddress,
      height,
      inputBoxes,
      outputBoxes.map(testData.fromErgoBoxCandidateProxy),
      testData.txFee,
      []
    );

    expect(changeBox).toBeDefined();
    expect(changeBox!.value().as_i64().to_str()).toEqual(
      changeValue.toString()
    );
    expect(changeBox!.tokens().len()).toEqual(0);
    expect(
      ergoLib.Address.recreate_from_ergo_tree(changeBox!.ergo_tree()).to_base58(
        ergoLib.NetworkPrefix.Testnet
      )
    ).toEqual(testData.changeAddress);
  });

  /**
   * @target should return a box with correct Erg value and remaining tokens
   * @dependencies
   * @scenario
   * - create input (with token) and output boxes
   * - call createChangeBox
   * - check return value not to be undefined
   * - check returned box to have correct change value
   * - check returned box to have correct tokens
   * - check returned box to have the correct change address
   * @expected
   * - return value should not be undefined
   * - returned box should have correct change value
   * - returned box should have correct tokens
   * - returned box should have the correct change address
   */
  it(`should return a box with correct Erg value and remaining tokens`, async () => {
    const noTokenBoxes = testData.boxesAscending.filter(
      (box) => box.assets.length === 0
    );
    const outputBoxes = noTokenBoxes.slice(0, 2);
    const inputBoxes = noTokenBoxes.slice(2, 5);
    const boxesWithToken = testData.boxesAscending.filter(
      (box) => box.assets.length > 0
    );
    inputBoxes.push(...boxesWithToken);
    const changeValue = calcChangeValue(
      inputBoxes,
      outputBoxes.map(testData.fromErgoBoxCandidateProxy),
      testData.txFee
    );

    const changeBox = createChangeBox(
      testData.changeAddress,
      height,
      inputBoxes,
      outputBoxes.map(testData.fromErgoBoxCandidateProxy),
      testData.txFee,
      []
    );
    const changeBoxTokens = candidateBoxTokensToArray(changeBox!);

    expect(changeBox).toBeDefined();
    expect(BigInt(changeBox!.value().as_i64().to_str())).toEqual(changeValue);
    expect(changeBoxTokens.sort()).toEqual(
      [...calcTokenChange(boxesWithToken, []).entries()].sort()
    );
    expect(
      ergoLib.Address.recreate_from_ergo_tree(changeBox!.ergo_tree()).to_base58(
        ergoLib.NetworkPrefix.Testnet
      )
    ).toEqual(testData.changeAddress);
  });

  /**
   * @target should throw exception when passed output boxes have more Ergs than
   * input boxes
   * @dependencies
   * @scenario
   * - create input and output boxes
   * - call createChangeBox
   * - check if exception is thrown
   * @expected
   * - should throw exception
   */
  it(`should throw exception when passed output boxes have more Ergs than input
  boxes`, async () => {
    const noTokenBoxes = testData.boxesAscending.filter(
      (box) => box.assets.length === 0
    );

    const outputBoxes = noTokenBoxes.slice(0, 3);
    const inputBoxes = noTokenBoxes.slice(3, 5);

    expect(() =>
      createChangeBox(
        testData.changeAddress,
        height,
        inputBoxes,
        outputBoxes.map(testData.fromErgoBoxCandidateProxy),
        testData.txFee,
        []
      )
    ).toThrow();
  });

  /**
   * @target should return an exception when outputs have more tokens than
   * inputs
   * @dependencies
   * @scenario
   * - create input and output (with more tokens) boxes
   * - call createChangeBox
   * - check change value to be positive
   * - check createChangeBox to throw exception
   * @expected
   * - change value should be positive
   * - createChangeBox should throw exception
   */
  it(`should return an exception when outputs have more tokens than inputs`, async () => {
    const noTokenBoxes = testData.boxesAscending.filter(
      (box) => box.assets.length === 0
    );
    const boxesWithToken = testData.boxesAscending.filter(
      (box) => box.assets.length > 0
    );
    const outputBoxes = noTokenBoxes.slice(0, 2);
    outputBoxes.push(...boxesWithToken);
    const inputBoxes = noTokenBoxes.slice(2, 6);
    const changeValue = calcChangeValue(
      inputBoxes,
      outputBoxes.map(testData.fromErgoBoxCandidateProxy),
      testData.txFee
    );

    const safeMinBoxValue = BigInt(
      ergoLib.BoxValue.SAFE_USER_MIN().as_i64().to_str()
    );
    expect(changeValue).toBeGreaterThan(safeMinBoxValue);
    expect(() =>
      createChangeBox(
        testData.changeAddress,
        height,
        inputBoxes,
        outputBoxes.map(testData.fromErgoBoxCandidateProxy),
        testData.txFee,
        []
      )
    ).toThrow();
  });

  /**
   * @target should return an exception when change value is zero but there are
   * tokens with positive change amount
   * @dependencies
   * @scenario
   * - create input (with tokens) and output boxes with equal ergs
   * - call createChangeBox
   * - check change value to be zero
   * - check all tokens to be have non-negative change amount
   * - check one token with positive change amount to exist
   * - check createChangeBox to throw exception
   * @expected
   * - change value should be zero
   * - all tokens should have non-negative change amount
   * - one token with positive change amount should exist
   * - createChangeBox should throw exception
   */
  it(`should return an exception when change value is zero but there are tokens
  with positive change amount`, async () => {
    const noTokenBoxes = testData.boxesAscending.filter(
      (box) => box.assets.length === 0
    );
    const boxesWithToken = testData.boxesAscending.filter(
      (box) => box.assets.length > 0
    );
    const outputBoxes = noTokenBoxes.slice(0, 2);
    outputBoxes[0] = {
      ...outputBoxes[0],
      value: (
        BigInt(outputBoxes[0].value) + BigInt(boxesWithToken[0].value)
      ).toString(),
    };
    const inputBoxes = noTokenBoxes.slice(2, 4);
    inputBoxes.push(boxesWithToken[0]);
    const changeValue = calcChangeValue(
      inputBoxes,
      outputBoxes.map(testData.fromErgoBoxCandidateProxy),
      0n
    );

    const safeMinBoxValue = BigInt(
      ergoLib.BoxValue.SAFE_USER_MIN().as_i64().to_str()
    );
    expect(changeValue).toEqual(0n);
    expect(
      [
        ...calcTokenChange(
          inputBoxes,
          outputBoxes.map(testData.fromErgoBoxCandidateProxy)
        ).entries(),
      ].every(([, amount]) => amount >= 0)
    ).toBeTruthy();
    expect(
      [
        ...calcTokenChange(
          inputBoxes,
          outputBoxes.map(testData.fromErgoBoxCandidateProxy)
        ).entries(),
      ].some(([, amount]) => amount > 0)
    ).toBeTruthy();
    expect(() =>
      createChangeBox(
        testData.changeAddress,
        height,
        inputBoxes,
        outputBoxes.map(testData.fromErgoBoxCandidateProxy),
        0n,
        []
      )
    ).toThrow();
  });

  /**
   * @target should return a box with correct Erg value and remaining tokens
   * after burning specified tokens
   * @dependencies
   * @scenario
   * - create input (with token) and output boxes
   * - call createChangeBox and pass token list to burn
   * - check return value not to be undefined
   * - check returned box to have correct change value
   * - check returned box to have correct tokens
   * - check returned box to have the correct change address
   * @expected
   * - return value should not be undefined
   * - returned box should have correct change value
   * - returned box should have correct tokens
   * - returned box should have the correct change address
   */
  it(`should return a box with correct Erg value and remaining tokens after
  burning specified tokens`, async () => {
    const noTokenBoxes = testData.boxesAscending.filter(
      (box) => box.assets.length === 0
    );
    const outputBoxes = noTokenBoxes.slice(0, 2);
    const inputBoxes = noTokenBoxes.slice(2, 5);
    const boxesWithToken = testData.boxesAscending.filter(
      (box) => box.assets.length > 0
    );
    inputBoxes.push(...boxesWithToken);
    const changeValue = calcChangeValue(
      inputBoxes,
      outputBoxes.map(testData.fromErgoBoxCandidateProxy),
      testData.txFee
    );

    const tokenToBurn = {
      id: boxesWithToken[0].assets[0].tokenId,
      value: 50n,
    };
    const changeBox = createChangeBox(
      testData.changeAddress,
      height,
      inputBoxes,
      outputBoxes.map(testData.fromErgoBoxCandidateProxy),
      testData.txFee,
      [tokenToBurn]
    );
    const changeBoxTokens = candidateBoxTokensToArray(changeBox!);

    expect(changeBox).toBeDefined();
    expect(BigInt(changeBox!.value().as_i64().to_str())).toEqual(changeValue);
    expect(changeBoxTokens.sort()).toEqual(
      [...calcTokenChange(boxesWithToken, []).entries()]
        .map(([id, amount]) => [
          id,
          id !== tokenToBurn.id ? amount : amount - tokenToBurn.value,
        ])
        .sort()
    );
    expect(
      ergoLib.Address.recreate_from_ergo_tree(changeBox!.ergo_tree()).to_base58(
        ergoLib.NetworkPrefix.Testnet
      )
    ).toEqual(testData.changeAddress);
  });
});

describe('calcChangeValue', () => {
  /**
   * @target should return the difference between input and output box values
   * @dependencies
   * @scenario
   * - create input and output boxes
   * - calculate the change value
   * - call calcChangeValue with input and output boxes
   * - check returned value to be equal to the calculated change value
   * @expected
   * - returned value should be equal to the calculated change value
   */
  it(`should return the difference between input and output box values`, async () => {
    const outputBoxes = testData.boxesAscending.slice(0, 2);
    const inputBoxes = testData.boxesAscending.slice(2, 5);

    let changeValue = 0n;
    for (const box of inputBoxes) {
      changeValue += BigInt(box.value);
    }
    for (const box of outputBoxes) {
      changeValue -= BigInt(box.value);
    }

    expect(
      calcChangeValue(
        inputBoxes,
        outputBoxes.map(testData.fromErgoBoxCandidateProxy),
        testData.txFee
      )
    ).toEqual(changeValue - testData.txFee);
  });
});

describe('calcTokenChange', () => {
  /**
   * @target should calculate token amount difference between input and output
   * boxes
   * @dependencies
   * @scenario
   * - create input and output boxes
   * - calculate token change values
   * - call calcTokenChange with input and output boxes
   * - check returned value to be equal to the calculated token change values
   * @expected
   * - returned value should be equal to the calculated token change values
   */
  it(`should calculate token amount difference between input and output boxes`, async () => {
    const outputBoxes = testData.boxesAscending.slice(0, 2);
    const inputBoxes = testData.boxesAscending.slice(2, 5);

    const tokens: [string, bigint][] = [];
    tokens.push(
      ...inputBoxes
        .flatMap((box) => box.assets)
        .map<[string, bigint]>((asset) => [asset.tokenId, BigInt(asset.amount)])
    );
    tokens.push(
      ...outputBoxes
        .flatMap((box) => box.assets)
        .map<[string, bigint]>((asset) => [
          asset.tokenId,
          -BigInt(asset.amount),
        ])
    );
    tokens.sort();
    const tokensChange: [string, bigint][] = [];
    for (const [id, amount] of tokens) {
      if (tokensChange.length === 0 || tokensChange.at(-1)![0] !== id) {
        tokensChange.push([id, amount]);
      } else {
        tokensChange.at(-1)![1] += amount;
      }
    }

    expect(
      [
        ...calcTokenChange(
          inputBoxes,
          outputBoxes.map(testData.fromErgoBoxCandidateProxy)
        ).entries(),
      ].sort()
    ).toEqual(tokensChange.sort());
  });
});
