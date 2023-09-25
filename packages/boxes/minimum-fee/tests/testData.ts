import { Fee } from '../lib';

export const normalFee: Array<Fee> = [
  {
    heights: { ergo: 11111, cardano: 444444, binance: 666 },
    configs: {
      ergo: {
        bridgeFee: 100n,
        networkFee: 30n,
        rsnRatio: 10n,
        rsnRatioDivisor: 1000n,
        feeRatio: 40n,
      },
      cardano: {
        bridgeFee: 400n,
        networkFee: 70n,
        rsnRatio: 20n,
        rsnRatioDivisor: 2000n,
        feeRatio: 50n,
      },
      binance: {
        bridgeFee: 700n,
        networkFee: 93n,
        rsnRatio: 30n,
        rsnRatioDivisor: 3000n,
        feeRatio: 60n,
      },
    },
  },
  {
    heights: { ergo: 22222, cardano: 555555, binance: 777 },
    configs: {
      ergo: {
        bridgeFee: 200n,
        networkFee: 40n,
        rsnRatio: 11n,
        rsnRatioDivisor: 1100n,
        feeRatio: 41n,
      },
      cardano: {
        bridgeFee: 500n,
        networkFee: 80n,
        rsnRatio: 21n,
        rsnRatioDivisor: 2100n,
        feeRatio: 51n,
      },
      binance: {
        bridgeFee: 800n,
        networkFee: 96n,
        rsnRatio: 31n,
        rsnRatioDivisor: 3100n,
        feeRatio: 61n,
      },
    },
  },
];

export const newChainFee: Array<Fee> = [
  {
    heights: { ergo: 11111, binance: 666 },
    configs: {
      ergo: {
        bridgeFee: 100n,
        networkFee: 30n,
        rsnRatio: 10n,
        rsnRatioDivisor: 1000n,
        feeRatio: 40n,
      },
      binance: {
        bridgeFee: 700n,
        networkFee: 93n,
        rsnRatio: 30n,
        rsnRatioDivisor: 3000n,
        feeRatio: 60n,
      },
    },
  },
  {
    heights: { ergo: 22222, cardano: 555555, binance: 777 },
    configs: {
      ergo: {
        bridgeFee: 200n,
        networkFee: 40n,
        rsnRatio: 11n,
        rsnRatioDivisor: 1100n,
        feeRatio: 41n,
      },
      cardano: {
        bridgeFee: 500n,
        networkFee: 80n,
        rsnRatio: 21n,
        rsnRatioDivisor: 2100n,
        feeRatio: 51n,
      },
      binance: {
        bridgeFee: 800n,
        networkFee: 96n,
        rsnRatio: 31n,
        rsnRatioDivisor: 3100n,
        feeRatio: 61n,
      },
    },
  },
];

export const removeChainFee: Array<Fee> = [
  {
    heights: { ergo: 11111, cardano: 444444, binance: 666 },
    configs: {
      ergo: {
        bridgeFee: 100n,
        networkFee: 30n,
        rsnRatio: 10n,
        rsnRatioDivisor: 1000n,
        feeRatio: 40n,
      },
      cardano: {
        bridgeFee: 400n,
        networkFee: 70n,
        rsnRatio: 20n,
        rsnRatioDivisor: 2000n,
        feeRatio: 50n,
      },
      binance: {
        bridgeFee: 700n,
        networkFee: 93n,
        rsnRatio: 30n,
        rsnRatioDivisor: 3000n,
        feeRatio: 60n,
      },
    },
  },
  {
    heights: { ergo: 22222, cardano: 555555, binance: 777 },
    configs: {
      ergo: {
        bridgeFee: 200n,
        networkFee: 40n,
        rsnRatio: 11n,
        rsnRatioDivisor: 1100n,
        feeRatio: 41n,
      },
      binance: {
        bridgeFee: 800n,
        networkFee: 96n,
        rsnRatio: 31n,
        rsnRatioDivisor: 3100n,
        feeRatio: 61n,
      },
    },
  },
];

export const missPreviousChainFee: Array<Fee> = [
  {
    heights: { ergo: 11111, cardano: 444444, binance: 666 },
    configs: {
      ergo: {
        bridgeFee: 100n,
        networkFee: 30n,
        rsnRatio: 10n,
        rsnRatioDivisor: 1000n,
        feeRatio: 40n,
      },
      cardano: {
        bridgeFee: 400n,
        networkFee: 70n,
        rsnRatio: 20n,
        rsnRatioDivisor: 2000n,
        feeRatio: 50n,
      },
      binance: {
        bridgeFee: 700n,
        networkFee: 93n,
        rsnRatio: 30n,
        rsnRatioDivisor: 3000n,
        feeRatio: 60n,
      },
    },
  },
  {
    heights: { ergo: 22222, binance: 777 },
    configs: {
      ergo: {
        bridgeFee: 200n,
        networkFee: 40n,
        rsnRatio: 11n,
        rsnRatioDivisor: 1100n,
        feeRatio: 41n,
      },
      binance: {
        bridgeFee: 800n,
        networkFee: 96n,
        rsnRatio: 31n,
        rsnRatioDivisor: 3100n,
        feeRatio: 61n,
      },
    },
  },
];

export const nonAscendingHeightsFee: Array<Fee> = [
  {
    heights: { ergo: 11111, cardano: 555555, binance: 666 },
    configs: {
      ergo: {
        bridgeFee: 100n,
        networkFee: 30n,
        rsnRatio: 10n,
        rsnRatioDivisor: 1000n,
        feeRatio: 40n,
      },
      cardano: {
        bridgeFee: 400n,
        networkFee: 70n,
        rsnRatio: 20n,
        rsnRatioDivisor: 2000n,
        feeRatio: 50n,
      },
      binance: {
        bridgeFee: 700n,
        networkFee: 93n,
        rsnRatio: 30n,
        rsnRatioDivisor: 3000n,
        feeRatio: 60n,
      },
    },
  },
  {
    heights: { ergo: 22222, cardano: 444444, binance: 777 },
    configs: {
      ergo: {
        bridgeFee: 200n,
        networkFee: 40n,
        rsnRatio: 11n,
        rsnRatioDivisor: 1100n,
        feeRatio: 41n,
      },
      cardano: {
        bridgeFee: 500n,
        networkFee: 80n,
        rsnRatio: 21n,
        rsnRatioDivisor: 2100n,
        feeRatio: 51n,
      },
      binance: {
        bridgeFee: 800n,
        networkFee: 96n,
        rsnRatio: 31n,
        rsnRatioDivisor: 3100n,
        feeRatio: 61n,
      },
    },
  },
];

export const explorerTestBoxes = [
  {
    boxId: 'e13ebf5a32c0a4f4235676ec2be560b15a030723ce6c2cff1f7f34787565d1ba',
    transactionId:
      '072140935f22c2027d560cff1bb0bec7dc28921503219dc398d8281f217add06',
    blockId: '86b5a1e0105c07c25e45dd0e0669da6deb772c968ce4241e5fd7dc2e226d1490',
    value: 553914412,
    index: 2,
    globalIndex: 32736617,
    creationHeight: 1093720,
    settlementHeight: 1093722,
    ergoTree:
      '0008cd031489e73d14418632783253c42d63065833d34d1b8805fbf1cb30d685408aa045',
    address: '9gcrKn7L5Ln3rRsjFoSEkEsovUdb5JR5d6o2vHQV5FCXXNkkEAD',
    assets: [
      {
        tokenId:
          '6cbeec04af6a5047d8818eac2ac6e2b28e1e74a0d339cff96f7641a1a0c3ca9b',
        index: 0,
        amount: 19999998678716068,
        name: 'rptWAdaV1',
        decimals: 6,
        type: 'EIP-004',
      },
      {
        tokenId:
          'ffacb76e5c75bdc72314777e781b9377a54f93654880d4390f7a67a929100898',
        index: 1,
        amount: 4999955649666,
        name: 'rptNEV1',
        decimals: 4,
        type: 'EIP-004',
      },
      {
        tokenId:
          '32ee5d947cfe8db5480157ffa566b9b7d9faf41fa145c9d00628c7c1599878f6',
        index: 2,
        amount: 98,
        name: 'rptconfRWTRepoV1',
        decimals: 0,
        type: 'EIP-004',
      },
      {
        tokenId:
          'f8fe64d3d94d4eb193ea9d6304646db67bd914ed42cebd3a4f614d9d9de75cf0',
        index: 3,
        amount: 798889889998,
        name: 'rptconfRSNV1',
        decimals: 3,
        type: 'EIP-004',
      },
      {
        tokenId:
          '0ee806d6547c396946f05cb93b33d3d3648f8e9817b9f2088fdb178392f85539',
        index: 4,
        amount: 73949999999,
        name: 'rptWNCV1',
        decimals: 2,
        type: 'EIP-004',
      },
      {
        tokenId:
          'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a',
        index: 5,
        amount: 996,
        name: 'rptconfRSMinFeeV1',
        decimals: 0,
        type: 'EIP-004',
      },
      {
        tokenId:
          'c59e86ef9d0280de582d6266add18fca339a77dfb321268e83033fe47101dc4d',
        index: 6,
        amount: 1,
        name: 'RST-Cardano-Token.V-test',
        decimals: 0,
        type: 'EIP-004',
      },
      {
        tokenId:
          '0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b',
        index: 7,
        amount: 1,
        name: 'COMET',
        decimals: 0,
        type: 'EIP-004',
      },
      {
        tokenId:
          '4ed6449240d166b0e44c529b5bf06d210796473d3811b9aa0e15329599164c24',
        index: 8,
        amount: 1,
        name: 'RST-ADA.V-test',
        decimals: 0,
        type: 'EIP-004',
      },
      {
        tokenId:
          '45e873d4e5af0d0fd6905ef51053fa7e9c672cd26b23b8a7f4feb17254f25392',
        index: 9,
        amount: 4,
        name: 'Rosen-Minimum-Fee.V-test',
        decimals: 0,
        type: 'EIP-004',
      },
      {
        tokenId:
          '5575324b870b8a055f44db1bce68ce21b1eef866694052f71a06dd6946775b1b',
        index: 10,
        amount: 10,
        name: 'rptconfCardanoCleanupV1',
        decimals: 0,
        type: 'EIP-004',
      },
      {
        tokenId:
          'b37bfa41c2d9e61b4e478ddfc459a03d25b658a2305ffb428fbc47ad6abbeeaa',
        index: 11,
        amount: 1,
        name: 'RstHoskyVTest2',
        decimals: 0,
        type: 'EIP-004',
      },
      {
        tokenId:
          '1ea49e1c052803576e91275b27dffbae3f4ccad9da5219bcda51ea5006fe7661',
        index: 12,
        amount: 4,
        name: 'Rosen-Minimum-Fee.V-test2',
        decimals: 0,
        type: 'EIP-004',
      },
      {
        tokenId:
          '38cb230f68a28436fb3b73ae4b927626673e4620bc7c94896178567d436e416b',
        index: 13,
        amount: 1,
        name: 'RstAdaVTest2',
        decimals: 6,
        type: 'EIP-004',
      },
      {
        tokenId:
          'a1143e81c5ab485a807e6f0f76af1dd70cc5359b29e0b1229d0edfe490d33b67',
        index: 14,
        amount: 1,
        name: 'Ergo-Token.V-test',
        decimals: 0,
        type: 'EIP-004',
      },
    ],
    additionalRegisters: {},
    spentTransactionId: null,
    mainChain: true,
  },
  {
    boxId: '20eb54caccfb0b6ddb2b90f8635e0cc6daedc42c51047f2c74b794450649d9d1',
    transactionId:
      '15746bc84000118e0ae69cb6453494ab68fccef7df7a811b5e7c447db149649e',
    blockId: 'ecb3b523d2832201ce60796724d03cb8ab56dc7879c7f3e0cf3e0e5ce251e9b3',
    value: 1000000,
    index: 3,
    globalIndex: 31536378,
    creationHeight: 1062407,
    settlementHeight: 1062409,
    ergoTree:
      '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
    address: '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U',
    assets: [
      {
        tokenId:
          'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a',
        index: 0,
        amount: 1,
        name: 'rptconfRSMinFeeV1',
        decimals: 0,
        type: 'EIP-004',
      },
      {
        tokenId:
          '0ee806d6547c396946f05cb93b33d3d3648f8e9817b9f2088fdb178392f85539',
        index: 1,
        amount: 1,
        name: 'rptWNCV1',
        decimals: 2,
        type: 'EIP-004',
      },
    ],
    additionalRegisters: {
      R5: {
        serializedValue: '1d0201c0cd7801a0e8a308',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[988000],[8682000]]',
      },
      R6: {
        serializedValue: '1d020180cdad9d010180cdad9d01',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[165000000],[165000000]]',
      },
      R8: {
        serializedValue: '1d02010201807d',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[1],[8000]]',
      },
      R7: {
        serializedValue: '1d020180d2f83e01b0ae15',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[66000000],[175000]]',
      },
      R9: {
        serializedValue: '1d0201c80101c801',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[100],[100]]',
      },
      R4: {
        serializedValue: '1a02046572676f0763617264616e6f',
        sigmaType: 'Coll[Coll[SByte]]',
        renderedValue: '[6572676f,63617264616e6f]',
      },
    },
    spentTransactionId: null,
    mainChain: true,
  },
  {
    boxId: 'c65fad07c680589c80cddcc6c4a431317c647955aaf0f3ded6f73c42d805466c',
    transactionId:
      '15746bc84000118e0ae69cb6453494ab68fccef7df7a811b5e7c447db149649e',
    blockId: 'ecb3b523d2832201ce60796724d03cb8ab56dc7879c7f3e0cf3e0e5ce251e9b3',
    value: 1000000,
    index: 2,
    globalIndex: 31536377,
    creationHeight: 1062407,
    settlementHeight: 1062409,
    ergoTree:
      '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
    address: '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U',
    assets: [
      {
        tokenId:
          'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a',
        index: 0,
        amount: 1,
        name: 'rptconfRSMinFeeV1',
        decimals: 0,
        type: 'EIP-004',
      },
      {
        tokenId:
          '6cbeec04af6a5047d8818eac2ac6e2b28e1e74a0d339cff96f7641a1a0c3ca9b',
        index: 1,
        amount: 1,
        name: 'rptWAdaV1',
        decimals: 6,
        type: 'EIP-004',
      },
    ],
    additionalRegisters: {
      R5: {
        serializedValue: '1d0202c0cd78c2cd7802a0e8a308a2e8a308',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[988000,988001],[8682000,8682001]]',
      },
      R6: {
        serializedValue: '1d020280cdad9d01c0cc8d080280cdad9d01c0cc8d08',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[165000000,8500000],[165000000,8500000]]',
      },
      R8: {
        serializedValue: '1d020202a0c21e0202a0c21e',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[1,250000],[1,250000]]',
      },
      R7: {
        serializedValue: '1d020280d2f83e80859f0302b0ae15d08c01',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[66000000,3400000],[175000,9000]]',
      },
      R9: {
        serializedValue: '1d0202c801c80102c801c801',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[100,100],[100,100]]',
      },
      R4: {
        serializedValue: '1a02046572676f0763617264616e6f',
        sigmaType: 'Coll[Coll[SByte]]',
        renderedValue: '[6572676f,63617264616e6f]',
      },
    },
    spentTransactionId: null,
    mainChain: true,
  },
  {
    boxId: '5dcf3609e8c449a8cd36c1310598448ff3aa920d0104ce4bef8b6dc132de4658',
    transactionId:
      '15746bc84000118e0ae69cb6453494ab68fccef7df7a811b5e7c447db149649e',
    blockId: 'ecb3b523d2832201ce60796724d03cb8ab56dc7879c7f3e0cf3e0e5ce251e9b3',
    value: 1000000,
    index: 1,
    globalIndex: 31536376,
    creationHeight: 1062407,
    settlementHeight: 1062409,
    ergoTree:
      '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
    address: '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U',
    assets: [
      {
        tokenId:
          'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a',
        index: 0,
        amount: 1,
        name: 'rptconfRSMinFeeV1',
        decimals: 0,
        type: 'EIP-004',
      },
      {
        tokenId:
          'ffacb76e5c75bdc72314777e781b9377a54f93654880d4390f7a67a929100898',
        index: 1,
        amount: 1,
        name: 'rptNEV1',
        decimals: 4,
        type: 'EIP-004',
      },
    ],
    additionalRegisters: {
      R5: {
        serializedValue: '1d0202c0cd78c2cd7802a0e8a308a2e8a308',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[988000,988001],[8682000,8682001]]',
      },
      R6: {
        serializedValue: '1d020280cdad9d0180a31e0280cdad9d0180a31e',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[165000000,248000],[165000000,248000]]',
      },
      R8: {
        serializedValue: '1d0202f801f80102f801f801',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[124,124],[124,124]]',
      },
      R7: {
        serializedValue: '1d020280d2f83ec09a0c02b0ae15f003',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[66000000,100000],[175000,248]]',
      },
      R9: {
        serializedValue: '1d0202c801c80102c801c801',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[100,100],[100,100]]',
      },
      R4: {
        serializedValue: '1a02046572676f0763617264616e6f',
        sigmaType: 'Coll[Coll[SByte]]',
        renderedValue: '[6572676f,63617264616e6f]',
      },
    },
    spentTransactionId: null,
    mainChain: true,
  },
  {
    boxId: '7def746de14a14756002c3dcaf19b3192d9cfb9ecb76c8c48eb7a8f8648675c2',
    transactionId:
      '15746bc84000118e0ae69cb6453494ab68fccef7df7a811b5e7c447db149649e',
    blockId: 'ecb3b523d2832201ce60796724d03cb8ab56dc7879c7f3e0cf3e0e5ce251e9b3',
    value: 1000000,
    index: 0,
    globalIndex: 31536375,
    creationHeight: 1062407,
    settlementHeight: 1062409,
    ergoTree:
      '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
    address: '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U',
    assets: [
      {
        tokenId:
          'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a',
        index: 0,
        amount: 1,
        name: 'rptconfRSMinFeeV1',
        decimals: 0,
        type: 'EIP-004',
      },
    ],
    additionalRegisters: {
      R5: {
        serializedValue: '1d0202c0cd78c2cd7802a0e8a308a2e8a308',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[988000,988001],[8682000,8682001]]',
      },
      R6: {
        serializedValue: '1d020280cdad9d0180d0acf30e0280cdad9d0180d0acf30e',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[165000000,2000000000],[165000000,2000000000]]',
      },
      R8: {
        serializedValue: '1d02020280897a020280897a',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[1,1000000],[1,1000000]]',
      },
      R7: {
        serializedValue: '1d020280d2f83e80a0f8fa0502b0ae158092f401',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[66000000,800000000],[175000,2000000]]',
      },
      R9: {
        serializedValue: '1d0202c801c80102c801c801',
        sigmaType: 'Coll[Coll[SLong]]',
        renderedValue: '[[100,100],[100,100]]',
      },
      R4: {
        serializedValue: '1a02046572676f0763617264616e6f',
        sigmaType: 'Coll[Coll[SByte]]',
        renderedValue: '[6572676f,63617264616e6f]',
      },
    },
    spentTransactionId: null,
    mainChain: true,
  },
];

export const nodeTestBoxes = [
  {
    globalIndex: 32773845,
    inclusionHeight: 1094141,
    address: '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U',
    spentTransactionId: null,
    boxId: 'fc1d473fe38f88063adcd8e302ff3adc9e0be31908e084d7794adca200515993',
    value: 40000,
    ergoTree:
      '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
    assets: [
      {
        tokenId:
          '0fdb7ff8b37479b6eb7aab38d45af2cfeefabbefdc7eebc0348d25dd65bc2c91',
        amount: 69,
      },
    ],
    creationHeight: 1094094,
    additionalRegisters: {},
    transactionId:
      'aa29d2463e1faccf4e5ba62551484a0d60ec63461439c84f9534d022a153b070',
    index: 1569,
  },
  {
    globalIndex: 31536378,
    inclusionHeight: 1062409,
    address: '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U',
    spentTransactionId: null,
    boxId: '20eb54caccfb0b6ddb2b90f8635e0cc6daedc42c51047f2c74b794450649d9d1',
    value: 1000000,
    ergoTree:
      '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
    assets: [
      {
        tokenId:
          'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a',
        amount: 1,
      },
      {
        tokenId:
          '0ee806d6547c396946f05cb93b33d3d3648f8e9817b9f2088fdb178392f85539',
        amount: 1,
      },
    ],
    creationHeight: 1062407,
    additionalRegisters: {
      R4: '1a02046572676f0763617264616e6f',
      R5: '1d0201c0cd7801a0e8a308',
      R6: '1d020180cdad9d010180cdad9d01',
      R7: '1d020180d2f83e01b0ae15',
      R8: '1d02010201807d',
      R9: '1d0201c80101c801',
    },
    transactionId:
      '15746bc84000118e0ae69cb6453494ab68fccef7df7a811b5e7c447db149649e',
    index: 3,
  },
  {
    globalIndex: 31536377,
    inclusionHeight: 1062409,
    address: '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U',
    spentTransactionId: null,
    boxId: 'c65fad07c680589c80cddcc6c4a431317c647955aaf0f3ded6f73c42d805466c',
    value: 1000000,
    ergoTree:
      '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
    assets: [
      {
        tokenId:
          'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a',
        amount: 1,
      },
      {
        tokenId:
          '6cbeec04af6a5047d8818eac2ac6e2b28e1e74a0d339cff96f7641a1a0c3ca9b',
        amount: 1,
      },
    ],
    creationHeight: 1062407,
    additionalRegisters: {
      R4: '1a02046572676f0763617264616e6f',
      R5: '1d0202c0cd78c2cd7802a0e8a308a2e8a308',
      R6: '1d020280cdad9d01c0cc8d080280cdad9d01c0cc8d08',
      R7: '1d020280d2f83e80859f0302b0ae15d08c01',
      R8: '1d020202a0c21e0202a0c21e',
      R9: '1d0202c801c80102c801c801',
    },
    transactionId:
      '15746bc84000118e0ae69cb6453494ab68fccef7df7a811b5e7c447db149649e',
    index: 2,
  },
  {
    globalIndex: 31536376,
    inclusionHeight: 1062409,
    address: '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U',
    spentTransactionId: null,
    boxId: '5dcf3609e8c449a8cd36c1310598448ff3aa920d0104ce4bef8b6dc132de4658',
    value: 1000000,
    ergoTree:
      '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
    assets: [
      {
        tokenId:
          'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a',
        amount: 1,
      },
      {
        tokenId:
          'ffacb76e5c75bdc72314777e781b9377a54f93654880d4390f7a67a929100898',
        amount: 1,
      },
    ],
    creationHeight: 1062407,
    additionalRegisters: {
      R4: '1a02046572676f0763617264616e6f',
      R5: '1d0202c0cd78c2cd7802a0e8a308a2e8a308',
      R6: '1d020280cdad9d0180a31e0280cdad9d0180a31e',
      R7: '1d020280d2f83ec09a0c02b0ae15f003',
      R8: '1d0202f801f80102f801f801',
      R9: '1d0202c801c80102c801c801',
    },
    transactionId:
      '15746bc84000118e0ae69cb6453494ab68fccef7df7a811b5e7c447db149649e',
    index: 1,
  },
  {
    globalIndex: 31536375,
    inclusionHeight: 1062409,
    address: '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U',
    spentTransactionId: null,
    boxId: '7def746de14a14756002c3dcaf19b3192d9cfb9ecb76c8c48eb7a8f8648675c2',
    value: 1000000,
    ergoTree:
      '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
    assets: [
      {
        tokenId:
          'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a',
        amount: 1,
      },
    ],
    creationHeight: 1062407,
    additionalRegisters: {
      R4: '1a02046572676f0763617264616e6f',
      R5: '1d0202c0cd78c2cd7802a0e8a308a2e8a308',
      R6: '1d020280cdad9d0180d0acf30e0280cdad9d0180d0acf30e',
      R7: '1d020280d2f83e80a0f8fa0502b0ae158092f401',
      R8: '1d02020280897a020280897a',
      R9: '1d0202c801c80102c801c801',
    },
    transactionId:
      '15746bc84000118e0ae69cb6453494ab68fccef7df7a811b5e7c447db149649e',
    index: 0,
  },
  {
    globalIndex: 31386000,
    inclusionHeight: 1058148,
    address: '9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U',
    spentTransactionId: null,
    boxId: '5289715465adc6b0e08617fb361cbdc691a11bd4ea3fb98898586ed18ec5d358',
    value: 1000000,
    ergoTree:
      '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
    assets: [],
    creationHeight: 1058145,
    additionalRegisters: {},
    transactionId:
      '2a37ae75434afe25bd3e9b802e5eceee90599d9e635eee1d7ea2179d9999e0be',
    index: 2,
  },
];

export const normalFeeBox = `{
  "boxId": "829f2e3bd7fa9d92eb4ade45cf4963d132ac5c179c0cf7de1e518268ae3929ba",
  "value": 500000,
  "ergoTree": "0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b",
  "assets": [
    {
      "tokenId": "c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a",
      "amount": 1
    }
  ],
  "additionalRegisters": {
    "R4": "1a030762696e616e63650763617264616e6f046572676f",
    "R7": "1d0203ba018c013c03c001a00150",
    "R5": "1c0203b40ab8a036cead0103920cc6e8439cdb02",
    "R6": "1d0203f80aa006c80103c00ce8079003",
    "R8": "0c1d0203023cf02e0228a01f0214d00f03023eb830022ae82002169811",
    "R9": "1d0203786450037a6652"
  },
  "creationHeight": 1000000,
  "transactionId": "956252e7b425b59802d478f0fa1dc297c47b1ace669a4532e5f0b06bf95b56ad",
  "index": 0
}`;

export const newChainFeeBox = `{
  "boxId": "58b634ddc3e50b77425eeacc2f413dd7d8b87a345b34dc3816424ce3345a6f28",
  "value": 500000,
  "ergoTree": "0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b",
  "assets": [
    {
      "tokenId": "c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a",
      "amount": 1
    }
  ],
  "additionalRegisters": {
    "R9": "1d0203780150037a6652",
    "R6": "1d0203f80a01c80103c00ce8079003",
    "R4": "1a030762696e616e63650763617264616e6f046572676f",
    "R7": "1d0203ba01013c03c001a00150",
    "R5": "1c0203b40a01cead0103920cc6e8439cdb02",
    "R8": "0c1d0203023cf02e0201010214d00f03023eb830022ae82002169811"
  },
  "creationHeight": 1000000,
  "transactionId": "956252e7b425b59802d478f0fa1dc297c47b1ace669a4532e5f0b06bf95b56ad",
  "index": 1
}`;

export const removeChainFeeBox = `{
  "boxId": "b93e75a40d8a32e5c1e438ecf69ce88a081648266a4b17b4e16fa9fa771eecfa",
  "value": 500000,
  "ergoTree": "0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b",
  "assets": [
    {
      "tokenId": "c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a",
      "amount": 1
    }
  ],
  "additionalRegisters": {
    "R7": "1d0203ba018c013c03c0010150",
    "R4": "1a030762696e616e63650763617264616e6f046572676f",
    "R5": "1c0203b40ab8a036cead0103920cc6e8439cdb02",
    "R6": "1d0203f80aa006c80103c00c019003",
    "R8": "0c1d0203023cf02e0228a01f0214d00f03023eb83002010102169811",
    "R9": "1d0203786450037a0152"
  },
  "creationHeight": 1000000,
  "transactionId": "956252e7b425b59802d478f0fa1dc297c47b1ace669a4532e5f0b06bf95b56ad",
  "index": 2
}`;

export const tokenNormalFeeBox = `{
  "boxId": "f2242b55f1d5dd2b6f2e794ae2e94e240742383c393d29317d79af127772c8c3",
  "value": 500000,
  "ergoTree": "0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b",
  "assets": [
    {
      "tokenId": "c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a",
      "amount": 1
    },
    {
      "tokenId": "6cbeec04af6a5047d8818eac2ac6e2b28e1e74a0d339cff96f7641a1a0c3ca9b",
      "amount": 1
    }
  ],
  "additionalRegisters": {
    "R4": "1a030762696e616e63650763617264616e6f046572676f",
    "R5": "1c0203b40ab8a036cead0103920cc6e8439cdb02",
    "R6": "1d0203f80aa006c80103c00ce8079003",
    "R7": "1d0203ba018c013c03c001a00150",
    "R8": "0c1d0203023cf02e0228a01f0214d00f03023eb830022ae82002169811",
    "R9": "1d0203786450037a6652"
  },
  "creationHeight": 1000000,
  "transactionId": "956252e7b425b59802d478f0fa1dc297c47b1ace669a4532e5f0b06bf95b56ad",
  "index": 3
}`;
