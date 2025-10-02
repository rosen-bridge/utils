export const lockAddress = 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN';

const baseTx = {
  txid: 'ec52cd9ed1ac1dbd6a9185fab6a34488325bec478ecfd26f76405ab1f2cd11d1',
  hash: 'ec52cd9ed1ac1dbd6a9185fab6a34488325bec478ecfd26f76405ab1f2cd11d1',
  version: 1,
  size: 225,
  vsize: 225,
  locktime: 0,
  vin: [
    {
      txid: 'fe18c9485e2944034e1612c15ffe42d032a5c5634227aca30d949404da5d85b8',
      vout: 2,
      scriptSig: {
        asm: '304402204ae5924544c57a17ccca9ea46ef7b9e3fda4ed7dae6e0eb5e5c777e5757e2cc002203cc29a67f7c448c7ec99c61077054ee5ee8c9e3e4a7f974c79c0a4f112f615d401',
        hex: '47304402204ae5924544c57a17ccca9ea46ef7b9e3fda4ed7dae6e0eb5e5c777e5757e2cc002203cc29a67f7c448c7ec99c61077054ee5ee8c9e3e4a7f974c79c0a4f112f615d401',
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
          asm: 'OP_RETURN 000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
          hex: '6a33000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
          type: 'nulldata',
        },
      },
      {
        value: 0.1,
        n: 1,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
          type: 'pubkeyhash',
          addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
        },
      },
      {
        value: 155.84394312,
        n: 2,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
          type: 'pubkeyhash',
          addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
        },
      },
    ],
  },
  lessBoxes: {
    vout: [
      {
        value: 155.94394312,
        n: 0,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
          type: 'pubkeyhash',
          addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
        },
      },
    ],
  },
  noOpReturn: {
    vout: [
      {
        value: 0.1,
        n: 0,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
          type: 'pubkeyhash',
          addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
        },
      },
      {
        value: 155.84394312,
        n: 1,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
          type: 'pubkeyhash',
          addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
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
          asm: 'OP_RETURN 000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
          hex: '6a33000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
          type: 'nulldata',
        },
      },
      {
        value: 155.94394312,
        n: 1,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 872b67c8270a9af5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914872b67c8270a9af5c2abf632af3dea989d2e37188ac',
          type: 'pubkeyhash',
          addresses: ['DHTom1rFwsgAn5rKU1k8E5MdQ4GBkAN'],
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
          asm: 'OP_RETURN 090000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
          hex: '6a33090000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
          type: 'nulldata',
        },
      },
      {
        value: 155.94394312,
        n: 1,
        scriptPubKey: {
          asm: 'OP_DUP OP_HASH160 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
          hex: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
          type: 'pubkeyhash',
          addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
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
  rawData:
    '000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
};

export const lockUtxo = {
  n: 1,
  scriptPubKey: {
    asm: 'OP_DUP OP_HASH160 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
    hex: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
    address: 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN',
    type: 'pubkeyhash',
  },
  value: 0.1,
};

export const dogeTransformation = {
  from: 'doge',
  to: 'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  amount: '10000000',
};
