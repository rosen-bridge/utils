import { CardanoUtxo } from '../lib';

export const tokenId1 = `10bb8374ec0e933f80a684dd32363151cb6051864afb0b0088bba207.727074`;
export const utxos: CardanoUtxo[] = [
  {
    txId: '6699c2b892da307f8e3bf9329e9b17b397a7aff525f4caa8d05507b73a8392b5',
    index: 0,
    address: 'address',
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
    address: 'address',
    value: 10000000n,
    assets: [],
  },
  {
    txId: '6699c2b892da307f8e3bf9329e9b17b397a7aff525f4caa8d05507b73a8392b5',
    index: 1,
    address: 'address',
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
    address: 'address',
    value: 10000000n,
    assets: [],
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 2,
    address: 'address',
    value: 10000000n,
    assets: [],
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 3,
    address: 'address',
    value: 10000000n,
    assets: [],
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 4,
    address: 'address',
    value: 10000000n,
    assets: [],
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 5,
    address: 'address',
    value: 10000000n,
    assets: [],
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 6,
    address: 'address',
    value: 10000000n,
    assets: [],
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 7,
    address: 'address',
    value: 10000000n,
    assets: [],
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 8,
    address: 'address',
    value: 10000000n,
    assets: [],
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 9,
    address: 'address',
    value: 10000000n,
    assets: [],
  },
];

export const utxoWithOutIndex = {
  txId: '6699c2b892da307f8e3bf9329e9b17b397a7aff525f4caa8d05507b73a8392b5',
  address: 'address',
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
};

export const emptyMap = new Map<string, CardanoUtxo>();
