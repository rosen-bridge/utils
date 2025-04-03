export const lockAddress = 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN';
export const lockAddressPublicKey =
  '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac';

const baseTx = {
  hash: 'd3d2b2dc24639e8d698071a49921b7b378c0a56cffcc0db3b42d5937a67389ab',
  ver: 2,
  vin_sz: 1,
  vout_sz: 3,
  size: 285,
  weight: 1140,
  fee: 40000000,
  relayed_by: '5.9.7.62:22155',
  lock_time: 0,
  txid: 'd3d2b2dc24639e8d698071a49921b7b378c0a56cffcc0db3b42d5937a67389ab',
  confidence: 1,
  confirmed: '2024-10-18T21:44:13Z',
  received: '2024-10-18T21:43:50.202Z',
  double_spend: false,
  block_height: 5425056,
  block_hash:
    '5b1c666ef6ba36cda85e7d1ced54d43e1dfd30b31a9f071279b70a470a08ae2c',
  confirmations: 225627,
  hex: '0200000001349ef262b9716ba26f5ddf04f9917e3149e16304a8b8b99de6b1e338dee29785020000006a47304402207e4cd2745243257f0749b4a41425c2075dfb199f47072bfbf7db14b02677a8ae02204682c5159737314f7c4ba0f7112876497171a7cee48dddf667dccd59cf8ae1280121022b9ed0a9139042921decc62603a4a07357b444da2e0bd6a96c27155117913037ffffffff030000000000000000356a33000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff3600ca9a3b0000000017a914d4c141068ab3a242aed5081a27ac3f10ad99ac9887c8e7ee5f030000001976a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac00000000',
  inputs: [
    {
      prev_hash:
        '8597e2de38e3b1e69db9b8a80463e149317e91f904df5d6fa26b71b962f29e34',
      output_index: 2,
      script:
        '47304402207e4cd2745243257f0749b4a41425c2075dfb199f47072bfbf7db14b02677a8ae02204682c5159737314f7c4ba0f7112876497171a7cee48dddf667dccd59cf8ae1280121022b9ed0a9139042921decc62603a4a07357b444da2e0bd6a96c27155117913037',
      output_value: 15534394312,
      sequence: 4294967295,
      addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
      script_type: 'pay-to-pubkey-hash',
    },
  ],
};

export const txUtxos = {
  lockTx: {
    outputs: [
      {
        value: 0,
        script:
          '6a33000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        addresses: null,
        script_type: 'null-data',
        data_hex:
          '000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
      },
      {
        value: 1000000000,
        script: 'a914d4c141068ab3a242aed5081a27ac3f10ad99ac9887',
        spent_by:
          '79e657a92547e0a67ad4b0f04777ddb617745e6064b1d9393583619da59ae4c6',
        addresses: ['ABqDRagXMAqcwxeqnvSZKGKBAqjFBiFcU4'],
        script_type: 'pay-to-script-hash',
      },
      {
        value: 14494394312,
        script: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        spent_by:
          '3e043a1cc680e0878c381a7d95321bf30fcbd0476e75f7f7df6038b67cd4e2d6',
        addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
        script_type: 'pay-to-pubkey-hash',
      },
    ],
  },
  lessBoxes: {
    outputs: [
      {
        value: 15594394312,
        script: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
        script_type: 'pay-to-pubkey-hash',
      },
    ],
  },
  noOpReturn: {
    outputs: [
      {
        value: 1000000000,
        script: 'a914d4c141068ab3a242aed5081a27ac3f10ad99ac9887',
        addresses: ['ABqDRagXMAqcwxeqnvSZKGKBAqjFBiFcU4'],
        script_type: 'pay-to-script-hash',
      },
      {
        value: 14494394312,
        script: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
        script_type: 'pay-to-pubkey-hash',
      },
    ],
  },
  noLock: {
    outputs: [
      {
        value: 0,
        script:
          '6a33000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        addresses: null,
        script_type: 'null-data',
      },
      {
        value: 15594394312,
        script: '76a914872b67c8270a9eaf5c2ab632af3dea989d2e37188ac',
        addresses: ['DHTom1rFwsgAn5rKU1k8E5MdQ4GBkAN'],
        script_type: 'pay-to-pubkey-hash',
      },
    ],
  },
  invalidData: {
    outputs: [
      {
        value: 0,
        script:
          '6a33090000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
        addresses: null,
        script_type: 'null-data',
      },
      {
        value: 15594394312,
        script: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
        addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
        script_type: 'pay-to-pubkey-hash',
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
    'box:8597e2de38e3b1e69db9b8a80463e149317e91f904df5d6fa26b71b962f29e34.2',
  sourceChainTokenId: 'doge',
  amount: '14494394312',
  targetChainTokenId:
    'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  sourceTxId:
    'd3d2b2dc24639e8d698071a49921b7b378c0a56cffcc0db3b42d5937a67389ab',
};

export const lockUtxo = {
  value: 1000000000,
  script: '76a914872b67c8270a9eaf5c2abf632af3dea989d2e37188ac',
  addresses: ['DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN'],
  script_type: 'pay-to-pubkey-hash',
};

export const dogeTransformation = {
  from: 'doge',
  to: 'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  amount: '1000000000',
};
