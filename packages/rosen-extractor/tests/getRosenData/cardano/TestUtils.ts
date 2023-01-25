class TestUtils {
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
    wrongKey: {
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
                  string: 'wrongKey',
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
                  string: 'wrongKey',
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

export default TestUtils;
