export default class CardanoTestUtils {
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
      sourceBlockId:
        '2e930d689e38e9ecd3e000c432dcb2521aff4b5c00cabd6422fd738058e419c7',
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
      sourceBlockId:
        '7c914e850837df2246dbac00c5b4ffa1252bcd234c000e3dce9e83e986d039e2',
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
  };

  static AuxiliaryData = {
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
}
