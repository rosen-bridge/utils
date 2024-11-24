export const lockAddress = 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN';
export const validDogeAddress = 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN';
export const validDogeOutputScript =
  '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac';

export const baseTx = {
  id: 'ec52cd9ed1ac1dbd6a9185fab6a34488325bec478ecfd26f76405ab1f2cd11d1',
  inputs: [
    {
      txId: 'fe18c9485e2944034e1612c15ffe42d032a5c5634227aca30d949404da5d85b8',
      index: 2,
      scriptPubKey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
    },
  ],
};

export const txUtxos = {
  lockTx: {
    outputs: [
      {
        scriptPubKey:
          '6a33000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        value: 0,
      },
      {
        scriptPubKey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        value: 10000000,
      },
      {
        scriptPubKey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        value: 15584394312,
      },
    ],
  },
  lessBoxes: {
    outputs: [
      {
        scriptPubKey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        value: 15594394312,
      },
    ],
  },
  noOpReturn: {
    outputs: [
      {
        scriptPubKey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        value: 10000000,
      },
      {
        scriptPubKey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        value: 15584394312,
      },
    ],
  },
  noLock: {
    outputs: [
      {
        scriptPubKey:
          '6a33000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        value: 0,
      },
      {
        scriptPubKey: '76a914872b67c8270a9af5c2abf632af3dea989d2e37188ac',
        value: 15594394312,
      },
    ],
  },
  invalidData: {
    outputs: [
      {
        scriptPubKey:
          '6a33090000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        value: 0,
      },
      {
        scriptPubKey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        value: 15594394312,
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
  toAddress: '9iCzESRfvKU6Axyt3BnBuVrYW3ZYj3knPF95STzrjaRrjtTcj9R',
  bridgeFee: '100000000',
  networkFee: '10000000',
  fromAddress:
    'box:fe18c9485e2944034e1612c15ffe42d032a5c5634227aca30d949404da5d85b8.2',
  sourceChainTokenId: 'doge',
  amount: '10000000',
  targetChainTokenId:
    'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  sourceTxId:
    'ec52cd9ed1ac1dbd6a9185fab6a34488325bec478ecfd26f76405ab1f2cd11d1',
};

export const lockUtxo = {
  scriptPubKey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
  value: 10000000n,
};

export const dogeTransformation = {
  from: 'doge',
  to: 'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  amount: '10000000',
};

export const opReturnScripts = {
  valid:
    '6a33000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
  noOpReturn:
    '33000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
  invalidToChain:
    '6a33090000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
};

export const opReturnData = {
  toChain: 'ergo',
  toAddress: '9iCzESRfvKU6Axyt3BnBuVrYW3ZYj3knPF95STzrjaRrjtTcj9R',
  bridgeFee: '100000000',
  networkFee: '10000000',
};
