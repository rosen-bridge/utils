import { ErgoBoxWrapper, Fee } from '@rosen-bridge/minimum-fee';

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

export const normalFeeWith4Fees: Array<Fee> = [
  {
    heights: { ergo: 11111 },
    configs: {
      ergo: {
        bridgeFee: 100n,
        networkFee: 30n,
        rsnRatio: 10n,
        rsnRatioDivisor: 1000n,
        feeRatio: 40n,
      },
    },
  },
  {
    heights: { ergo: 22222 },
    configs: {
      ergo: {
        bridgeFee: 200n,
        networkFee: 40n,
        rsnRatio: 11n,
        rsnRatioDivisor: 1100n,
        feeRatio: 41n,
      },
    },
  },
  {
    heights: { ergo: 33333 },
    configs: {
      ergo: {
        bridgeFee: 500n,
        networkFee: 80n,
        rsnRatio: 21n,
        rsnRatioDivisor: 2100n,
        feeRatio: 51n,
      },
    },
  },
  {
    heights: { ergo: 44444 },
    configs: {
      ergo: {
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

export const unusedCardanoChainFee: Array<Fee> = [
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

export const removedPreviousChainFee: Array<Fee> = [
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

export const normalFeeBox: ErgoBoxWrapper = {
  boxId: '829f2e3bd7fa9d92eb4ade45cf4963d132ac5c179c0cf7de1e518268ae3929ba',
  txId: '956252e7b425b59802d478f0fa1dc297c47b1ace669a4532e5f0b06bf95b56ad',
  address: '',
  index: 0,
  value: 500000n,
  creationHeight: 1000000,
  assets: [
    {
      tokenId:
        'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a',
      amount: 1n,
    },
  ],
  additionalRegisters: {
    R4: '1a030762696e616e63650763617264616e6f046572676f',
    R7: '1d0203ba018c013c03c001a00150',
    R5: '1c0203b40ab8a036cead0103920cc6e8439cdb02',
    R6: '1d0203f80aa006c80103c00ce8079003',
    R8: '0c1d0203023cf02e0228a01f0214d00f03023eb830022ae82002169811',
    R9: '1d0203786450037a6652',
  },
  ergoTree:
    '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
  globalIndex: 0n,
  spentTransactionId: '',
};

export const removeChainFeeBox: ErgoBoxWrapper = {
  boxId: 'b93e75a40d8a32e5c1e438ecf69ce88a081648266a4b17b4e16fa9fa771eecfa',
  txId: '956252e7b425b59802d478f0fa1dc297c47b1ace669a4532e5f0b06bf95b56ad',
  address: '',
  index: 2,
  value: 500000n,
  creationHeight: 1000000,
  assets: [
    {
      tokenId:
        'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a',
      amount: 1n,
    },
  ],
  additionalRegisters: {
    R7: '1d0203ba018c013c03c0010150',
    R4: '1a030762696e616e63650763617264616e6f046572676f',
    R5: '1c0203b40ab8a036cead0103920cc6e8439cdb02',
    R6: '1d0203f80aa006c80103c00c019003',
    R8: '0c1d0203023cf02e0228a01f0214d00f03023eb83002010102169811',
    R9: '1d0203786450037a0152',
  },
  ergoTree:
    '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
  globalIndex: 0n,
  spentTransactionId: '',
};

export const tokenNormalFeeBox: ErgoBoxWrapper = {
  boxId: 'f2242b55f1d5dd2b6f2e794ae2e94e240742383c393d29317d79af127772c8c3',
  txId: '956252e7b425b59802d478f0fa1dc297c47b1ace669a4532e5f0b06bf95b56ad',
  address: '',
  index: 3,
  value: 500000n,
  creationHeight: 1000000,
  assets: [
    {
      tokenId:
        'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a',
      amount: 1n,
    },
    {
      tokenId:
        '6cbeec04af6a5047d8818eac2ac6e2b28e1e74a0d339cff96f7641a1a0c3ca9b',
      amount: 1n,
    },
  ],
  additionalRegisters: {
    R4: '1a030762696e616e63650763617264616e6f046572676f',
    R5: '1c0203b40ab8a036cead0103920cc6e8439cdb02',
    R6: '1d0203f80aa006c80103c00ce8079003',
    R7: '1d0203ba018c013c03c001a00150',
    R8: '0c1d0203023cf02e0228a01f0214d00f03023eb830022ae82002169811',
    R9: '1d0203786450037a6652',
  },
  ergoTree:
    '0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b',
  globalIndex: 0n,
  spentTransactionId: '',
};
