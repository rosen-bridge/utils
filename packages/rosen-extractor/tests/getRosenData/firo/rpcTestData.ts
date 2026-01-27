export const lockAddress = 'a3io3zMLfg9nchA3KSoSEvPz1tztnKDuaT';

const baseTx = {
  txid: 'b0d214c50032481f728dab5144cf37dd6232a71c4706246237f2a5c4ea56d1f5',
  hash: 'b0d214c50032481f728dab5144cf37dd6232a71c4706246237f2a5c4ea56d1f5',
  version: 1,
  size: 200,
  vsize: 200,
  locktime: 0,
  type: 0,
  vin: [
    {
      txid: '835b8bfb12b7e9b9d3d946458e38c628a2df8ba8059ac9c664360836157b994e',
      vout: 0,
      scriptSig: {
        asm: '30440220669a7ae8a5761abeda936725755ea1c661b83ff5bf3feff5dcd41d1abeabc96e022077df83be234e3667218a03d62e7bad9aeb3f1ec6e45f284db807373aa083a153[ALL] 03cfc2bd15d648c042642823ddb27a7dcbc2e2bf5a06194cb91c8d5ed7cbbc7632',
        hex: '4730440220669a7ae8a5761abeda936725755ea1c661b83ff5bf3feff5dcd41d1abeabc96e022077df83be234e3667218a03d62e7bad9aeb3f1ec6e45f284db807373aa083a153012103cfc2bd15d648c042642823ddb27a7dcbc2e2bf5a06194cb91c8d5ed7cbbc7632',
      },
      sequence: 4294967295,
    },
  ],
};

export const txUtxos = {
  lockTx: {
    vout: [
      {
        value: 0,
        n: 0,
        scriptPubKey: {
          asm: 'OP_RETURN 00000000000098968000000000009896802103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
          hex: '6a3300000000000098968000000000009896802103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
          type: 'nulldata',
        },
      },
      {
        value: 5.0,
        n: 1,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 20f87f7f202c3d40dea06df136862fdbeef3f8e7 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
          type: 'pubkeyhash',
          addresses: ['a3io3zMLfg9nchA3KSoSEvPz1tztnKDuaT'],
        },
      },
      {
        value: 15.0,
        n: 2,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 369236a50667e799e9a1eb2d8f492ffec9d89e04 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914369236a50667e799e9a1eb2d8f492ffec9d89e0488ac',
          type: 'pubkeyhash',
          addresses: ['a5h1PMR9eivcQ2XU8KMT3iLJ1m3rYRfAB2'],
        },
      },
    ],
  },
  lessBoxes: {
    vout: [
      {
        value: 20.0,
        n: 0,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 20f87f7f202c3d40dea06df136862fdbeef3f8e7 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
          type: 'pubkeyhash',
          addresses: ['a3io3zMLfg9nchA3KSoSEvPz1tztnKDuaT'],
        },
      },
    ],
  },
  noOpReturn: {
    vout: [
      {
        value: 5.0,
        n: 0,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 20f87f7f202c3d40dea06df136862fdbeef3f8e7 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
          type: 'pubkeyhash',
          addresses: ['a3io3zMLfg9nchA3KSoSEvPz1tztnKDuaT'],
        },
      },
      {
        value: 15.0,
        n: 1,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 369236a50667e799e9a1eb2d8f492ffec9d89e04 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914369236a50667e799e9a1eb2d8f492ffec9d89e0488ac',
          type: 'pubkeyhash',
          addresses: ['a5h1PMR9eivcQ2XU8KMT3iLJ1m3rYRfAB2'],
        },
      },
    ],
  },
  noLock: {
    vout: [
      {
        value: 0,
        n: 0,
        scriptPubKey: {
          asm: 'OP_RETURN 00000000000098968000000000009896802103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
          hex: '6a3300000000000098968000000000009896802103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
          type: 'nulldata',
        },
      },
      {
        value: 20.0,
        n: 1,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 369236a50667e799e9a1eb2d8f492ffec9d89e04 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914369236a50667e799e9a1eb2d8f492ffec9d89e0488ac',
          type: 'pubkeyhash',
          addresses: ['a5h1PMR9eivcQ2XU8KMT3iLJ1m3rYRfAB2'],
        },
      },
    ],
  },
  invalidData: {
    vout: [
      {
        value: 0,
        n: 0,
        scriptPubKey: {
          asm: 'OP_RETURN 090000000000989680000000000098968039018dd8d9339deaf201790f6891adebb3abd78c90f3231aa95f12ce8f9ab18016dab2d790baeecb323f792babc1a769511b4a3262e6703f24c1',
          hex: '6a4b090000000000989680000000000098968039018dd8d9339deaf201790f6891adebb3abd78c90f3231aa95f12ce8f9ab18016dab2d790baeecb323f792babc1a769511b4a3262e6703f24c1',
          type: 'nulldata',
        },
      },
      {
        value: 20.0,
        n: 1,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 20f87f7f202c3d40dea06df136862fdbeef3f8e7 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
          type: 'pubkeyhash',
          addresses: ['a3io3zMLfg9nchA3KSoSEvPz1tztnKDuaT'],
        },
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
    'box:835b8bfb12b7e9b9d3d946458e38c628a2df8ba8059ac9c664360836157b994e.0',
  sourceChainTokenId: 'firo',
  amount: '500000000',
  targetChainTokenId:
    'e15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f49',
  sourceTxId:
    'b0d214c50032481f728dab5144cf37dd6232a71c4706246237f2a5c4ea56d1f5',
  rawData:
    '6a3300000000000098968000000000009896802103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
};

export const lockUtxo = {
  n: 1,
  scriptPubKey: {
    asm: 'OP_DUP OP_HASH160 20f87f7f202c3d40dea06df136862fdbeef3f8e7 OP_EQUALVERIFY OP_CHECKSIG',
    hex: '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac',
    address: 'a3io3zMLfg9nchA3KSoSEvPz1tztnKDuaT',
    type: 'pubkeyhash',
  },
  value: 5.0,
};

export const rsFiroErgoTransformation = {
  from: 'firo',
  to: 'e15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f49',
  amount: '500000000',
};
