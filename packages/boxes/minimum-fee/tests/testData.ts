import { FeeConfig } from '../lib';

/**
 * R4: ["ergo", "cardano"]
 * R5 [ [ "988000" ], [ "8682000"] ]
 * R6 [ [ "2000000000" ], [ "2000000000" ] ]
 * R7 [ [ "800000000" ], [ "2000000" ] ]
 * R8 [ [ "37000" ], [ "37000" ] ]
 * R9 [ [ "100"], [ "100" ] ]
 */
export const nativeConfigBox = `{
  "boxId": "d3b3c7e2b1a8a3e69372e360d8565eac19d87f6d9b237ae0f4f7ab87972b76e3",
  "transactionId": "8d8f49c9423443079a560adfc806271408cc9776b9d0e6db45ff9932ad11c168",
  "blockId": "7b16021215ce9ee3af6c35924423e71bf030d0a7b7f356713ae22e00b0dd5087",
  "value": 20000000,
  "index": 1,
  "globalIndex": 28520647,
  "creationHeight": 988606,
  "settlementHeight": 988608,
  "ergoTree": "0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b",
  "address": "9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U",
  "assets": [
    {
      "tokenId": "1ea49e1c052803576e91275b27dffbae3f4ccad9da5219bcda51ea5006fe7661",
      "index": 0,
      "amount": 1,
      "name": "Rosen-Minimum-Fee.V-test2",
      "decimals": 0,
      "type": "EIP-004"
    }
  ],
  "additionalRegisters": {
    "R5": {
      "serializedValue": "1d0201c0cd7801a0e8a308",
      "sigmaType": "Coll[Coll[SLong]]",
      "renderedValue": "[[988000],[8682000]]"
    },
    "R6": {
      "serializedValue": "1d020180d0acf30e0180d0acf30e",
      "sigmaType": "Coll[Coll[SLong]]",
      "renderedValue": "[[2000000000],[2000000000]]"
    },
    "R8": {
      "serializedValue": "1d020190c2040190c204",
      "sigmaType": "Coll[Coll[SLong]]",
      "renderedValue": "[[37000],[37000]]"
    },
    "R7": {
      "serializedValue": "1d020180a0f8fa05018092f401",
      "sigmaType": "Coll[Coll[SLong]]",
      "renderedValue": "[[800000000],[2000000]]"
    },
    "R9": {
      "serializedValue": "1d0201c80101c801",
      "sigmaType": "Coll[Coll[SLong]]",
      "renderedValue": "[[100],[100]]"
    },
    "R4": {
      "serializedValue": "1a02046572676f0763617264616e6f",
      "sigmaType": "Coll[Coll[SByte]]",
      "renderedValue": "[6572676f,63617264616e6f]"
    }
  },
  "spentTransactionId": null,
  "mainChain": true
}`;
export const nativeTokenFeeConfig: FeeConfig = {
  ergo: {
    '988000': {
      bridgeFee: BigInt('2000000000'),
      networkFee: BigInt('800000000'),
      rsnRatio: BigInt('37000'),
      feeRatio: BigInt('100'),
    },
  },
  cardano: {
    '8682000': {
      bridgeFee: BigInt('2000000000'),
      networkFee: BigInt('2000000'),
      rsnRatio: BigInt('37000'),
      feeRatio: BigInt('100'),
    },
  },
};

/**
 * R4: ["ergo", "cardano"]
 * R5 [ [ "988000" ], [ "8682000"] ]
 * R6 [ [ "8500000" ], [ "8500000" ] ]
 * R7 [ [ "3400000" ], [ "9000" ] ]
 * R8 [ [ "8505" ], [ "8505" ] ]
 * R9 [ [ "100"], [ "100" ] ]
 */
export const tokenConfigBox = `{
  "boxId": "6eab26922a32dc7fa5fa4fcf38f5d8bd60a407abb06e7e8112bae48c3689f82f",
  "transactionId": "8d8f49c9423443079a560adfc806271408cc9776b9d0e6db45ff9932ad11c168",
  "blockId": "7b16021215ce9ee3af6c35924423e71bf030d0a7b7f356713ae22e00b0dd5087",
  "value": 20000000,
  "index": 2,
  "globalIndex": 28520648,
  "creationHeight": 988606,
  "settlementHeight": 988608,
  "ergoTree": "0008cd02b2623a06a2497e11a79352187094d41409369d8525180a8e8f7e751ae1b28c6b",
  "address": "9fsd61VwCBMZaFGctm8q7v59FsS67KusD5yHDhuwQc6KFfFX34U",
  "assets": [
    {
      "tokenId": "1ea49e1c052803576e91275b27dffbae3f4ccad9da5219bcda51ea5006fe7661",
      "index": 0,
      "amount": 1,
      "name": "Rosen-Minimum-Fee.V-test2",
      "decimals": 0,
      "type": "EIP-004"
    },
    {
      "tokenId": "38cb230f68a28436fb3b73ae4b927626673e4620bc7c94896178567d436e416b",
      "index": 1,
      "amount": 1,
      "name": "RstAdaVTest2",
      "decimals": 6,
      "type": "EIP-004"
    }
  ],
  "additionalRegisters": {
    "R5": {
      "serializedValue": "1d0201c0cd7801a0e8a308",
      "sigmaType": "Coll[Coll[SLong]]",
      "renderedValue": "[[988000],[8682000]]"
    },
    "R6": {
      "serializedValue": "1d0201c0cc8d0801c0cc8d08",
      "sigmaType": "Coll[Coll[SLong]]",
      "renderedValue": "[[8500000],[8500000]]"
    },
    "R8": {
      "serializedValue": "1d0201f2840101f28401",
      "sigmaType": "Coll[Coll[SLong]]",
      "renderedValue": "[[8505],[8505]]"
    },
    "R7": {
      "serializedValue": "1d020180859f0301d08c01",
      "sigmaType": "Coll[Coll[SLong]]",
      "renderedValue": "[[3400000],[9000]]"
    },
    "R9": {
      "serializedValue": "1d0201c80101c801",
      "sigmaType": "Coll[Coll[SLong]]",
      "renderedValue": "[[100],[100]]"
    },
    "R4": {
      "serializedValue": "1a02046572676f0763617264616e6f",
      "sigmaType": "Coll[Coll[SByte]]",
      "renderedValue": "[6572676f,63617264616e6f]"
    }
  },
  "spentTransactionId": null,
  "mainChain": true
}`;
export const tokenFeeConfig: FeeConfig = {
  ergo: {
    '988000': {
      bridgeFee: BigInt('8500000'),
      networkFee: BigInt('3400000'),
      rsnRatio: BigInt('8505'),
      feeRatio: BigInt('100'),
    },
  },
  cardano: {
    '8682000': {
      bridgeFee: BigInt('8500000'),
      networkFee: BigInt('9000'),
      rsnRatio: BigInt('8505'),
      feeRatio: BigInt('100'),
    },
  },
};

export const tokenId =
  '38cb230f68a28436fb3b73ae4b927626673e4620bc7c94896178567d436e416b';
