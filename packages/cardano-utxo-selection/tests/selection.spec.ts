import { AssetBalance, CardanoUtxo, selectCardanoUtxos } from '../lib';

describe('selectCardanoUtxos', () => {
  const tokenId1 = `10bb8374ec0e933f80a684dd32363151cb6051864afb0b0088bba207.727074`;
  const utxos: CardanoUtxo[] = [
    {
      txId: '6699c2b892da307f8e3bf9329e9b17b397a7aff525f4caa8d05507b73a8392b5',
      index: 0,
      value: 3000000n,
      assets: [
        {
          policyId: '10bb8374ec0e933f80a684dd32363151cb6051864afb0b0088bba207',
          assetName: '727074',
          quantity: 150n,
        },
        {
          policyId: 'bb8374ec0e933f80a684dd32363151cb6051864afb0b0088bba20710',
          assetName: '72707476',
          quantity: 200n,
        },
      ],
    },
    {
      txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
      index: 0,
      value: 10000000n,
      assets: [],
    },
    {
      txId: '6699c2b892da307f8e3bf9329e9b17b397a7aff525f4caa8d05507b73a8392b5',
      index: 1,
      value: 3000000n,
      assets: [
        {
          policyId: '10bb8374ec0e933f80a684dd32363151cb6051864afb0b0088bba207',
          assetName: '727074',
          quantity: 100n,
        },
        {
          policyId: 'bb8374ec0e933f80a684dd32363151cb6051864afb0b0088bba20710',
          assetName: '727074',
          quantity: 300n,
        },
      ],
    },
    {
      txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
      index: 1,
      value: 10000000n,
      assets: [],
    },
    {
      txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
      index: 2,
      value: 10000000n,
      assets: [],
    },
    {
      txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
      index: 3,
      value: 10000000n,
      assets: [],
    },
    {
      txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
      index: 4,
      value: 10000000n,
      assets: [],
    },
    {
      txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
      index: 5,
      value: 10000000n,
      assets: [],
    },
    {
      txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
      index: 6,
      value: 10000000n,
      assets: [],
    },
    {
      txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
      index: 7,
      value: 10000000n,
      assets: [],
    },
    {
      txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
      index: 8,
      value: 10000000n,
      assets: [],
    },
    {
      txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
      index: 9,
      value: 10000000n,
      assets: [],
    },
  ];
  const emptyMap = new Map<string, CardanoUtxo>();

  /**
   * @target selectCardanoUtxos should return enough boxes
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
    const mockedGetAddressUtxos = jest.fn();
    mockedGetAddressUtxos
      .mockResolvedValue([])
      .mockResolvedValueOnce(utxos.slice(0, 2));

    // Mock an AssetBalance object with assets less than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 500000n,
      tokens: [{ id: tokenId1, value: 50n }],
    };

    // Run test
    const result = await selectCardanoUtxos(
      '',
      requiredAssets,
      [],
      emptyMap,
      mockedGetAddressUtxos
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual([utxos[0]]);
  });

  /**
   * @target selectCardanoUtxos should return all boxes as
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
    const mockedGetAddressUtxos = jest.fn();
    mockedGetAddressUtxos
      .mockResolvedValue([])
      .mockResolvedValueOnce(utxos.slice(0, 2));

    // Mock an AssetBalance object with assets more than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 30000000n,
      tokens: [{ id: tokenId1, value: 50n }],
    };

    // Run test
    const result = await selectCardanoUtxos(
      '',
      requiredAssets,
      [],
      emptyMap,
      mockedGetAddressUtxos
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual(expect.arrayContaining(utxos.slice(0, 2)));
  });

  /**
   * @target selectCardanoUtxos should return all useful boxes
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
    const mockedGetAddressUtxos = jest.fn();
    mockedGetAddressUtxos
      .mockResolvedValue([])
      .mockResolvedValueOnce(utxos.slice(0, 2));

    // Mock an AssetBalance object with tokens more than box tokens
    const requiredAssets: AssetBalance = {
      nativeToken: 600000n,
      tokens: [{ id: tokenId1, value: 300n }],
    };

    // Run test
    const result = await selectCardanoUtxos(
      '',
      requiredAssets,
      [],
      emptyMap,
      mockedGetAddressUtxos
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual(expect.arrayContaining(utxos.slice(0, 1)));
  });

  /**
   * @target selectCardanoUtxos should return enough boxes
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
    const mockedGetAddressUtxos = jest.fn();
    mockedGetAddressUtxos
      .mockResolvedValue([])
      .mockResolvedValueOnce(utxos.slice(0, 10))
      .mockResolvedValueOnce(utxos.slice(10, 12));

    // Mock an AssetBalance object with assets less than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 90000000n,
      tokens: [{ id: tokenId1, value: 50n }],
    };

    // Run test
    const result = await selectCardanoUtxos(
      '',
      requiredAssets,
      [],
      emptyMap,
      mockedGetAddressUtxos
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual(expect.arrayContaining(utxos.slice(0, 11)));
  });

  /**
   * @target selectCardanoUtxos should return all boxes as
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
    const mockedGetAddressUtxos = jest.fn();
    mockedGetAddressUtxos
      .mockResolvedValue([])
      .mockResolvedValueOnce(utxos.slice(0, 10))
      .mockResolvedValueOnce(utxos.slice(10, 12));

    // Mock an AssetBalance object with assets more than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 130000000n,
      tokens: [],
    };

    // Run test
    const result = await selectCardanoUtxos(
      '',
      requiredAssets,
      [],
      emptyMap,
      mockedGetAddressUtxos
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual(expect.arrayContaining(utxos));
  });

  /**
   * @target selectCardanoUtxos should return no boxes as
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
    const mockedGetAddressUtxos = jest.fn();
    mockedGetAddressUtxos.mockResolvedValue([]);

    // Mock an AssetBalance object with some assets
    const requiredAssets: AssetBalance = {
      nativeToken: 100000n,
      tokens: [{ id: tokenId1, value: 900n }],
    };

    // Run test
    const result = await selectCardanoUtxos(
      '',
      requiredAssets,
      [],
      emptyMap,
      mockedGetAddressUtxos
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual([]);
  });

  /**
   * @target selectCardanoUtxos should return enough boxes
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
    const mockedGetAddressUtxos = jest.fn();
    mockedGetAddressUtxos
      .mockResolvedValue([])
      .mockResolvedValueOnce(utxos.slice(0, 2));

    // Mock a Map to track first box to a new box
    const trackMap = new Map<string, CardanoUtxo>();
    trackMap.set(`${utxos[0].txId}.${utxos[0].index}`, utxos[2]);

    // Mock an AssetBalance object with assets less than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 500000n,
      tokens: [{ id: tokenId1, value: 50n }],
    };

    // Run test
    const result = await selectCardanoUtxos(
      '',
      requiredAssets,
      [],
      trackMap,
      mockedGetAddressUtxos
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual([utxos[2]]);
  });

  /**
   * @target selectCardanoUtxos should return all boxes as
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
    const mockedGetAddressUtxos = jest.fn();
    mockedGetAddressUtxos
      .mockResolvedValue([])
      .mockResolvedValueOnce(utxos.slice(0, 2));

    // Mock a Map to track first box to a new box
    const trackMap = new Map<string, CardanoUtxo>();
    trackMap.set(`${utxos[0].txId}.${utxos[0].index}`, utxos[2]);

    // Mock an AssetBalance object with assets less than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 19000000n,
      tokens: [{ id: tokenId1, value: 110n }],
    };

    // Run test
    const result = await selectCardanoUtxos(
      '',
      requiredAssets,
      [],
      trackMap,
      mockedGetAddressUtxos
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual(expect.arrayContaining(utxos.slice(1, 3)));
  });

  /**
   * @target selectCardanoUtxos should return second box
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
    const mockedGetAddressUtxos = jest.fn();
    mockedGetAddressUtxos
      .mockResolvedValue([])
      .mockResolvedValueOnce(utxos.slice(0, 2));

    // Mock first box as forbidden
    const forbiddenIds = [`${utxos[0].txId}.${utxos[0].index}`];

    // Mock an AssetBalance object with assets less than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 900000n,
      tokens: [],
    };

    // Run test
    const result = await selectCardanoUtxos(
      '',
      requiredAssets,
      forbiddenIds,
      emptyMap,
      mockedGetAddressUtxos
    );

    // Check returned value
    expect(result.covered).toEqual(true);
    expect(result.boxes).toEqual([utxos[1]]);
  });

  /**
   * @target selectCardanoUtxos should return no boxes as
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
    const mockedGetAddressUtxos = jest.fn();
    mockedGetAddressUtxos
      .mockResolvedValue([])
      .mockResolvedValueOnce(utxos.slice(0, 1));

    // Mock a Map to track first box to no box
    const trackMap = new Map<string, CardanoUtxo | undefined>();
    trackMap.set(`${utxos[0].txId}.${utxos[0].index}`, undefined);

    // Mock an AssetBalance object with assets less than box assets
    const requiredAssets: AssetBalance = {
      nativeToken: 500000n,
      tokens: [],
    };

    // Run test
    const result = await selectCardanoUtxos(
      '',
      requiredAssets,
      [],
      trackMap,
      mockedGetAddressUtxos
    );

    // Check returned value
    expect(result.covered).toEqual(false);
    expect(result.boxes).toEqual([]);
  });
});
