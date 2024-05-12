export const lockAddress = 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h';

export const baseTx = {
  txid: '6a1b9e7a755afb5d82ecaa5f432d51bd23e452ee1031fc99066e92788a075a84',
  hash: '922378c028a459110ebaebf5a30b9ef09823b4cfa2d363de5681a132e9aa27e2',
  version: 1,
  locktime: 0,
  size: 250,
  vsize: 168,
  weight: 670,
  vin: [
    {
      txid: 'eff4900465d1603d12c1dc8f231a07ce2196c04196aa26bb80147bb152137aaf',
      vout: 0,
      scriptSig: {
        asm: '',
        hex: '',
      },
      txinwitness: [
        '3045022100d267a326ce452a3eb2aae3c746f1b8a7108b7b2294f1dd0edb5e6ca556c8cc34022016f93fe05e7b4e9e22f711be86ffc69a8e6b71a4f57e43abe67b095c0639895801',
        '028f229625405262b55baa85847ba45ea9b8d1d5d3db93e2dd22f31ba7e0cdbc97',
      ],
      sequence: 4294967293,
    },
  ],
  hex: '',
};
export const txUtxos = {
  lockTx: {
    vout: [
      {
        value: 0,
        n: 0,
        scriptPubKey: {
          asm: 'OP_RETURN 00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
          hex: '6a3300000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
          type: 'nulldata',
        },
      },
      {
        value: 3000000000,
        n: 1,
        scriptPubKey: {
          asm: '0 b20272a6591937ba7d687dc889f3637ed40efa6a',
          hex: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
          address: 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h',
          type: 'witness_v0_keyhash',
        },
      },
    ],
  },
  lessBoxes: {
    vout: [
      {
        value: 1325220,
        n: 0,
        scriptPubKey: {
          asm: '0 b20272a6591937ba7d687dc889f3637ed40efa6a',
          hex: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
          address: 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h',
          type: 'witness_v0_keyhash',
        },
      },
    ],
  },
  noOpReturn: {
    vout: [
      {
        value: 1000000,
        n: 0,
        scriptPubKey: {
          asm: '0 90e17f3b1763f70ac2de508981b91c43b3f4c243',
          hex: '001490e17f3b1763f70ac2de508981b91c43b3f4c243',
          address: 'bc1qjrsh7wchv0ms4sk72zycrwgugwelfsjrqyvd8t',
          type: 'witness_v0_keyhash',
        },
      },
      {
        value: 325220,
        n: 1,
        scriptPubKey: {
          asm: '0 b20272a6591937ba7d687dc889f3637ed40efa6a',
          hex: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
          address: 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h',
          type: 'witness_v0_keyhash',
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
          asm: 'OP_RETURN 00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
          hex: '6a3300000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
          type: 'nulldata',
        },
      },
      {
        value: 1325220,
        n: 1,
        scriptPubKey: {
          asm: '0 90e17f3b1763f70ac2de508981b91c43b3f4c243',
          hex: '001490e17f3b1763f70ac2de508981b91c43b3f4c243',
          address: 'bc1qjrsh7wchv0ms4sk72zycrwgugwelfsjrqyvd8t',
          type: 'witness_v0_keyhash',
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
          asm: 'OP_RETURN 09000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
          hex: '6a3309000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
          type: 'nulldata',
        },
      },
      {
        value: 3000000000,
        n: 1,
        scriptPubKey: {
          asm: '0 b20272a6591937ba7d687dc889f3637ed40efa6a',
          hex: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
          address: 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h',
          type: 'witness_v0_keyhash',
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
  bridgeFee: '1968503938',
  networkFee: '9842520',
  fromAddress:
    'box:eff4900465d1603d12c1dc8f231a07ce2196c04196aa26bb80147bb152137aaf.0',
  sourceChainTokenId: 'btc',
  amount: '3000000000',
  targetChainTokenId:
    'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  sourceTxId:
    '6a1b9e7a755afb5d82ecaa5f432d51bd23e452ee1031fc99066e92788a075a84',
};

export const lockUtxo = {
  value: 3000000000,
  n: 1,
  scriptPubKey: {
    asm: '0 90e17f3b1763f70ac2de508981b91c43b3f4c243',
    hex: '001490e17f3b1763f70ac2de508981b91c43b3f4c243',
    address: 'bc1qjrsh7wchv0ms4sk72zycrwgugwelfsjrqyvd8t',
    type: 'witness_v0_keyhash',
  },
};
export const btcTransformation = {
  from: 'btc',
  to: 'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  amount: '3000000000',
};
