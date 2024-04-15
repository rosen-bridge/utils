export const lockAddress = 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h';

export const baseTx = {
  id: '6a1b9e7a755afb5d82ecaa5f432d51bd23e452ee1031fc99066e92788a075a84',
  inputs: [
    {
      txId: 'eff4900465d1603d12c1dc8f231a07ce2196c04196aa26bb80147bb152137aaf',
      index: 0,
      scriptPubKey: '0014bf1916dc33dbdd65f60d8b1f65eb35e8120835fc',
    },
  ],
};
export const txUtxos = {
  lockTx: {
    outputs: [
      {
        scriptPubKey:
          '6a3300000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
        value: 0,
      },
      {
        scriptPubKey: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
        value: 3000000000,
      },
    ],
  },
  lessBoxes: {
    outputs: [
      {
        scriptPubKey: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
        value: 1325220,
      },
    ],
  },
  noOpReturn: {
    outputs: [
      {
        scriptPubKey: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
        value: 1000000,
      },
      {
        scriptPubKey: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
        value: 325220,
      },
    ],
  },
  noLock: {
    outputs: [
      {
        scriptPubKey:
          '6a3300000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
        value: 0,
      },
      {
        scriptPubKey: '001490e17f3b1763f70ac2de508981b91c43b3f4c243',
        value: 1325220,
      },
    ],
  },
  invalidData: {
    outputs: [
      {
        scriptPubKey:
          '6a3309000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
        value: 0,
      },
      {
        scriptPubKey: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
        value: 3000000000,
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
  fromAddress: 'bc1qhuv3dhpnm0wktasd3v0kt6e4aqfqsd0uhfdu7d',
  sourceChainTokenId: 'btc',
  amount: '3000000000',
  targetChainTokenId:
    'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  sourceTxId:
    '6a1b9e7a755afb5d82ecaa5f432d51bd23e452ee1031fc99066e92788a075a84',
};

export const lockUtxo = {
  scriptPubKey: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
  value: 3000000000n,
};
export const btcTransformation = {
  from: 'btc',
  to: 'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  amount: '3000000000',
};

export const opReturnScripts = {
  valid:
    '6a3300000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
  noOpReturn:
    '3300000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
  invalidToChain:
    '6a3309000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
};
export const opReturnData = {
  toChain: 'ergo',
  toAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  bridgeFee: '1968503938',
  networkFee: '9842520',
};
