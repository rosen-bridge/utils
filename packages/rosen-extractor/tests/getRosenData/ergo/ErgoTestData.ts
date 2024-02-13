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
      targetChainTokenId: 'ada',
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
        'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
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
      to: 'ada',
      amount: '2000000',
    },
    ergLocked: {
      from: 'erg',
      to: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
      amount: '11100000',
    },
    wrongTokenLocked: {
      from: 'erg',
      to: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
      amount: '1100000',
    },
  };

  static ergoSerializedTxs = {
    lockTx:
      '01d786bdd9f3113cb9261f396f82e3d6134af02f1770091bc1a4fd83788eea0cde38ca5d54d83a87178e1460b8cdc598563e084bf18191d6ca6d5ffa83ee42b347fcbcbafec81dba7a0c30bbb045f2cfa0725a74e0c7f8f1668b000007517c91b4ea680166ddd3f67b27b0274c20bbd2aeb82b60eaf5bf5471b37f684afc6c2070eb004fc08fcde1514dee56b1d0587477748d8af647179b098f52f55910278c102bf890fdab8ef5111e94053c90b3541bc25b0de2ee8aa6305ccec3de37080ea7925c407965f27013fe66d2e7d692e68dc0de9219effe4819cea8c7b3febf2d60bbcccb94ed27f49f496521415280bb7b59086455371808c4f740f36a3ac8a90d0aa8c5c50e99dd2588a990fd37b5d3aee70e32d56241f41ed49e9f03f833f756e1bf9d15b8f984aefa64482040d6c8b3ec217b2be8b8a477e82d900d039df29eb701100304000e20a96b8049f0741c7255b60cf01954439d2e4b2d19ae7d8ebc688ecb190a33b5380400d801d601b2db6501fe730000ea02d1aedb63087201d901024d0e938c720201730198b2e4c672010510730200ade4c67201041ad901020ecdee7202a5bc3a00011a050763617264616e6f67616464723171797267727068647379376c746132726165327075386870356d7732666e7076753873653030727861367a7a6d63347368346779666b646870776671386c6e68356c39353636336430396e337339637275746e63397977616d637671733565356d360731303030303030093230303030303030303339685a785633594e536662437153364745736573374468415653617476616f4e746473694e766b696d504747326338667a6b47d8bda9e6b4010008cd0391a9ffcade3b453244d4736258b9cbfc450f2e66881d5396e66d75b1ddc42b3ca5bc3a0700a7cbc5f70201b6848da16b02b9f9abd303030104c5010562060100e091431005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304a5bc3a0000',
    normalTx:
      '01689f46e743d6417f5c113b47add264d76540c9485f0468ba48a9b883310538910000000220fa2bf23962cdf51b07722d6237c0c7b8a44f78856c0f7ec308dc1ef1a92a51d9a2cc8a09abfaed87afacfbb7daee79a6b26f10c6613fc13d3f3953e5521d1a0280d0b1908dacef36101004020e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a7017300730110010204020404040004c0fd4f05808c82f5f6030580b8c9e5ae040580f882ad16040204c0944004c0f407040004000580f882ad16d19683030191a38cc7a7019683020193c2b2a57300007473017302830108cdeeac93a38cc7b2a573030001978302019683040193b1a5730493c2a7c2b2a573050093958fa3730673079973089c73097e9a730a9d99a3730b730c0599c1a7c1b2a5730d00938cc7b2a5730e0001a390c1a7730fa7bc3a0200010180d0ee90af9ed61f0080b89a95c901100204a00b08cd0204b680ae52835e22f12fc3c51c4cd9e18852ac4f4a8131be29920678aceeeebeea02d192a39a8cc7a70173007301a7bc3a010180f085da2c00',
    invalid:
      '015f0468ba48a9b883310538910006540c9485f046823d6134af02f1770091bc1a4fd87722d6237c0c787178e18dc1ef1a92a51d9a',
  };

  static ergoRosenData = {
    lockTx: {
      toChain: 'cardano',
      toAddress:
        'addr1qyrgrphdsy7lta2rae2pu8hp5mw2fnpvu8se00rxa6zzmc4sh4gyfkdhpwfq8lnh5l95663d09n3s9crutnc9ywamcvqs5e5m6',
      bridgeFee: '200000000',
      networkFee: '1000000',
      fromAddress: '9hZxV3YNSfbCqS6GEses7DhAVSatvaoNtdsiNvkimPGG2c8fzkG',
      sourceChainTokenId: 'erg',
      amount: '384284957',
      targetChainTokenId:
        'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
      sourceTxId:
        'ddcde6f5ee25df2d0ff11260b735bcd8d87eb8f4b42b98e9c118bf3cf0285c66',
    },
  };
}

export default ErgoTestData;
