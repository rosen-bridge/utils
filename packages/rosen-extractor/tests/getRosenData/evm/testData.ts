import { Signature } from 'ethers';

export const lockAddress = '0xedee4752e5a2f595151c94762fb38e5730357785';

export const validErc20LockTx = {
  blockNumber: 19195927,
  blockHash:
    '0x3fe54add83a1b7122039ddfc4a5e6b2a4116791b2db5d4f6e3a5cd2a36737acc',
  index: 4,
  maxFeePerBlobGas: null,
  hash: '0x0a661586235004d977583ee5715ae87679d2815381ff62f08e006bbc7e3a9afc',
  type: 2,
  to: '0xb416c8a6d7ec94706a9ae2c26c11d320519482b1',
  from: '0xf9CA64253deb69814c5B1d80384Bb25F643427dB',
  nonce: 10,
  gasLimit: 21000n,
  gasPrice: 32276327370n,
  maxPriorityFeePerGas: 500000000n,
  maxFeePerGas: 48978500000n,
  data: '0xa9059cbb000000000000000000000000edee4752e5a2f595151c94762fb38e573035778500000000000000000000000000000000000000000000000000000000c502fc7000000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
  value: 92850988521632054n,
  chainId: 1n,
  signature: Signature.from({
    r: '0xb54273293ae8a1d911657f04f406027897925f2f3ecefe2fbb95e22cc13d1414',
    s: '0x782d760a089d965d0a3c71c29e6099479801c2de90883ca1c77c6a964a7a88ef',
    yParity: 1,
  }),
  accessList: [],
  blobVersionedHashes: null,
};

export const invalidErc20LockTx = {
  blockNumber: 19195927,
  blockHash:
    '0x3fe54add83a1b7122039ddfc4a5e6b2a4116791b2db5d4f6e3a5cd2a36737acc',
  index: 4,
  maxFeePerBlobGas: null,
  hash: '0x0a661586235004d977583ee5715ae87679d2815381ff62f08e006bbc7e3a9afc',
  type: 2,
  to: '0x4606d11ff65b17d29e8c5e4085f9a868a8e5e4f2',
  from: '0xf9CA64253deb69814c5B1d80384Bb25F643427dB',
  nonce: 10,
  gasLimit: 21000n,
  gasPrice: 32276327370n,
  maxPriorityFeePerGas: 500000000n,
  maxFeePerGas: 48978500000n,
  data: '0xa9059cbb000000000000000000000000edee4752e5a2f595151c94762fb38e573035778500000000000000000000000000000000000000000000000000000000c502fc7001000000027554fc820000000000962f583901068186ed813df5f543ee541e1ee1a6dca4cc2ce1e197bc66ee842de2b0bd5044d9b70b9203fe77a7cb4d6a2d7967181703e2e78291ddde18',
  value: 92850988521632054n,
  chainId: 1n,
  signature: Signature.from({
    r: '0xb54273293ae8a1d911657f04f406027897925f2f3ecefe2fbb95e22cc13d1414',
    s: '0x782d760a089d965d0a3c71c29e6099479801c2de90883ca1c77c6a964a7a88ef',
    yParity: 1,
  }),
  accessList: [],
  blobVersionedHashes: null,
};

export const rosenDataErc20 = {
  toChain: 'ergo',
  toAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  bridgeFee: '1968503938',
  networkFee: '9842520',
  fromAddress: '0xf9CA64253deb69814c5B1d80384Bb25F643427dB',
  sourceChainTokenId: '0xb416c8a6d7ec94706a9ae2c26c11d320519482b1',
  amount: '3305307248',
  targetChainTokenId:
    'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
  sourceTxId:
    '0x0a661586235004d977583ee5715ae87679d2815381ff62f08e006bbc7e3a9afc',
};

export const validNativeLockTx = {
  blockNumber: 19195927,
  blockHash:
    '0x3fe54add83a1b7122039ddfc4a5e6b2a4116791b2db5d4f6e3a5cd2a36737acc',
  index: 4,
  maxFeePerBlobGas: null,
  hash: '0x0a661586235004d977583ee5715ae87679d2815381ff62f08e006bbc7e3a9afc',
  type: 2,
  to: '0xedee4752e5a2f595151c94762fb38e5730357785',
  from: '0xf9CA64253deb69814c5B1d80384Bb25F643427dB',
  nonce: 10,
  gasLimit: 21000n,
  gasPrice: 32276327370n,
  maxPriorityFeePerGas: 500000000n,
  maxFeePerGas: 48978500000n,
  data: '0x00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
  value: 92850988521632054n,
  chainId: 1n,
  signature: Signature.from({
    r: '0xb54273293ae8a1d911657f04f406027897925f2f3ecefe2fbb95e22cc13d1414',
    s: '0x782d760a089d965d0a3c71c29e6099479801c2de90883ca1c77c6a964a7a88ef',
    yParity: 1,
  }),
  accessList: [],
  blobVersionedHashes: null,
};

export const rosenDataNative = {
  toChain: 'ergo',
  toAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  bridgeFee: '1968503938',
  networkFee: '9842520',
  fromAddress: '0xf9CA64253deb69814c5B1d80384Bb25F643427dB',
  sourceChainTokenId: 'eth',
  amount: '92850988521632054',
  targetChainTokenId:
    'dcbda15f1361f5eeba41748193e059fce34f0c57499e9afe733ea0fd59cf63f48',
  sourceTxId:
    '0x0a661586235004d977583ee5715ae87679d2815381ff62f08e006bbc7e3a9afc',
};

export const noLockNoTransfer = {
  blockNumber: 19195927,
  blockHash:
    '0x3fe54add83a1b7122039ddfc4a5e6b2a4116791b2db5d4f6e3a5cd2a36737acc',
  index: 4,
  maxFeePerBlobGas: null,
  hash: '0x0a661586235004d977583ee5715ae87679d2815381ff62f08e006bbc7e3a9afc',
  type: 2,
  to: '0xb416c8a6d7ec94706a9ae2c26c11d320519482b1',
  from: '0xf9CA64253deb69814c5B1d80384Bb25F643427dB',
  nonce: 10,
  gasLimit: 21000n,
  gasPrice: 32276327370n,
  maxPriorityFeePerGas: 500000000n,
  maxFeePerGas: 48978500000n,
  data: '0xa9049cbb000000000000000000000000edee4752e5a2f595151c94762fb38e573035778500000000000000000000000000000000000000000000000000000000c502fc7000000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
  value: 92850988521632054n,
  chainId: 1n,
  signature: Signature.from({
    r: '0xb54273293ae8a1d911657f04f406027897925f2f3ecefe2fbb95e22cc13d1414',
    s: '0x782d760a089d965d0a3c71c29e6099479801c2de90883ca1c77c6a964a7a88ef',
    yParity: 1,
  }),
  accessList: [],
  blobVersionedHashes: null,
};
