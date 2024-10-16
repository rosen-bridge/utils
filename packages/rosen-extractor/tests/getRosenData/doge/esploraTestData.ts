export const lockAddress = 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN';

export const baseTx = {
  txid: 'ec52cd9ed1ac1dbd6a9185fab6a34488325bec478ecfd26f76405ab1f2cd11d1',
  version: 1,
  locktime: 0,
  size: 287,
  weight: 1148,
  fee: 40000000,
  status: {
    confirmed: true,
    block_height: 5422206,
    block_hash:
      '498da4c124b54d461f7d965c08d42adf1e98f4ffc148ff17a370f4f69bf6b1ca',
    block_time: 1729109310,
  },
  vin: [
    {
      txid: 'fe18c9485e2944034e1612c15ffe42d032a5c5634227aca30d949404da5d85b8',
      vout: 2,
      prevout: {
        scriptpubkey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        scriptpubkey_asm:
          'OP_DUP OP_HASH160 OP_PUSHBYTES_20 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
        scriptpubkey_type: 'p2pkh',
        scriptpubkey_address: 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN',
        value: 15634394312,
      },
      scriptsig:
        '47304402206b59bf5fa8f65d9c2e7bc4fb4495ec8982d16b563bd944f6cd8396e978ac15bf02203b38b790cc2d0afc5271c3c0dc4941e6021a8625b9cbb3bba4b285da2a9fe32d0121022b9ed0a9139042921decc62603a4a07357b444da2e0bd6a96c27155117913037',
      scriptsig_asm:
        'OP_PUSHBYTES_71 304402206b59bf5fa8f65d9c2e7bc4fb4495ec8982d16b563bd944f6cd8396e978ac15bf02203b38b790cc2d0afc5271c3c0dc4941e6021a8625b9cbb3bba4b285da2a9fe32d01 OP_PUSHBYTES_33 022b9ed0a9139042921decc62603a4a07357b444da2e0bd6a96c27155117913037',
      is_coinbase: false,
      sequence: 4294967295,
    },
  ],
};

export const txUtxos = {
  lockTx: {
    vout: [
      {
        scriptpubkey:
          '6a33000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        scriptpubkey_asm:
          'OP_RETURN OP_PUSHBYTES_51 000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        scriptpubkey_type: 'op_return',
        value: 0,
      },
      {
        scriptpubkey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        scriptpubkey_asm:
          'OP_DUP OP_HASH160 OP_PUSHBYTES_20 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
        scriptpubkey_type: 'p2pkh',
        scriptpubkey_address: 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN',
        value: 10000000,
      },
      {
        scriptpubkey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        scriptpubkey_asm:
          'OP_DUP OP_HASH160 OP_PUSHBYTES_20 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
        scriptpubkey_type: 'p2pkh',
        scriptpubkey_address: 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN',
        value: 15584394312,
      },
    ],
  },
  lessBoxes: {
    vout: [
      {
        scriptpubkey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        scriptpubkey_asm:
          'OP_DUP OP_HASH160 OP_PUSHBYTES_20 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
        scriptpubkey_type: 'p2pkh',
        scriptpubkey_address: 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN',
        value: 15594394312,
      },
    ],
  },
  noOpReturn: {
    vout: [
      {
        scriptpubkey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        scriptpubkey_asm:
          'OP_DUP OP_HASH160 OP_PUSHBYTES_20 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
        scriptpubkey_type: 'p2pkh',
        scriptpubkey_address: 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN',
        value: 10000000,
      },
      {
        scriptpubkey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        scriptpubkey_asm:
          'OP_DUP OP_HASH160 OP_PUSHBYTES_20 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
        scriptpubkey_type: 'p2pkh',
        scriptpubkey_address: 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN',
        value: 15584394312,
      },
    ],
  },
  noLock: {
    vout: [
      {
        scriptpubkey:
          '6a33000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        scriptpubkey_asm:
          'OP_RETURN OP_PUSHBYTES_51 000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        scriptpubkey_type: 'op_return',
        value: 0,
      },
      {
        scriptpubkey: '76a914872b67c8270a9af5c2abf632af3dea989d2e37188ac',
        scriptpubkey_asm:
          'OP_DUP OP_HASH160 OP_PUSHBYTES_20 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
        scriptpubkey_type: 'p2pkh',
        scriptpubkey_address: 'DHTom1rFwsgAn5rKU1k8E5MdQ4GBkAN',
        value: 15594394312,
      },
    ],
  },
  invalidData: {
    vout: [
      {
        scriptpubkey:
          '6a33090000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        scriptpubkey_asm:
          'OP_RETURN OP_PUSHBYTES_51 090000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        scriptpubkey_type: 'op_return',
        value: 0,
      },
      {
        scriptpubkey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        scriptpubkey_asm:
          'OP_DUP OP_HASH160 OP_PUSHBYTES_20 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
        scriptpubkey_type: 'p2pkh',
        scriptpubkey_address: 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN',
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
  scriptpubkey: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
  scriptpubkey_asm:
    'OP_DUP OP_HASH160 OP_PUSHBYTES_20 872b67c8270a9eaf5c2abf632af3dea989d2e371 OP_EQUALVERIFY OP_CHECKSIG',
  scriptpubkey_type: 'p2pkh',
  scriptpubkey_address: 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN',
  value: 10000000,
};

export const dogeTransformation = {
  from: 'doge',
  to: 'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  amount: '10000000',
};
