export const lockAddress =
  'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re';

export const cborKeyHex: Record<string, string> = {
  to: '746f',
  bridgeFee: '627269646765466565',
  networkFee: '6e6574776f726b466565',
  toAddress: '746f41646472657373',
  fromAddress: '66726f6d41646472657373',
  Fake: '46616b65',
};
export const validTokenLockMetadataCbor =
  'a100a562746f646572676f696272696467654665656a313936383530333933386a6e6574776f726b466565673938343235323069746f41646472657373783339685a785633594e536662437153364745736573374468415653617476616f4e746473694e766b696d504747326338667a6b476b66726f6d4164647265737382783f616464725f7465737431767a6730376432717033786a6530773737663938327a6b687165793530676a787273647168383979783872376e617375393768723060';
const validAdaLockMetaDataCbor =
  'a100a562746f646572676f696272696467654665656831303030303030306a6e6574776f726b466565673430303030303069746f41646472657373783339685a785633594e536662437153364745736573374468415653617476616f4e746473694e766b696d504747326338667a6b476b66726f6d4164647265737382783f616464725f7465737431767a6730376432717033786a6530773737663938327a6b687165793530676a787273647168383979783872376e617375393768723060';
const noLockMetaDataCbor =
  'a100a562746f646572676f696272696467654665656a313936383530333933386a6e6574776f726b466565673938343235323069746f416464726573737833396564524b476a707a4b6a634a4b454a45426631665736316461475333457872344b79687866346a4b547272626272774232396b66726f6d4164647265737382784061646472317138686d70357a6a7a7676377337706d67656d7a336d76726b64326e7537363039687767737161306175663668376833723678366a6e327a72743860';

export const blockFrostTransactions = {
  validTokenLock: {
    utxos: {
      hash: '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
      inputs: [
        {
          address:
            'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
          amount: [
            {
              unit: 'lovelace',
              quantity: '183845802',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48546f6b656e2d6c6f656e',
              quantity: '99994361492',
            },
            {
              unit: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a27369676d61',
              quantity: '80999982553144332',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48777252534e2d6c6f656e',
              quantity: '899983957004',
            },
          ],
          tx_hash:
            'e1227af0cd22abecd5c6439bc5d558bfae7643af7d300f2fe95cff723138dc52',
          output_index: 1,
          data_hash: null,
          inline_datum: null,
          reference_script_hash: null,
          collateral: false,
          reference: false,
        },
      ],
      outputs: [
        {
          address:
            'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
          amount: [
            {
              unit: 'lovelace',
              quantity: '1180940',
            },
            {
              unit: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a27369676d61',
              quantity: '3000000000',
            },
          ],
          output_index: 0,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
        },
        {
          address:
            'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
          amount: [
            {
              unit: 'lovelace',
              quantity: '182481761',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48546f6b656e2d6c6f656e',
              quantity: '99994361492',
            },
            {
              unit: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a27369676d61',
              quantity: '80999979553144332',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48777252534e2d6c6f656e',
              quantity: '899983957004',
            },
          ],
          output_index: 1,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
        },
      ],
    },
    metadataCbor: [
      {
        label: '0',
        cbor_metadata: `\\x${validTokenLockMetadataCbor}`,
        metadata: validTokenLockMetadataCbor,
      },
    ],
  },
  validAdaLock: {
    utxos: {
      hash: '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba7',
      inputs: [
        {
          address:
            'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
          amount: [
            {
              unit: 'lovelace',
              quantity: '183845802',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48546f6b656e2d6c6f656e',
              quantity: '99994361492',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb4877724552472d6c6f656e',
              quantity: '80999982553144332',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48777252534e2d6c6f656e',
              quantity: '899983957004',
            },
          ],
          tx_hash:
            'e1227af0cd22abecd5c6439bc5d558bfae7643af7d300f2fe95cff723138dc52',
          output_index: 1,
          data_hash: null,
          inline_datum: null,
          reference_script_hash: null,
          collateral: false,
          reference: false,
        },
      ],
      outputs: [
        {
          address:
            'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
          amount: [
            {
              unit: 'lovelace',
              quantity: '80000000',
            },
          ],
          output_index: 0,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
        },
        {
          address:
            'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
          amount: [
            {
              unit: 'lovelace',
              quantity: '103845802',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48546f6b656e2d6c6f656e',
              quantity: '99994361492',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb4877724552472d6c6f656e',
              quantity: '80999982553144332',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48777252534e2d6c6f656e',
              quantity: '899983957004',
            },
          ],
          output_index: 1,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
        },
      ],
    },
    metadataCbor: [
      {
        label: '0',
        cbor_metadata: `\\x${validAdaLockMetaDataCbor}`,
        metadata: validAdaLockMetaDataCbor,
      },
    ],
  },
  noLock: {
    utxos: {
      hash: '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba8',
      inputs: [
        {
          address:
            'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
          amount: [
            {
              unit: 'lovelace',
              quantity: '183845802',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48546f6b656e2d6c6f656e',
              quantity: '99994361492',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb4877724552472d6c6f656e',
              quantity: '80999982553144332',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48777252534e2d6c6f656e',
              quantity: '899983957004',
            },
          ],
          tx_hash:
            'e1227af0cd22abecd5c6439bc5d558bfae7643af7d300f2fe95cff723138dc52',
          output_index: 1,
          data_hash: null,
          inline_datum: null,
          reference_script_hash: null,
          collateral: false,
          reference: false,
        },
      ],
      outputs: [
        {
          address: 'addr1v9kmp9flrq8gzh287q4kku8vmad3vkrw0rwqvjas6vyrf9s9at4dn',
          amount: [
            {
              unit: 'lovelace',
              quantity: '1180940',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb4877724552472d6c6f656e',
              quantity: '3000000000',
            },
          ],
          output_index: 0,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
        },
        {
          address:
            'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a',
          amount: [
            {
              unit: 'lovelace',
              quantity: '182481761',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48546f6b656e2d6c6f656e',
              quantity: '99994361492',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb4877724552472d6c6f656e',
              quantity: '80999979553144332',
            },
            {
              unit: 'fca58ef8ba9ef1961e132b611de2f8abcd2f34831e615a6f80c5bb48777252534e2d6c6f656e',
              quantity: '899983957004',
            },
          ],
          output_index: 1,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
        },
      ],
    },
    metadataCbor: [
      {
        label: '0',
        cbor_metadata: `\\x${noLockMetaDataCbor}`,
        metadata: noLockMetaDataCbor,
      },
    ],
  },
  noMetadata: {
    utxos: {
      hash: '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba9',
      inputs: [
        {
          address: 'addr1v8djv8h2ws084wc92rwau0u73wtnsw8x3fm6uw292npscwsx2xc98',
          amount: [
            {
              unit: 'lovelace',
              quantity: '608950932',
            },
          ],
          tx_hash:
            '4f868ccfc7abfc70a154e4fbe6e8c671add4852716fbb56bc713305744360f22',
          output_index: 0,
          data_hash: null,
          inline_datum: null,
          reference_script_hash: null,
          collateral: false,
          reference: false,
        },
      ],
      outputs: [
        {
          address: 'addr1v94725lv4umktv89cg2t04qjn4qq3p6l6zegvtx5esu2zuqfd487u',
          amount: [
            {
              unit: 'lovelace',
              quantity: '605950932',
            },
          ],
          output_index: 0,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
        },
        {
          address: 'addr1v94725lv4umktv89cg2t04qjn4qq3p6l6zegvtx5esu2zuqfd487u',
          amount: [
            {
              unit: 'lovelace',
              quantity: '2831500',
            },
          ],
          output_index: 1,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
        },
      ],
    },
    metadataCbor: [],
  },
  noZeroKeyMetadata: {
    utxos: {
      hash: '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7baa',
      inputs: [
        {
          address: 'addr1v8djv8h2ws084wc92rwau0u73wtnsw8x3fm6uw292npscwsx2xc98',
          amount: [
            {
              unit: 'lovelace',
              quantity: '608950932',
            },
          ],
          tx_hash:
            '4f868ccfc7abfc70a154e4fbe6e8c671add4852716fbb56bc713305744360f22',
          output_index: 0,
          data_hash: null,
          inline_datum: null,
          reference_script_hash: null,
          collateral: false,
          reference: false,
        },
      ],
      outputs: [
        {
          address: 'addr1v94725lv4umktv89cg2t04qjn4qq3p6l6zegvtx5esu2zuqfd487u',
          amount: [
            {
              unit: 'lovelace',
              quantity: '605950932',
            },
          ],
          output_index: 0,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
        },
        {
          address: 'addr1v94725lv4umktv89cg2t04qjn4qq3p6l6zegvtx5esu2zuqfd487u',
          amount: [
            {
              unit: 'lovelace',
              quantity: '2831500',
            },
          ],
          output_index: 1,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
        },
      ],
    },
    metadataCbor: [
      {
        label: '674',
        cbor_metadata:
          '\\xA11902A2A1636D736782724D7574616E74204C61627320526166666C6578314275792035207469636B65747320666F7220526166666C6520363436323562383565363664363763653135626162663430',
        metadata:
          'A11902A2A1636D736782724D7574616E74204C61627320526166666C6578314275792035207469636B65747320666F7220526166666C6520363436323562383565363664363763653135626162663430',
      },
    ],
  },
  stringMetadata: {
    utxos: {
      hash: '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7bab',
      inputs: [
        {
          address: 'addr1v8djv8h2ws084wc92rwau0u73wtnsw8x3fm6uw292npscwsx2xc98',
          amount: [
            {
              unit: 'lovelace',
              quantity: '608950932',
            },
          ],
          tx_hash:
            '4f868ccfc7abfc70a154e4fbe6e8c671add4852716fbb56bc713305744360f22',
          output_index: 0,
          data_hash: null,
          inline_datum: null,
          reference_script_hash: null,
          collateral: false,
          reference: false,
        },
      ],
      outputs: [
        {
          address: 'addr1v94725lv4umktv89cg2t04qjn4qq3p6l6zegvtx5esu2zuqfd487u',
          amount: [
            {
              unit: 'lovelace',
              quantity: '605950932',
            },
          ],
          output_index: 0,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
        },
        {
          address: 'addr1v94725lv4umktv89cg2t04qjn4qq3p6l6zegvtx5esu2zuqfd487u',
          amount: [
            {
              unit: 'lovelace',
              quantity: '2831500',
            },
          ],
          output_index: 1,
          data_hash: null,
          inline_datum: null,
          collateral: false,
          reference_script_hash: null,
        },
      ],
    },
    metadataCbor: [
      {
        label: '0',
        cbor_metadata: '\\xA11902A2666D7944617461',
        metadata: 'A11902A2666D7944617461',
      },
    ],
  },
};

export const blockFrostRosenData = {
  validTokenLock: {
    toChain: 'ergo',
    toAddress: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
    bridgeFee: '1968503938',
    networkFee: '9842520',
    fromAddress:
      'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
    sourceChainTokenId:
      'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
    amount: '3000000000',
    targetChainTokenId: 'erg',
    sourceTxId:
      '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
    rawData:
      'a100a562746f646572676f696272696467654665656a313936383530333933386a6e6574776f726b466565673938343235323069746f41646472657373783339685a785633594e536662437153364745736573374468415653617476616f4e746473694e766b696d504747326338667a6b476b66726f6d4164647265737382783f616464725f7465737431767a6730376432717033786a6530773737663938327a6b687165793530676a787273647168383979783872376e617375393768723060',
  },
  validAdaLock: {
    toChain: 'ergo',
    toAddress: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
    bridgeFee: '10000000',
    networkFee: '4000000',
    fromAddress:
      'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
    sourceChainTokenId: 'ada',
    amount: '80000000',
    targetChainTokenId:
      'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
    sourceTxId:
      '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba7',
    rawData:
      'a100a562746f646572676f696272696467654665656831303030303030306a6e6574776f726b466565673430303030303069746f41646472657373783339685a785633594e536662437153364745736573374468415653617476616f4e746473694e766b696d504747326338667a6b476b66726f6d4164647265737382783f616464725f7465737431767a6730376432717033786a6530773737663938327a6b687165793530676a787273647168383979783872376e617375393768723060',
  },
};

export const blockFrostUtxos = {
  tokenLocked: {
    address: 'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
    amount: [
      {
        unit: 'lovelace',
        quantity: '1180940',
      },
      {
        unit: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a27369676d61',
        quantity: '3000000000',
      },
    ],
    output_index: 0,
    data_hash: null,
    inline_datum: null,
    collateral: false,
    reference_script_hash: null,
  },
  adaLocked: {
    address: 'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
    amount: [
      {
        unit: 'lovelace',
        quantity: '80000000',
      },
    ],
    output_index: 0,
    data_hash: null,
    inline_datum: null,
    collateral: false,
    reference_script_hash: null,
  },
  wrongAssetLocked: {
    address: 'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
    amount: [
      {
        unit: 'lovelace',
        quantity: '1180940',
      },
      {
        unit: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2646f6765',
        quantity: '3000000000',
      },
    ],
    output_index: 0,
    data_hash: null,
    inline_datum: null,
    collateral: false,
    reference_script_hash: null,
  },
};

export const blockFrostAssetTransformations = {
  tokenLocked: {
    from: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
    to: 'erg',
    amount: '3000000000',
  },
  adaLocked: {
    from: 'ada',
    to: 'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
    amount: '80000000',
  },
  wrongAssetLocked: {
    from: 'ada',
    to: 'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
    amount: '1180940',
  },
};
