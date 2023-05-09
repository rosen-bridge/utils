export default class CardanoTestData {
  static lockAddress =
    'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re';

  static koiosTransactions = {
    validTokenLock: {
      block_hash:
        '2e930d689e38e9ecd3e000c432dcb2521aff4b5c00cabd6422fd738058e419c7',
      metadata: {
        '0': JSON.parse(
          '{' +
            '"to": "ergo",' +
            '"bridgeFee": "10000",' +
            '"networkFee": "10000",' +
            '"toAddress": "ergoAddress",' +
            ' "fromAddress": ["' +
            'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0' +
            '"] }'
        ),
      },
      tx_hash:
        '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
      inputs: [
        {
          payment_addr: {
            bech32:
              'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
            cred: '90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6',
          },
          stake_addr: null,
          tx_hash:
            'cf32ad374daefdce563e3391effc4fc42eb0e74bbec8afe16a46eeea69e3b2aa',
          tx_index: 1,
          value: '979445417',
          asset_list: [
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '646f6765',
              quantity: '10000000',
            },
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '7369676d61',
              quantity: '9999978',
            },
          ],
        },
      ],
      outputs: [
        {
          payment_addr: {
            bech32:
              'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
            cred: 'b3e2001f41f12f92e2f484c821e98a6e60f39adc7ff30fb248819c21',
          },
          tx_hash:
            '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
          stake_addr: null,
          tx_index: 0,
          value: '10000000',
          asset_list: [
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '7369676d61',
              quantity: '10',
            },
          ],
        },
        {
          payment_addr: {
            bech32:
              'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
            cred: '90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6',
          },
          tx_hash:
            '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
          stake_addr: null,
          tx_index: 1,
          value: '969261084',
          asset_list: [
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '646f6765',
              quantity: '10000000',
            },
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '7369676d61',
              quantity: '9999968',
            },
          ],
        },
      ],
    },
    validAdaLock: {
      block_hash:
        '7c914e850837df2246dbac00c5b4ffa1252bcd234c000e3dce9e83e986d039e2',
      metadata: {
        '0': JSON.parse(
          '{' +
            '"to": "ergo",' +
            '"bridgeFee": "10000",' +
            '"networkFee": "10000",' +
            '"toAddress": "ergoAddress",' +
            ' "fromAddress": ["' +
            'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0' +
            '"] }'
        ),
      },
      tx_hash:
        '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba7',
      inputs: [
        {
          payment_addr: {
            bech32:
              'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
            cred: '90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6',
          },
          stake_addr: null,
          tx_hash:
            'cf32ad374daefdce563e3391effc4fc42eb0e74bbec8afe16a46eeea69e3b2aa',
          tx_index: 1,
          value: '979445417',
          asset_list: [],
        },
      ],
      outputs: [
        {
          payment_addr: {
            bech32:
              'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
            cred: 'b3e2001f41f12f92e2f484c821e98a6e60f39adc7ff30fb248819c21',
          },
          tx_hash:
            '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba7',
          stake_addr: null,
          tx_index: 0,
          value: '1000000000',
          asset_list: [],
        },
        {
          payment_addr: {
            bech32:
              'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
            cred: '90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6',
          },
          tx_hash:
            '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba7',
          stake_addr: null,
          tx_index: 1,
          value: '969261084',
          asset_list: [],
        },
      ],
    },
    noLock: {
      block_hash:
        '432dcb2521af2e9308e9ecd3e000cf4b5c00cabd6422fd7380d689e358e419c7',
      metadata: {
        '0': JSON.parse(
          '{' +
            '"to": "ergo",' +
            '"bridgeFee": "10000",' +
            '"networkFee": "10000",' +
            '"toAddress": "ergoAddress",' +
            ' "fromAddress": ["' +
            'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0' +
            '"] }'
        ),
      },
      tx_hash:
        '5c3b410a9f00d30f2bd035cd9a927c4fd8ef80af7ba6e419c79b72e930d68121',
      inputs: [
        {
          payment_addr: {
            bech32:
              'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
            cred: '90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6',
          },
          stake_addr: null,
          tx_hash:
            '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
          tx_index: 1,
          value: '979445417',
          asset_list: [
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '646f6765',
              quantity: '10000000',
            },
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '7369676d61',
              quantity: '9999978',
            },
          ],
        },
      ],
      outputs: [
        {
          payment_addr: {
            bech32:
              'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
            cred: 'b3e2001f41f12f92e2f484c821e98a6e60f39adc7ff30fb248819c21',
          },
          tx_hash:
            '5c3b410a9f00d30f2bd035cd9a927c4fd8ef80af7ba6e419c79b72e930d68121',
          stake_addr: null,
          tx_index: 0,
          value: '10000000',
          asset_list: [
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '7369676d61',
              quantity: '10',
            },
          ],
        },
        {
          payment_addr: {
            bech32:
              'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
            cred: '90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6',
          },
          tx_hash:
            '5c3b410a9f00d30f2bd035cd9a927c4fd8ef80af7ba6e419c79b72e930d68121',
          stake_addr: null,
          tx_index: 1,
          value: '969261084',
          asset_list: [
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '646f6765',
              quantity: '10000000',
            },
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '7369676d61',
              quantity: '9999968',
            },
          ],
        },
      ],
    },
    noMetadata: {
      block_hash:
        '2e930d689e38e9ecd3e000c432dcb2521aff4b5c00cabd6422fd738058e419c7',
      tx_hash:
        '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
      inputs: [
        {
          payment_addr: {
            bech32:
              'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
            cred: '90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6',
          },
          stake_addr: null,
          tx_hash:
            'cf32ad374daefdce563e3391effc4fc42eb0e74bbec8afe16a46eeea69e3b2aa',
          tx_index: 1,
          value: '979445417',
          asset_list: [
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '646f6765',
              quantity: '10000000',
            },
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '7369676d61',
              quantity: '9999978',
            },
          ],
        },
      ],
      outputs: [
        {
          payment_addr: {
            bech32:
              'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
            cred: 'b3e2001f41f12f92e2f484c821e98a6e60f39adc7ff30fb248819c21',
          },
          tx_hash:
            '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
          stake_addr: null,
          tx_index: 0,
          value: '10000000',
          asset_list: [
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '7369676d61',
              quantity: '10',
            },
          ],
        },
        {
          payment_addr: {
            bech32:
              'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
            cred: '90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6',
          },
          tx_hash:
            '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
          stake_addr: null,
          tx_index: 1,
          value: '969261084',
          asset_list: [
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '646f6765',
              quantity: '10000000',
            },
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '7369676d61',
              quantity: '9999968',
            },
          ],
        },
      ],
    },
    noZeroKeyMetadata: {
      block_hash:
        '2e930d689e38e9ecd3e000c432dcb2521aff4b5c00cabd6422fd738058e419c7',
      metadata: {
        '1': JSON.parse(
          '{' +
            '"to": "ergo",' +
            '"bridgeFee": "10000",' +
            '"networkFee": "10000",' +
            '"toAddress": "ergoAddress",' +
            ' "fromAddress": ["' +
            'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0' +
            '"] }'
        ),
      },
      tx_hash:
        '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
      inputs: [
        {
          payment_addr: {
            bech32:
              'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
            cred: '90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6',
          },
          stake_addr: null,
          tx_hash:
            'cf32ad374daefdce563e3391effc4fc42eb0e74bbec8afe16a46eeea69e3b2aa',
          tx_index: 1,
          value: '979445417',
          asset_list: [
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '646f6765',
              quantity: '10000000',
            },
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '7369676d61',
              quantity: '9999978',
            },
          ],
        },
      ],
      outputs: [
        {
          payment_addr: {
            bech32:
              'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
            cred: 'b3e2001f41f12f92e2f484c821e98a6e60f39adc7ff30fb248819c21',
          },
          tx_hash:
            '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
          stake_addr: null,
          tx_index: 0,
          value: '10000000',
          asset_list: [
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '7369676d61',
              quantity: '10',
            },
          ],
        },
        {
          payment_addr: {
            bech32:
              'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
            cred: '90ff35400c4d2cbddef24a750ad7064947a2461c1a0b9ca431c7e9f6',
          },
          tx_hash:
            '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
          stake_addr: null,
          tx_index: 1,
          value: '969261084',
          asset_list: [
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '646f6765',
              quantity: '10000000',
            },
            {
              policy_id:
                'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
              asset_name: '7369676d61',
              quantity: '9999968',
            },
          ],
        },
      ],
    },
  };

  static koiosRosenData = {
    validTokenLock: {
      toChain: 'ergo',
      toAddress: 'ergoAddress',
      bridgeFee: '10000',
      networkFee: '10000',
      fromAddress:
        'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
      sourceChainTokenId:
        'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
      amount: '10',
      targetChainTokenId: 'erg',
      sourceTxId:
        '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
    },
    validAdaLock: {
      toChain: 'ergo',
      toAddress: 'ergoAddress',
      bridgeFee: '10000',
      networkFee: '10000',
      fromAddress:
        'addr_test1vzg07d2qp3xje0w77f982zkhqey50gjxrsdqh89yx8r7nasu97hr0',
      sourceChainTokenId: 'lovelace',
      amount: '1000000000',
      targetChainTokenId:
        'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      sourceTxId:
        '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba7',
    },
  };

  static koiosUtxos = {
    tokenLocked: {
      payment_addr: {
        bech32:
          'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
        cred: 'b3e2001f41f12f92e2f484c821e98a6e60f39adc7ff30fb248819c21',
      },
      tx_hash:
        '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
      stake_addr: null,
      tx_index: 0,
      value: '10000000',
      asset_list: [
        {
          policy_id: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          asset_name: '7369676d61',
          quantity: '10',
        },
      ],
    },
    adaLocked: {
      payment_addr: {
        bech32:
          'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
        cred: 'b3e2001f41f12f92e2f484c821e98a6e60f39adc7ff30fb248819c21',
      },
      tx_hash:
        '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba7',
      stake_addr: null,
      tx_index: 0,
      value: '1000000000',
      asset_list: [],
    },
    secondAssetLocked: {
      payment_addr: {
        bech32:
          'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
        cred: 'b3e2001f41f12f92e2f484c821e98a6e60f39adc7ff30fb248819c21',
      },
      tx_hash:
        '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
      stake_addr: null,
      tx_index: 0,
      value: '10000000',
      asset_list: [
        {
          policy_id: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          asset_name: '646f6765',
          quantity: '10',
        },
        {
          policy_id: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          asset_name: '7369676d61',
          quantity: '10',
        },
      ],
    },
    wrongAssetLocked: {
      payment_addr: {
        bech32:
          'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
        cred: 'b3e2001f41f12f92e2f484c821e98a6e60f39adc7ff30fb248819c21',
      },
      tx_hash:
        '9f00d372e930d685c3b410a10f2bd035cd9a927c4fd8ef8e419c79b210af7ba6',
      stake_addr: null,
      tx_index: 0,
      value: '10000000',
      asset_list: [
        {
          policy_id: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          asset_name: '646f6765',
          quantity: '10',
        },
      ],
    },
  };

  static koiosAssetTransformations = {
    tokenLocked: {
      from: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
      to: 'erg',
      amount: '10',
    },
    adaLocked: {
      from: 'lovelace',
      to: 'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      amount: '1000000000',
    },
    wrongAssetLocked: {
      from: 'lovelace',
      to: 'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      amount: '10000000',
    },
  };

  static ogmiosAuxiliaryData = {
    validEvent: {
      hash: '1c278913fc51ccef7681929feb60be65b383b741c5ea698bb5f5332c98bd163d',
      body: {
        blob: {
          '0': {
            map: [
              {
                k: {
                  string: 'to',
                },
                v: {
                  string: 'ergo',
                },
              },
              {
                k: {
                  string: 'bridgeFee',
                },
                v: {
                  string: '3000',
                },
              },
              {
                k: {
                  string: 'networkFee',
                },
                v: {
                  string: '300',
                },
              },
              {
                k: {
                  string: 'toAddress',
                },
                v: {
                  string: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
                },
              },
              {
                k: {
                  string: 'fromAddress',
                },
                v: {
                  list: [
                    {
                      string:
                        '7bb715ce7d410747beb98cb6fb322a5865894018433eb115d67625c5befb6f61',
                    },
                  ],
                },
              },
            ],
          },
        },
        scripts: [],
      },
    },
    noBlob: {
      hash: '1c278913fc51ccef7681929feb60be65b383b741c5ea698bb5f5332c98bd163d',
      body: {
        scripts: [],
      },
    },
    noBlobZeroKey: {
      hash: '1c278913fc51ccef7681929feb60be65b383b741c5ea698bb5f5332c98bd163d',
      body: {
        blob: {
          '1': {
            map: [
              {
                k: {
                  string: 'to',
                },
                v: {
                  string: 'ergo',
                },
              },
              {
                k: {
                  string: 'bridgeFee',
                },
                v: {
                  string: '3000',
                },
              },
              {
                k: {
                  string: 'networkFee',
                },
                v: {
                  string: '300',
                },
              },
              {
                k: {
                  string: 'toAddress',
                },
                v: {
                  string: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
                },
              },
              {
                k: {
                  string: 'fromAddress',
                },
                v: {
                  list: [
                    {
                      string:
                        '7bb715ce7d410747beb98cb6fb322a5865894018433eb115d67625c5befb6f61',
                    },
                  ],
                },
              },
            ],
          },
        },
        scripts: [],
      },
    },
    invalidType: {
      hash: '1c278913fc51ccef7681929feb60be65b383b741c5ea698bb5f5332c98bd163d',
      body: {
        blob: {
          '0': {
            map: [
              {
                k: {
                  string: 'to',
                },
                v: {
                  string: 'ergo',
                },
              },
              {
                k: {
                  string: 'bridgeFee',
                },
                v: {
                  string: '3000',
                },
              },
              {
                k: {
                  string: 'networkFee',
                },
                v: {
                  string: '300',
                },
              },
              {
                k: {
                  string: 'toAddress',
                },
                v: {
                  string: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
                },
              },
              {
                k: {
                  string: 'fromAddress',
                },
                v: {
                  string:
                    '7bb715ce7d410747beb98cb6fb322a5865894018433eb115d67625c5befb6f61',
                },
              },
            ],
          },
        },
        scripts: [],
      },
    },
    noJson: {
      hash: '484b3aae1d0a97347e0bc4e3626d96c2e27a507d17bb985e7d8e76415bf73fdf',
      body: {
        blob: {
          '0': {
            string:
              'd8799f581ca69d04d52bdc725a9e040a47802ad493799ac3614b3fc2ffeea055',
          },
          '1': {
            string:
              '499fd8799fd8799fd8799f581c01a241dad562d18c859814d3df8564453c1404',
          },
        },
        scripts: [],
      },
    },
  };

  static ogmiosBaseTransactionBody = {
    inputs: [
      {
        txId: '3acfccbb95bafc40ad56b30607635eb4077f21ac97948de38bddeedd3c8703b0',
        index: 0,
      },
    ],
    collaterals: [],
    references: [],
    collateralReturn: null,
    totalCollateral: null,
    certificates: [],
    withdrawals: {},
    fee: BigInt(273377),
    validityInterval: {
      invalidBefore: null,
      invalidHereafter: null,
    },
    update: null,
    mint: {
      coins: BigInt(0),
      assets: {},
    },
    network: null,
    scriptIntegrityHash: null,
    requiredExtraSignatures: [],
  };

  static ogmiosTransactionBodies = {
    tokenLock: {
      ...this.ogmiosBaseTransactionBody,
      outputs: [
        {
          address:
            'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
          value: {
            coins: BigInt(1344798),
            assets: {
              'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61':
                BigInt(10000),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(1344798),
            assets: {
              '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
                BigInt(90000),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(7037027),
            assets: {},
          },
          datumHash: null,
          datum: null,
          script: null,
        },
      ],
    },
    adaLock: {
      ...this.ogmiosBaseTransactionBody,
      outputs: [
        {
          address:
            'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
          value: {
            coins: BigInt(20000000),
            assets: {},
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(1344798),
            assets: {
              '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
                BigInt(90000),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(7037027),
            assets: {},
          },
          datumHash: null,
          datum: null,
          script: null,
        },
      ],
    },
    noLock: {
      ...this.ogmiosBaseTransactionBody,
      outputs: [
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(20000000),
            assets: {},
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(1344798),
            assets: {
              '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
                BigInt(90000),
            },
          },
          datumHash: null,
          datum: null,
          script: null,
        },
        {
          address:
            'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
          value: {
            coins: BigInt(7037027),
            assets: {},
          },
          datumHash: null,
          datum: null,
          script: null,
        },
      ],
    },
  };

  static ogmiosBaseTransaction = {
    witness: {
      signatures: {
        b32aa9008c013f71477787c47ef82dfe170eed2b5a1632ead59018df2b5bb0dc:
          'Qjnccpi1hDCsNl83/hXI05XhMDe5l+13sv0EhedscQ/h9YZV5rOnSSapZqhSCth7GBAjBPYOpcshCcetPOvWDw==',
      },
      scripts: {},
      datums: {},
      redeemers: {},
      bootstrap: [],
    },
    raw: 'hKQAgYJYIDrPzLuVuvxArVazBgdjXrQHfyGsl5SN44vd7t08hwOwAAGDglgdYcweLWYIZGKlVKTAgTzMLgHAbrNudt1QomirMU+CGgAUhR6hWByOPhkTH5bBhjNbI795g6sAhnqYfKkAq7J64PK5oURSU1RXGScQglg5AQaBhu2BPfX1Q+5UHh7hptykzCzh4Ze8Zu6ELeKwvVBE2bcLkgP+d6fLTWoteWcYFwPi54KR3d4YghoAFIUeoVgcjj4ZEx+WwYYzWyO/eYOrAIZ6mHypAKuyeuDyuaFEUlNUVxoAAV+Qglg5AQaBhu2BPfX1Q+5UHh7hptykzCzh4Ze8Zu6ELeKwvVBE2bcLkgP+d6fLTWoteWcYFwPi54KR3d4YGgBrYGMCGgAEK+EHWCAcJ4kT/FHM73aBkp/rYL5ls4O3QcXqaYu19TMsmL0WPaEAgYJYILMqqQCMAT9xR3eHxH74Lf4XDu0rWhYy6tWQGN8rW7DcWEBCOdxymLWEMKw2Xzf+FcjTleEwN7mX7Xey/QSF52xxD+H1hlXms6dJJqlmqFIK2HsYECME9g6lyyEJx60869YP9aEApWJ0b2RlcmdvaWJyaWRnZUZlZWQzMDAwam5ldHdvcmtGZWVjMzAwaXRvQWRkcmVzc3gzOWhaeFYzWU5TZmJDcVM2R0VzZXM3RGhBVlNhdHZhb050ZHNpTnZraW1QR0cyYzhmemtHb2Zyb21BZGRyZXNzSGFzaHhAN2JiNzE1Y2U3ZDQxMDc0N2JlYjk4Y2I2ZmIzMjJhNTg2NTg5NDAxODQzM2ViMTE1ZDY3NjI1YzViZWZiNmY2MQ==',
    id: '55ec4f12b1a8656e07bc5e4281af3c12bf7b63bf39811eb5762a2f522be2600f',
    inputSource: 'inputs',
  };

  static ogmiosTransactions = {
    validTokenLock: {
      ...this.ogmiosBaseTransaction,
      body: this.ogmiosTransactionBodies.tokenLock,
      metadata: this.ogmiosAuxiliaryData.validEvent,
    },
    validAdaLock: {
      ...this.ogmiosBaseTransaction,
      body: this.ogmiosTransactionBodies.adaLock,
      metadata: this.ogmiosAuxiliaryData.validEvent,
    },
    noLock: {
      ...this.ogmiosBaseTransaction,
      body: this.ogmiosTransactionBodies.noLock,
      metadata: this.ogmiosAuxiliaryData.validEvent,
    },
    noBlobMetadata: {
      ...this.ogmiosBaseTransaction,
      body: this.ogmiosTransactionBodies.tokenLock,
      metadata: this.ogmiosAuxiliaryData.noBlob,
    },
    noBlobZeroKeyMetadata: {
      ...this.ogmiosBaseTransaction,
      body: this.ogmiosTransactionBodies.tokenLock,
      metadata: this.ogmiosAuxiliaryData.noBlobZeroKey,
    },
    invalidTypeMetadata: {
      ...this.ogmiosBaseTransaction,
      body: this.ogmiosTransactionBodies.tokenLock,
      metadata: this.ogmiosAuxiliaryData.invalidType,
    },
    noJsonMetadata: {
      ...this.ogmiosBaseTransaction,
      body: this.ogmiosTransactionBodies.tokenLock,
      metadata: this.ogmiosAuxiliaryData.noJson,
    },
    noMetadata: {
      ...this.ogmiosBaseTransaction,
      body: this.ogmiosTransactionBodies.tokenLock,
    },
  };

  static ogmiosRosenData = {
    validTokenLock: {
      toChain: 'ergo',
      toAddress: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
      bridgeFee: '3000',
      networkFee: '300',
      fromAddress:
        '7bb715ce7d410747beb98cb6fb322a5865894018433eb115d67625c5befb6f61',
      sourceChainTokenId:
        'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
      amount: '10000',
      targetChainTokenId: 'erg',
      sourceTxId:
        '55ec4f12b1a8656e07bc5e4281af3c12bf7b63bf39811eb5762a2f522be2600f',
    },
    validAdaLock: {
      toChain: 'ergo',
      toAddress: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
      bridgeFee: '3000',
      networkFee: '300',
      fromAddress:
        '7bb715ce7d410747beb98cb6fb322a5865894018433eb115d67625c5befb6f61',
      sourceChainTokenId: 'lovelace',
      amount: '20000000',
      targetChainTokenId:
        'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      sourceTxId:
        '55ec4f12b1a8656e07bc5e4281af3c12bf7b63bf39811eb5762a2f522be2600f',
    },
  };

  static ogmiosTxOuts = {
    tokenLocked: {
      address:
        'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
      value: {
        coins: BigInt(1344798),
        assets: {
          'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61':
            BigInt(10000),
        },
      },
      datumHash: null,
      datum: null,
      script: null,
    },
    adaLocked: {
      address:
        'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
      value: {
        coins: BigInt(20000000),
        assets: {},
      },
      datumHash: null,
      datum: null,
      script: null,
    },
    secondAssetLocked: {
      address:
        'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
      value: {
        coins: BigInt(1344798),
        assets: {
          '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
            BigInt(10000),
          'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61':
            BigInt(10000),
        },
      },
      datumHash: null,
      datum: null,
      script: null,
    },
    wrongAssetLocked: {
      address:
        'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
      value: {
        coins: BigInt(10000000),
        assets: {
          '8e3e19131f96c186335b23bf7983ab00867a987ca900abb27ae0f2b9.52535457':
            BigInt(10000),
        },
      },
      datumHash: null,
      datum: null,
      script: null,
    },
  };

  static ogmiosAssetTransformations = {
    tokenLocked: {
      from: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
      to: 'erg',
      amount: '10000',
    },
    adaLocked: {
      from: 'lovelace',
      to: 'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      amount: '20000000',
    },
    wrongAssetLocked: {
      from: 'lovelace',
      to: 'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      amount: '10000000',
    },
  };

  static rosenTransactions = {
    validTokenLock: {
      id: 'c5afb967619ee64e0d724a56d27670fee6fe698df1375692d9868cb9792467c8',
      inputs: [
        {
          txId: 'faf9346ebeaf65c2720464eb9126e43dfd7b40742e337370b67b84ae0f03dc2b',
          index: 0,
          value: 3000000n,
          assets: [
            {
              policy_id:
                'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
              asset_name: '484f534b59',
              quantity: '184272501',
              fingerprint: 'asset17q7r59zlc3dgw0venc80pdv566q6yguw03f0d9',
            },
          ],
        },
      ],
      outputs: [
        {
          address:
            'addr1q9jperhqputlfnfqhteu6eu2xhjwxa9keph08vgrqjg357tthg3xm3n4r6pw85a5p6gdqv9v5zd6vmqdpxvl0jrql2aszjgvaj',
          value: 1386445n,
          assets: [],
        },
        {
          address:
            'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
          value: 1344798n,
          assets: [
            {
              policy_id:
                'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
              asset_name: '484f534b59',
              quantity: '184272501',
              fingerprint: 'asset17q7r59zlc3dgw0venc80pdv566q6yguw03f0d9',
            },
          ],
        },
      ],
      ttl: 0,
      fee: 268757n,
      metadata: {
        '0': {
          to: 'ergo',
          bridgeFee: '165000000',
          toAddress: '9g7mqqQAnUG4gWi6pFmic65ZfUrrWiVkMnbsg2hXUx6aVbBSTJ4',
          networkFee: '175000',
          fromAddress: [
            'addr1q9jperhqputlfnfqhteu6eu2xhjwxa9keph08vgrqjg357tthg3xm3n4r6p',
            'w85a5p6gdqv9v5zd6vmqdpxvl0jrql2aszjgvaj',
          ],
        },
      },
    },
    validAdaLock: {
      id: '9aafc88a1342be4899a4a44cc509a74df0aafa2bb5f04ae5ef425edde9a2617c',
      inputs: [
        {
          txId: '2868e42d3c00095c658b7cfd26ef8f1079617861b8ad68c65b73beabfa4ec83c',
          index: 0,
          value: 10000000n,
          assets: [],
        },
        {
          txId: 'fc303c5c986ffa4293cb60449f5496faab012dc37160143d5aefab0690f3af6c',
          index: 0,
          value: 10000000n,
          assets: [],
        },
      ],
      outputs: [
        {
          address:
            'addr1qyhuv6w60yf5twtv9dky7pgxkayxzcygkqfygje2kwqj5ung67rta7rlkn5g0a73c43efpcpznk9j8uhaukpdr9ye3xqk2kgam',
          value: 9731595n,
          assets: [],
        },
        {
          address:
            'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
          value: 10000000n,
          assets: [],
        },
      ],
      ttl: 0,
      fee: 268405n,
      metadata: {
        '0': {
          to: 'ergo',
          bridgeFee: '8500000',
          toAddress: '9gh2VssYZWZNFwhbC4VhKytiGDbCdwqYfdorQ6US6Ftj3n74rTX',
          networkFee: '9000',
          fromAddress: [
            'addr1qyhuv6w60yf5twtv9dky7pgxkayxzcygkqfygje2kwqj5ung67rta7rlkn5',
            'g0a73c43efpcpznk9j8uhaukpdr9ye3xqk2kgam',
          ],
        },
      },
    },
    noLock: {
      id: 'abcfb5be7e0cbc1eda89924e31b917b984a8e1f747ee5973fc4d8bce2aeab83f',
      inputs: [
        {
          txId: '83cf93edbc7dae819e36d3bc14868ac1b5f4ceb3faf318dc345dc5ad12d521f1',
          index: 1,
          value: 119172320n,
          assets: [],
        },
        {
          txId: '3bed024e5aa81e7d54df868428514103e5ba09ab39f01885cc5b4627a231772a',
          index: 7,
          value: 20571475n,
          assets: [],
        },
      ],
      outputs: [
        {
          address:
            'addr1q88p92q453gnyhlp6rl6f0hhf9npg86u4df8jhwf3t9ekuky8am5m5jqgqg2ywlk8wqt87pe4jvyjwstxqner4ejtzyscyu347',
          value: 2000000n,
          assets: [],
        },
        {
          address:
            'addr1q88p92q453gnyhlp6rl6f0hhf9npg86u4df8jhwf3t9ekuky8am5m5jqgqg2ywlk8wqt87pe4jvyjwstxqner4ejtzyscyu347',
          value: 17867518n,
          assets: [],
        },
        {
          address:
            'addr1q8lgqva8uleq9f3wjsnggh42d6y8vm9rvah380wq3x9djqwhy3954pmhklwxjz05vsx0qt4yw4a9275eldyrkp0c0hlqgxc7du',
          value: 119672320n,
          assets: [],
        },
      ],
      ttl: 91881329,
      fee: 203957n,
      metadata: {
        '0': {
          to: 'ergo',
          bridgeFee: '8500000',
          toAddress: '9gh2VssYZWZNFwhbC4VhKytiGDbCdwqYfdorQ6US6Ftj3n74rTX',
          networkFee: '9000',
          fromAddress: [
            'addr1qyhuv6w60yf5twtv9dky7pgxkayxzcygkqfygje2kwqj5ung67rta7rlkn5',
            'g0a73c43efpcpznk9j8uhaukpdr9ye3xqk2kgam',
          ],
        },
      },
    },
    noZeroKeyMetadata: {
      id: 'c5afb967619ee64e0d724a56d27670fee6fe698df1375692d9868cb9792467c8',
      inputs: [
        {
          txId: 'faf9346ebeaf65c2720464eb9126e43dfd7b40742e337370b67b84ae0f03dc2b',
          index: 0,
          value: 3000000n,
          assets: [
            {
              policy_id:
                'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
              asset_name: '484f534b59',
              quantity: '184272501',
              fingerprint: 'asset17q7r59zlc3dgw0venc80pdv566q6yguw03f0d9',
            },
          ],
        },
      ],
      outputs: [
        {
          address:
            'addr1q9jperhqputlfnfqhteu6eu2xhjwxa9keph08vgrqjg357tthg3xm3n4r6pw85a5p6gdqv9v5zd6vmqdpxvl0jrql2aszjgvaj',
          value: 1386445n,
          assets: [],
        },
        {
          address:
            'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
          value: 1344798n,
          assets: [
            {
              policy_id:
                'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
              asset_name: '484f534b59',
              quantity: '184272501',
              fingerprint: 'asset17q7r59zlc3dgw0venc80pdv566q6yguw03f0d9',
            },
          ],
        },
      ],
      ttl: 0,
      fee: 268757n,
      metadata: {
        '1': {
          to: 'ergo',
          bridgeFee: '165000000',
          toAddress: '9g7mqqQAnUG4gWi6pFmic65ZfUrrWiVkMnbsg2hXUx6aVbBSTJ4',
          networkFee: '175000',
          fromAddress: [
            'addr1q9jperhqputlfnfqhteu6eu2xhjwxa9keph08vgrqjg357tthg3xm3n4r6p',
            'w85a5p6gdqv9v5zd6vmqdpxvl0jrql2aszjgvaj',
          ],
        },
      },
    },
  };

  static rosenRosenData = {
    validTokenLock: {
      toChain: 'ergo',
      toAddress: '9g7mqqQAnUG4gWi6pFmic65ZfUrrWiVkMnbsg2hXUx6aVbBSTJ4',
      bridgeFee: '165000000',
      networkFee: '175000',
      fromAddress:
        'addr1q9jperhqputlfnfqhteu6eu2xhjwxa9keph08vgrqjg357tthg3xm3n4r6pw85a5p6gdqv9v5zd6vmqdpxvl0jrql2aszjgvaj',
      sourceChainTokenId: 'asset17q7r59zlc3dgw0venc80pdv566q6yguw03f0d9',
      amount: '184272501',
      targetChainTokenId:
        'b37bfa41c2d9e61b4e478ddfc459a03d25b658a2305ffb428fbc47ad6abbeeaa',
      sourceTxId:
        'c5afb967619ee64e0d724a56d27670fee6fe698df1375692d9868cb9792467c8',
    },
    validADALock: {
      toChain: 'ergo',
      toAddress: '9gh2VssYZWZNFwhbC4VhKytiGDbCdwqYfdorQ6US6Ftj3n74rTX',
      bridgeFee: '8500000',
      networkFee: '9000',
      fromAddress:
        'addr1qyhuv6w60yf5twtv9dky7pgxkayxzcygkqfygje2kwqj5ung67rta7rlkn5g0a73c43efpcpznk9j8uhaukpdr9ye3xqk2kgam',
      sourceChainTokenId: 'lovelace',
      amount: '10000000',
      targetChainTokenId:
        'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      sourceTxId:
        '9aafc88a1342be4899a4a44cc509a74df0aafa2bb5f04ae5ef425edde9a2617c',
    },
  };

  static rosenUTXOs = {
    tokenLocked: {
      address:
        'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
      value: 1344798n,
      assets: [
        {
          policy_id: 'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
          asset_name: '484f534b59',
          quantity: '184272501',
          fingerprint: 'asset17q7r59zlc3dgw0venc80pdv566q6yguw03f0d9',
        },
      ],
    },
    adaLocked: {
      address:
        'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
      value: 10000000n,
      assets: [],
    },
    secondAssetLocked: {
      address:
        'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
      value: 1344798n,
      assets: [
        {
          policy_id: 'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
          asset_name: '484f534b50',
          quantity: '184272501',
          fingerprint: 'asset17q7r59zlc3dgw0venc80pdv566q6yguw03f0d9',
        },
        {
          policy_id: 'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
          asset_name: '484f534b59',
          quantity: '184272501',
          fingerprint: 'asset17q7r59zlc3dgw0venc80pdv566q6yguw03f0d9',
        },
      ],
    },
    wrongTokenLocked: {
      address:
        'addr_test1vze7yqqlg8cjlyhz7jzvsg0f3fhxpuu6m3llxrajfzqecggw704re',
      value: 10000000n,
      assets: [
        {
          policy_id: 'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
          asset_name: '484f534b50',
          quantity: '184272501',
          fingerprint: 'asset17q7r59zlc3dgw0venc80pdv566q6yguw03f0d9',
        },
      ],
    },
  };

  static rosenAssetTransformations = {
    tokenLocked: {
      from: 'asset17q7r59zlc3dgw0venc80pdv566q6yguw03f0d9',
      to: 'b37bfa41c2d9e61b4e478ddfc459a03d25b658a2305ffb428fbc47ad6abbeeaa',
      amount: '184272501',
    },
    adaLocked: {
      from: 'lovelace',
      to: 'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      amount: '10000000',
    },
  };
}
