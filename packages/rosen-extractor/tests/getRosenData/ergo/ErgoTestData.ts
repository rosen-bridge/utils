class ErgoTestData {
  static lockAddress =
    '2CBjjwbY9Rokj7Ue9qT2pbMR2WhLDmdcL2V9pRgCEEMks9QRXiQ7K73wNANLAczY1XLimkNBu6Nt3hW1zACrk4zQxu';

  static nodeBaseTransaction = {
    id: 'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
    blockId: '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
    inclusionHeight: 253478,
    timestamp: 1658485237304,
    index: 1,
    globalIndex: 266474,
    numConfirmations: 2187,
    inputs: [
      {
        boxId:
          'e61780d6caa840d3dfc455900bf41b033e16cec27dca2ebfc033cb9d26612335',
        value: 1000100000,
        index: 0,
        spendingProof:
          '12806d7b68be67c6c3a7f96ece494cacdabc809b68bd79ae9e3b796b92cd53d1fcbb1533dc91a70016bcec64c280fe6c95a003bc5019b09d',
        outputBlockId:
          '255f6e4ed26ee7a5860f5dfe7ce803eb4da465df355634481f7f44004cd52abc',
        outputTransactionId:
          'e2659ee1f5c0bb021d3a46c092af39a0589d808a1286f90cee04983a2fc76664',
        outputIndex: 2,
        outputGlobalIndex: 546800,
        outputCreatedAt: 252817,
        outputSettledAt: 252819,
        ergoTree:
          '0008cd028bcc85fa22006fa13767ab00af28ae0b2389d576fb59cfd0e46865e0449eeb8a',
        address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
        assets: [
          {
            tokenId:
              '064c58ea394d41fada074a3c560a132467adf4ca1512c409c014c625ca285e9c',
            index: 0,
            amount: 1,
            name: null,
            decimals: null,
            type: null,
          },
          {
            tokenId:
              'a2a6c892c38d508a659caf857dbe29da4343371e597efd42e40f9bc99099a516',
            index: 1,
            amount: 9000,
            name: 'RSN',
            decimals: 0,
            type: 'EIP-004',
          },
          {
            tokenId:
              '0034c44f0c7a38f833190d44125ff9b3a0dd9dbb89138160182a930bc521db95',
            index: 2,
            amount: 20,
            name: 'SWSE',
            decimals: 0,
            type: 'EIP-004',
          },
        ],
        additionalRegisters: {},
      },
    ],
    dataInputs: [],
    size: 456,
  };

  static nodeTransactionOutputs = {
    tokenLock: [
      {
        boxId:
          '75a836e2c548c4e47fa75761c85168e6f0563bf7ec9db4aa21b6863a701b0637',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 1100000,
        index: 0,
        globalIndex: 548120,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '10010e20a6ac381e6fa99929fd1477b3ba9499790a775e91d4c14c5aa86e9a118dfac853d1aea4d9010163aedb63087201d901034d0e938c7203017300',
        address:
          '2CBjjwbY9Rokj7Ue9qT2pbMR2WhLDmdcL2V9pRgCEEMks9QRXiQ7K73wNANLAczY1XLimkNBu6Nt3hW1zACrk4zQxu',
        assets: [
          {
            tokenId:
              'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
            index: 0,
            amount: 2000000,
            name: 'SWSE',
            decimals: 0,
            type: 'EIP-004',
          },
        ],
        additionalRegisters: {
          R4: '1a050763617264616e6f0a746f41646472657373340631303030303004323530300b66726f6d41646472657373',
        },
        spentTransactionId: null,
        mainChain: true,
      },
      {
        boxId:
          'c9044cd4b2cbc1bca6acb3eae8a634533c8f91bb14fe1f04579b2ca240c56778',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 997900000,
        index: 1,
        globalIndex: 548121,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '0008cd028bcc85fa22006fa13767ab00af28ae0b2389d576fb59cfd0e46865e0449eeb8a',
        address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
        assets: [
          {
            tokenId:
              '064c58ea394d41fada074a3c560a132467adf4ca1512c409c014c625ca285e9c',
            index: 0,
            amount: 1,
            name: null,
            decimals: null,
            type: null,
          },
          {
            tokenId:
              'a2a6c892c38d508a659caf857dbe29da4343371e597efd42e40f9bc99099a516',
            index: 1,
            amount: 9000,
            name: 'RSN',
            decimals: 0,
            type: 'EIP-004',
          },
          {
            tokenId:
              '0034c44f0c7a38f833190d44125ff9b3a0dd9dbb89138160182a930bc521db95',
            index: 2,
            amount: 18,
            name: 'SWSE',
            decimals: 0,
            type: 'EIP-004',
          },
        ],
        additionalRegisters: {},
        spentTransactionId:
          'ce0208fb246f031d105ef48baeb45165dbcf201d06ecd2ea1cd3abb471864883',
        mainChain: true,
      },
      {
        boxId:
          '158145208df21577e9832d7fbd3d945cf00b133b371acca53904380e7eeb6942',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 1100000,
        index: 2,
        globalIndex: 548122,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304',
        address:
          '2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe',
        assets: [],
        additionalRegisters: {},
        spentTransactionId: null,
        mainChain: true,
      },
    ],
    ergLock: [
      {
        boxId:
          '75a836e2c548c4e47fa75761c85168e6f0563bf7ec9db4aa21b6863a701b0637',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 11100000,
        index: 0,
        globalIndex: 548120,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '10010e20a6ac381e6fa99929fd1477b3ba9499790a775e91d4c14c5aa86e9a118dfac853d1aea4d9010163aedb63087201d901034d0e938c7203017300',
        address:
          '2CBjjwbY9Rokj7Ue9qT2pbMR2WhLDmdcL2V9pRgCEEMks9QRXiQ7K73wNANLAczY1XLimkNBu6Nt3hW1zACrk4zQxu',
        assets: [],
        additionalRegisters: {
          R4: '1a050763617264616e6f0a746f41646472657373340631303030303004323530300b66726f6d41646472657373',
        },
        spentTransactionId: null,
        mainChain: true,
      },
      {
        boxId:
          'c9044cd4b2cbc1bca6acb3eae8a634533c8f91bb14fe1f04579b2ca240c56778',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 997900000,
        index: 1,
        globalIndex: 548121,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '0008cd028bcc85fa22006fa13767ab00af28ae0b2389d576fb59cfd0e46865e0449eeb8a',
        address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
        assets: [
          {
            tokenId:
              '064c58ea394d41fada074a3c560a132467adf4ca1512c409c014c625ca285e9c',
            index: 0,
            amount: 1,
            name: null,
            decimals: null,
            type: null,
          },
          {
            tokenId:
              'a2a6c892c38d508a659caf857dbe29da4343371e597efd42e40f9bc99099a516',
            index: 1,
            amount: 9000,
            name: 'RSN',
            decimals: 0,
            type: 'EIP-004',
          },
          {
            tokenId:
              '0034c44f0c7a38f833190d44125ff9b3a0dd9dbb89138160182a930bc521db95',
            index: 2,
            amount: 18,
            name: 'SWSE',
            decimals: 0,
            type: 'EIP-004',
          },
        ],
        additionalRegisters: {},
        spentTransactionId:
          'ce0208fb246f031d105ef48baeb45165dbcf201d06ecd2ea1cd3abb471864883',
        mainChain: true,
      },
      {
        boxId:
          '158145208df21577e9832d7fbd3d945cf00b133b371acca53904380e7eeb6942',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 1100000,
        index: 2,
        globalIndex: 548122,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304',
        address:
          '2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe',
        assets: [],
        additionalRegisters: {},
        spentTransactionId: null,
        mainChain: true,
      },
    ],
    noLock: [
      {
        boxId:
          'c9044cd4b2cbc1bca6acb3eae8a634533c8f91bb14fe1f04579b2ca240c56778',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 997900000,
        index: 1,
        globalIndex: 548121,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '0008cd028bcc85fa22006fa13767ab00af28ae0b2389d576fb59cfd0e46865e0449eeb8a',
        address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
        assets: [
          {
            tokenId:
              '064c58ea394d41fada074a3c560a132467adf4ca1512c409c014c625ca285e9c',
            index: 0,
            amount: 1,
            name: null,
            decimals: null,
            type: null,
          },
          {
            tokenId:
              'a2a6c892c38d508a659caf857dbe29da4343371e597efd42e40f9bc99099a516',
            index: 1,
            amount: 9000,
            name: 'RSN',
            decimals: 0,
            type: 'EIP-004',
          },
          {
            tokenId:
              '0034c44f0c7a38f833190d44125ff9b3a0dd9dbb89138160182a930bc521db95',
            index: 2,
            amount: 18,
            name: 'SWSE',
            decimals: 0,
            type: 'EIP-004',
          },
        ],
        additionalRegisters: {},
        spentTransactionId:
          'ce0208fb246f031d105ef48baeb45165dbcf201d06ecd2ea1cd3abb471864883',
        mainChain: true,
      },
      {
        boxId:
          '158145208df21577e9832d7fbd3d945cf00b133b371acca53904380e7eeb6942',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 1100000,
        index: 2,
        globalIndex: 548122,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304',
        address:
          '2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe',
        assets: [],
        additionalRegisters: {},
        spentTransactionId: null,
        mainChain: true,
      },
    ],
    fewerValues: [
      {
        boxId:
          '75a836e2c548c4e47fa75761c85168e6f0563bf7ec9db4aa21b6863a701b0637',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 11100000,
        index: 0,
        globalIndex: 548120,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '10010e20a6ac381e6fa99929fd1477b3ba9499790a775e91d4c14c5aa86e9a118dfac853d1aea4d9010163aedb63087201d901034d0e938c7203017300',
        address:
          '2CBjjwbY9Rokj7Ue9qT2pbMR2WhLDmdcL2V9pRgCEEMks9QRXiQ7K73wNANLAczY1XLimkNBu6Nt3hW1zACrk4zQxu',
        assets: [],
        additionalRegisters: {
          R4: '1a040763617264616e6f0a746f4164647265737334063130303030300432353030',
        },
        spentTransactionId: null,
        mainChain: true,
      },
      {
        boxId:
          'c9044cd4b2cbc1bca6acb3eae8a634533c8f91bb14fe1f04579b2ca240c56778',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 997900000,
        index: 1,
        globalIndex: 548121,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '0008cd028bcc85fa22006fa13767ab00af28ae0b2389d576fb59cfd0e46865e0449eeb8a',
        address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
        assets: [
          {
            tokenId:
              '064c58ea394d41fada074a3c560a132467adf4ca1512c409c014c625ca285e9c',
            index: 0,
            amount: 1,
            name: null,
            decimals: null,
            type: null,
          },
          {
            tokenId:
              'a2a6c892c38d508a659caf857dbe29da4343371e597efd42e40f9bc99099a516',
            index: 1,
            amount: 9000,
            name: 'RSN',
            decimals: 0,
            type: 'EIP-004',
          },
          {
            tokenId:
              '0034c44f0c7a38f833190d44125ff9b3a0dd9dbb89138160182a930bc521db95',
            index: 2,
            amount: 18,
            name: 'SWSE',
            decimals: 0,
            type: 'EIP-004',
          },
        ],
        additionalRegisters: {},
        spentTransactionId:
          'ce0208fb246f031d105ef48baeb45165dbcf201d06ecd2ea1cd3abb471864883',
        mainChain: true,
      },
      {
        boxId:
          '158145208df21577e9832d7fbd3d945cf00b133b371acca53904380e7eeb6942',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 1100000,
        index: 2,
        globalIndex: 548122,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304',
        address:
          '2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe',
        assets: [],
        additionalRegisters: {},
        spentTransactionId: null,
        mainChain: true,
      },
    ],
    invalidRegisterType: [
      {
        boxId:
          '75a836e2c548c4e47fa75761c85168e6f0563bf7ec9db4aa21b6863a701b0637',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 11100000,
        index: 0,
        globalIndex: 548120,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '10010e20a6ac381e6fa99929fd1477b3ba9499790a775e91d4c14c5aa86e9a118dfac853d1aea4d9010163aedb63087201d901034d0e938c7203017300',
        address:
          '2CBjjwbY9Rokj7Ue9qT2pbMR2WhLDmdcL2V9pRgCEEMks9QRXiQ7K73wNANLAczY1XLimkNBu6Nt3hW1zACrk4zQxu',
        assets: [],
        additionalRegisters: {
          R4: '1102a09c01c0b802',
        },
        spentTransactionId: null,
        mainChain: true,
      },
      {
        boxId:
          'c9044cd4b2cbc1bca6acb3eae8a634533c8f91bb14fe1f04579b2ca240c56778',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 997900000,
        index: 1,
        globalIndex: 548121,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '0008cd028bcc85fa22006fa13767ab00af28ae0b2389d576fb59cfd0e46865e0449eeb8a',
        address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
        assets: [
          {
            tokenId:
              '064c58ea394d41fada074a3c560a132467adf4ca1512c409c014c625ca285e9c',
            index: 0,
            amount: 1,
            name: null,
            decimals: null,
            type: null,
          },
          {
            tokenId:
              'a2a6c892c38d508a659caf857dbe29da4343371e597efd42e40f9bc99099a516',
            index: 1,
            amount: 9000,
            name: 'RSN',
            decimals: 0,
            type: 'EIP-004',
          },
          {
            tokenId:
              '0034c44f0c7a38f833190d44125ff9b3a0dd9dbb89138160182a930bc521db95',
            index: 2,
            amount: 18,
            name: 'SWSE',
            decimals: 0,
            type: 'EIP-004',
          },
        ],
        additionalRegisters: {},
        spentTransactionId:
          'ce0208fb246f031d105ef48baeb45165dbcf201d06ecd2ea1cd3abb471864883',
        mainChain: true,
      },
      {
        boxId:
          '158145208df21577e9832d7fbd3d945cf00b133b371acca53904380e7eeb6942',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 1100000,
        index: 2,
        globalIndex: 548122,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304',
        address:
          '2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe',
        assets: [],
        additionalRegisters: {},
        spentTransactionId: null,
        mainChain: true,
      },
    ],
    noRegister: [
      {
        boxId:
          '75a836e2c548c4e47fa75761c85168e6f0563bf7ec9db4aa21b6863a701b0637',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 1100000,
        index: 0,
        globalIndex: 548120,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '10010e20a6ac381e6fa99929fd1477b3ba9499790a775e91d4c14c5aa86e9a118dfac853d1aea4d9010163aedb63087201d901034d0e938c7203017300',
        address:
          '2CBjjwbY9Rokj7Ue9qT2pbMR2WhLDmdcL2V9pRgCEEMks9QRXiQ7K73wNANLAczY1XLimkNBu6Nt3hW1zACrk4zQxu',
        assets: [
          {
            tokenId:
              'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
            index: 0,
            amount: 2000000,
            name: 'SWSE',
            decimals: 0,
            type: 'EIP-004',
          },
        ],
        additionalRegisters: {},
        spentTransactionId: null,
        mainChain: true,
      },
      {
        boxId:
          'c9044cd4b2cbc1bca6acb3eae8a634533c8f91bb14fe1f04579b2ca240c56778',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 997900000,
        index: 1,
        globalIndex: 548121,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '0008cd028bcc85fa22006fa13767ab00af28ae0b2389d576fb59cfd0e46865e0449eeb8a',
        address: '9fadVRGYyiSBCgD7QtZU13BfGoDyTQ1oX918P8py22MJuMEwSuo',
        assets: [
          {
            tokenId:
              '064c58ea394d41fada074a3c560a132467adf4ca1512c409c014c625ca285e9c',
            index: 0,
            amount: 1,
            name: null,
            decimals: null,
            type: null,
          },
          {
            tokenId:
              'a2a6c892c38d508a659caf857dbe29da4343371e597efd42e40f9bc99099a516',
            index: 1,
            amount: 9000,
            name: 'RSN',
            decimals: 0,
            type: 'EIP-004',
          },
          {
            tokenId:
              '0034c44f0c7a38f833190d44125ff9b3a0dd9dbb89138160182a930bc521db95',
            index: 2,
            amount: 18,
            name: 'SWSE',
            decimals: 0,
            type: 'EIP-004',
          },
        ],
        additionalRegisters: {},
        spentTransactionId:
          'ce0208fb246f031d105ef48baeb45165dbcf201d06ecd2ea1cd3abb471864883',
        mainChain: true,
      },
      {
        boxId:
          '158145208df21577e9832d7fbd3d945cf00b133b371acca53904380e7eeb6942',
        transactionId:
          'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
        blockId:
          '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
        value: 1100000,
        index: 2,
        globalIndex: 548122,
        creationHeight: 253476,
        settlementHeight: 253478,
        ergoTree:
          '1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304',
        address:
          '2iHkR7CWvD1R4j1yZg5bkeDRQavjAaVPeTDFGGLZduHyfWMuYpmhHocX8GJoaieTx78FntzJbCBVL6rf96ocJoZdmWBL2fci7NqWgAirppPQmZ7fN9V6z13Ay6brPriBKYqLp1bT2Fk4FkFLCfdPpe',
        assets: [],
        additionalRegisters: {},
        spentTransactionId: null,
        mainChain: true,
      },
    ],
  };

  static nodeTransactions = {
    validTokenLock: {
      ...this.nodeBaseTransaction,
      outputs: this.nodeTransactionOutputs.tokenLock,
    },
    validErgLock: {
      ...this.nodeBaseTransaction,
      outputs: this.nodeTransactionOutputs.ergLock,
    },
    noLock: {
      ...this.nodeBaseTransaction,
      outputs: this.nodeTransactionOutputs.noLock,
    },
    fewerValues: {
      ...this.nodeBaseTransaction,
      outputs: this.nodeTransactionOutputs.fewerValues,
    },
    invalidRegisterType: {
      ...this.nodeBaseTransaction,
      outputs: this.nodeTransactionOutputs.invalidRegisterType,
    },
    noRegister: {
      ...this.nodeBaseTransaction,
      outputs: this.nodeTransactionOutputs.noRegister,
    },
  };

  static nodeRosenData = {
    validTokenLock: {
      toChain: 'cardano',
      toAddress: 'toAddress4',
      bridgeFee: '2500',
      networkFee: '100000',
      fromAddress: 'fromAddress',
      sourceChainTokenId:
        'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      amount: '2000000',
      targetChainTokenId: 'lovelace',
      sourceTxId:
        'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
    },
    validErgLock: {
      toChain: 'cardano',
      toAddress: 'toAddress4',
      bridgeFee: '2500',
      networkFee: '100000',
      fromAddress: 'fromAddress',
      sourceChainTokenId: 'erg',
      amount: '11100000',
      targetChainTokenId:
        'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
      sourceTxId:
        'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
    },
  };

  static nodeBoxes = {
    tokenLocked: {
      boxId: '75a836e2c548c4e47fa75761c85168e6f0563bf7ec9db4aa21b6863a701b0637',
      transactionId:
        'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
      blockId:
        '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
      value: 1100000n,
      index: 0,
      globalIndex: 548120,
      creationHeight: 253476,
      settlementHeight: 253478,
      ergoTree:
        '10010e20a6ac381e6fa99929fd1477b3ba9499790a775e91d4c14c5aa86e9a118dfac853d1aea4d9010163aedb63087201d901034d0e938c7203017300',
      address:
        '2CBjjwbY9Rokj7Ue9qT2pbMR2WhLDmdcL2V9pRgCEEMks9QRXiQ7K73wNANLAczY1XLimkNBu6Nt3hW1zACrk4zQxu',
      assets: [
        {
          tokenId:
            'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
          index: 0,
          amount: 2000000n,
          name: 'SWSE',
          decimals: 0,
          type: 'EIP-004',
        },
      ],
      additionalRegisters: {
        R4: '1a050763617264616e6f0a746f41646472657373340631303030303004323530300b66726f6d41646472657373',
      },
      spentTransactionId: null,
      mainChain: true,
    },
    ergLocked: {
      boxId: '75a836e2c548c4e47fa75761c85168e6f0563bf7ec9db4aa21b6863a701b0637',
      transactionId:
        'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
      blockId:
        '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
      value: 11100000n,
      index: 0,
      globalIndex: 548120,
      creationHeight: 253476,
      settlementHeight: 253478,
      ergoTree:
        '10010e20a6ac381e6fa99929fd1477b3ba9499790a775e91d4c14c5aa86e9a118dfac853d1aea4d9010163aedb63087201d901034d0e938c7203017300',
      address:
        '2CBjjwbY9Rokj7Ue9qT2pbMR2WhLDmdcL2V9pRgCEEMks9QRXiQ7K73wNANLAczY1XLimkNBu6Nt3hW1zACrk4zQxu',
      assets: [],
      additionalRegisters: {
        R4: '1a050763617264616e6f0a746f41646472657373340631303030303004323530300b66726f6d41646472657373',
      },
      spentTransactionId: null,
      mainChain: true,
    },
    secondTokenLocked: {
      boxId: '75a836e2c548c4e47fa75761c85168e6f0563bf7ec9db4aa21b6863a701b0637',
      transactionId:
        'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
      blockId:
        '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
      value: 1100000n,
      index: 0,
      globalIndex: 548120,
      creationHeight: 253476,
      settlementHeight: 253478,
      ergoTree:
        '10010e20a6ac381e6fa99929fd1477b3ba9499790a775e91d4c14c5aa86e9a118dfac853d1aea4d9010163aedb63087201d901034d0e938c7203017300',
      address:
        '2CBjjwbY9Rokj7Ue9qT2pbMR2WhLDmdcL2V9pRgCEEMks9QRXiQ7K73wNANLAczY1XLimkNBu6Nt3hW1zACrk4zQxu',
      assets: [
        {
          tokenId:
            'a2a6c892c38d508a659caf857dbe29da4343371e597efd42e40f9bc99099a516',
          index: 1,
          amount: 9000n,
          name: 'RSN',
          decimals: 0,
          type: 'EIP-004',
        },
        {
          tokenId:
            'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
          index: 0,
          amount: 2000000n,
          name: 'SWSE',
          decimals: 0,
          type: 'EIP-004',
        },
      ],
      additionalRegisters: {
        R4: '1a050763617264616e6f0a746f41646472657373340631303030303004323530300b66726f6d41646472657373',
      },
      spentTransactionId: null,
      mainChain: true,
    },
    wrongTokenLocked: {
      boxId: '75a836e2c548c4e47fa75761c85168e6f0563bf7ec9db4aa21b6863a701b0637',
      transactionId:
        'd04fc93dc15a28a1f0e50b0fffc94f360037dcedddaf8a2e25905a892cd48378',
      blockId:
        '6e74499171d828ee51266d3b65011cf958afe551ce7a0d74e5f6aba9029ae90c',
      value: 1100000n,
      index: 0,
      globalIndex: 548120,
      creationHeight: 253476,
      settlementHeight: 253478,
      ergoTree:
        '10010e20a6ac381e6fa99929fd1477b3ba9499790a775e91d4c14c5aa86e9a118dfac853d1aea4d9010163aedb63087201d901034d0e938c7203017300',
      address:
        '2CBjjwbY9Rokj7Ue9qT2pbMR2WhLDmdcL2V9pRgCEEMks9QRXiQ7K73wNANLAczY1XLimkNBu6Nt3hW1zACrk4zQxu',
      assets: [
        {
          tokenId:
            'a2a6c892c38d508a659caf857dbe29da4343371e597efd42e40f9bc99099a516',
          index: 1,
          amount: 9000n,
          name: 'RSN',
          decimals: 0,
          type: 'EIP-004',
        },
      ],
      additionalRegisters: {
        R4: '1a050763617264616e6f0a746f41646472657373340631303030303004323530300b66726f6d41646472657373',
      },
      spentTransactionId: null,
      mainChain: true,
    },
  };

  static nodeAssetTransformation = {
    tokenLocked: {
      from: 'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
      to: 'lovelace',
      amount: 2000000n,
    },
    ergLocked: {
      from: 'erg',
      to: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
      amount: 11100000n,
    },
    wrongTokenLocked: {
      from: 'erg',
      to: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
      amount: 1100000n,
    },
  };
}

export default ErgoTestData;
