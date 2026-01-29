export const lockAddress = 'a3io3zMLfg9nchA3KSoSEvPz1tztnKDuaT';

export const baseTx = {
  id: '835b8bfb12b7e9b9d3d946458e38c628a2df8ba8059ac9c664360836157b994e',
  inputs: [
    {
      txId: '7f1a2e3d4c5b6a9e8f7d6c5b4a3e2d1c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4',
      index: 0,
      scriptPubKey: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
    },
  ],
};

export const txUtxos = {
  lockTx: {
    outputs: [
      {
        scriptPubKey:
          '6a3300000000000098968000000000009896802103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
        value: 0n,
      },
      {
        scriptPubKey: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
        value: 10000000n,
      },
      {
        scriptPubKey: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
        value: 15584394312n,
      },
    ],
  },
  lessBoxes: {
    outputs: [
      {
        scriptPubKey: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
        value: 15594394312n,
      },
    ],
  },
  noOpReturn: {
    outputs: [
      {
        scriptPubKey: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
        value: 10000000n,
      },
      {
        scriptPubKey: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
        value: 15584394312n,
      },
    ],
  },
  noLock: {
    outputs: [
      {
        scriptPubKey:
          '6a3300000000000098968000000000009896802103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
        value: 0n,
      },
      {
        scriptPubKey: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ab',
        value: 15594394312n,
      },
    ],
  },
  invalidData: {
    outputs: [
      {
        scriptPubKey:
          '6a3309000000000098968000000000009896802103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
        value: 0n,
      },
      {
        scriptPubKey: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
        value: 15594394312n,
      },
    ],
  },
};

export const txs = {
  lockTx: {
    ...baseTx,
    ...txUtxos.lockTx,
  },
  lessBoxes: {
    ...baseTx,
    ...txUtxos.lessBoxes,
  },
  noOpReturn: {
    ...baseTx,
    ...txUtxos.noOpReturn,
  },
  noLock: {
    ...baseTx,
    ...txUtxos.noLock,
  },
  invalidData: {
    ...baseTx,
    ...txUtxos.invalidData,
  },
};

export const rosenData = {
  toChain: 'ergo',
  toAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  bridgeFee: '10000000',
  networkFee: '10000000',
  fromAddress:
    'box:7f1a2e3d4c5b6a9e8f7d6c5b4a3e2d1c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4.0',
  sourceChainTokenId: 'firo',
  amount: '10000000',
  targetChainTokenId:
    'e15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f49',
  sourceTxId:
    '835b8bfb12b7e9b9d3d946458e38c628a2df8ba8059ac9c664360836157b994e',
  rawData:
    '6a3300000000000098968000000000009896802103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
};

export const lockUtxo = {
  scriptPubKey: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
  value: 10000000n,
};

export const rsFiroCardanoTransformation = {
  from: 'firo',
  to: 'c15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f49',
  amount: '10000000',
};

export const rsFiroErgoTransformation = {
  from: 'firo',
  to: 'e15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f49',
  amount: '10000000',
};

export const rsFiroBitcoinTransformation = {
  amount: '10000000',
  from: 'firo',
  to: 'b8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8f8.6669726f',
};
