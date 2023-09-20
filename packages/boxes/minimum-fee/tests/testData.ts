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
