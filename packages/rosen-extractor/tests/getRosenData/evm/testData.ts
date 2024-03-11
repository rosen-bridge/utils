import { TransactionLike } from 'ethers';

export const lockAddress = '0xedee4752e5a2f595151c94762fb38e5730357785';

export const validErc20LockTx: TransactionLike = {
  type: 2,
  to: '0xb416c8a6d7ec94706a9ae2c26c11d320519482b1',
  data: '0xa9059cbb000000000000000000000000edee4752e5a2f595151c94762fb38e573035778500000000000000000000000000000000000000000000000000000000c502fc7000000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
  nonce: 10,
  gasLimit: '21000',
  gasPrice: null,
  maxPriorityFeePerGas: '500000000',
  maxFeePerGas: '48978500000',
  value: '92850988521632054',
  chainId: '1',
  accessList: [],
  signature: {
    r: '0x7af681001bf23365afc66fbdb18e33bbd69779d3436c3ad2d27797bd133b2235',
    s: '0x79b8f448c88ba863f450ebe916d386d696efe49ed33932c20951ed53fe50f915',
    yParity: 0,
  },
};

export const invalidTrxNoTo: TransactionLike = {
  type: 2,
  to: null,
  data: '0xa9059cbb000000000000000000000000edee4752e5a2f595151c94762fb38e573035778500000000000000000000000000000000000000000000000000000000c502fc7000000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
  nonce: 10,
  gasLimit: '21000',
  gasPrice: null,
  maxPriorityFeePerGas: '500000000',
  maxFeePerGas: '48978500000',
  value: '92850988521632054',
  chainId: '1',
  accessList: [],
  signature: {
    r: '0xadfadc4c58bcf948a2d4082308509ba4b602e81bbb17a3057b0355dfe24f4f33',
    s: '0x00ab5040c5805ee807feed122b5f348e2560aa7a83b03b21fb5295e0688c6b57',
    yParity: 1,
  },
};

export const invalidErc20LockTx: TransactionLike = {
  type: 2,
  to: '0x4606d11ff65B17d29e8C5E4085f9a868A8E5E4f2',
  data: '0xa9059cbb000000000000000000000000edee4752e5a2f595151c94762fb38e573035778500000000000000000000000000000000000000000000000000000000c502fc7001000000027554fc820000000000962f583901068186ed813df5f543ee541e1ee1a6dca4cc2ce1e197bc66ee842de2b0bd5044d9b70b9203fe77a7cb4d6a2d7967181703e2e78291ddde18',
  nonce: 10,
  gasLimit: '21000',
  gasPrice: null,
  maxPriorityFeePerGas: '500000000',
  maxFeePerGas: '48978500000',
  value: '92850988521632054',
  chainId: '1',
  accessList: [],
  signature: {
    r: '0x2cec221effa412d6f0eca4a2c692ed72765b7f1420ac3b0de67be82d69096485',
    s: '0x4f9adffd9b212f57a52938658ec56ed1b136b792512b45e27893ccfb85796fd6',
    yParity: 1,
  },
};

export const rosenDataErc20 = {
  toChain: 'ergo',
  toAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  bridgeFee: '1968503938',
  networkFee: '9842520',
  fromAddress: '0x6a6a84990fe4d261c6c7c701ea2ce64c0c32b1c7',
  sourceChainTokenId: '0xb416c8a6d7ec94706a9ae2c26c11d320519482b1',
  amount: '3305307248',
  targetChainTokenId:
    'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
  sourceTxId:
    '0x8bf190705922509abf96c834e416aae58ac764c42aad6ef68313d03647622e92',
};

export const validNativeLockTx: TransactionLike = {
  type: 2,
  to: '0xeDee4752e5a2F595151c94762fB38e5730357785',
  data: '0x00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
  nonce: 10,
  gasLimit: '21000',
  gasPrice: null,
  maxPriorityFeePerGas: '500000000',
  maxFeePerGas: '48978500000',
  value: '92850988521632054',
  chainId: '1',
  accessList: [],
  signature: {
    r: '0x587b09c516f10fde1085784264de5cb01efcebdc99b502c923ead1b92c79dde4',
    s: '0x1f58c1fce9a0bbc97a000b806268a3987eed9dfdc0217e1ec3fece02fa07a3b5',
    yParity: 0,
  },
};

export const rosenDataNative = {
  toChain: 'ergo',
  toAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  bridgeFee: '1968503938',
  networkFee: '9842520',
  fromAddress: '0x6a6a84990fe4d261c6c7c701ea2ce64c0c32b1c7',
  sourceChainTokenId: 'eth',
  amount: '92850988521632054',
  targetChainTokenId:
    'dcbda15f1361f5eeba41748193e059fce34f0c57499e9afe733ea0fd59cf63f48',
  sourceTxId:
    '0xce31716b60eb4f90e5c895edca9522d6e289dcc2c193caa6d302a8e11ae77a68',
};

export const noLockNoTransfer: TransactionLike = {
  type: 2,
  to: '0xb416c8a6d7ec94706a9ae2c26c11d320519482b1',
  data: '0xa9049cbb000000000000000000000000edee4752e5a2f595151c94762fb38e573035778500000000000000000000000000000000000000000000000000000000c502fc7000000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
  nonce: 10,
  gasLimit: '21000',
  gasPrice: null,
  maxPriorityFeePerGas: '500000000',
  maxFeePerGas: '48978500000',
  value: '92850988521632054',
  chainId: '1',
  accessList: [],
  signature: {
    r: '0x2f0cfba02d46dfe8d2dae95e98d6674275f5a20ce168ab69ca59e76f1c90ddd2',
    s: '0x2aad615511a8b681cfd41c940213deafe0b1dc15340f7793ab3306210ad040b3',
    yParity: 0,
  },
};

export const invalidTxTargetNoNative: TransactionLike = {
  type: 2,
  to: '0xeDee4752e5a2F595151c94762fB38e5730357785',
  data: '0x02000000007554fc820000000000962f583901068186ed813df5f543ee541e1ee1a6dca4cc2ce1e197bc66ee842de2b0bd5044d9b70b9203fe77a7cb4d6a2d7967181703e2e78291ddde18',
  nonce: 10,
  gasLimit: '21000',
  gasPrice: null,
  maxPriorityFeePerGas: '500000000',
  maxFeePerGas: '48978500000',
  value: '92850988521632054',
  chainId: '1',
  accessList: [],
  signature: {
    r: '0x71c7fb66f9533f5c614545c325c28679ce4455f46833377ce77151fc7e8b7407',
    s: '0x5dd26154a1264da80d83d984bcd500f1cebb4abb81aad725bfc25c950186df48',
    yParity: 0,
  },
};

export const invalidTxTargetNoToken: TransactionLike = {
  type: 2,
  to: '0x4606d11ff65B17d29e8C5E4085f9a868A8E5E4f2',
  data: '0xa9059cbb000000000000000000000000edee4752e5a2f595151c94762fb38e573035778500000000000000000000000000000000000000000000000000000000c502fc7001000000007554fc820000000000962f583901068186ed813df5f543ee541e1ee1a6dca4cc2ce1e197bc66ee842de2b0bd5044d9b70b9203fe77a7cb4d6a2d7967181703e2e78291ddde18',
  nonce: 10,
  gasLimit: '21000',
  gasPrice: null,
  maxPriorityFeePerGas: '500000000',
  maxFeePerGas: '48978500000',
  value: '92850988521632054',
  chainId: '1',
  accessList: [],
  signature: {
    r: '0x8d763638c7b52301af5e0335a7b7b8e8c9f744587407b76e00ae458263f17ad5',
    s: '0x52f8438521ade01f458a08bc647abc0f07f715a473bc771e46d8a03a84f201d3',
    yParity: 0,
  },
};
