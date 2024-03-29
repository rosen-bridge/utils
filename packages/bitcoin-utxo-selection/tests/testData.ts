import { BitcoinUtxo } from '../lib';

export const tokenId1 = `10bb8374ec0e933f80a684dd32363151cb6051864afb0b0088bba207.727074`;
export const utxos: BitcoinUtxo[] = [
  {
    txId: '6699c2b892da307f8e3bf9329e9b17b397a7aff525f4caa8d05507b73a8392b5',
    index: 0,
    value: 3000000n,
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 0,
    value: 10000000n,
  },
  {
    txId: '6699c2b892da307f8e3bf9329e9b17b397a7aff525f4caa8d05507b73a8392b5',
    index: 1,
    value: 3000000n,
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 1,
    value: 10000000n,
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 2,
    value: 10000000n,
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 3,
    value: 10000000n,
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 4,
    value: 10000000n,
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 5,
    value: 10000000n,
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 6,
    value: 10000000n,
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 7,
    value: 10000000n,
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 8,
    value: 10000000n,
  },
  {
    txId: '52600cd0abd9d0cb89b7ef199290c60cb5f0fca3417882fd5166593f7adccaac',
    index: 9,
    value: 10000000n,
  },
];

export const emptyMap = new Map<string, BitcoinUtxo | undefined>();
