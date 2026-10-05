import { BitcoinCashRpcTransaction } from '../../../lib/bitcoinCash';

/**
 * One-input BCH UI lock recorded on isolated BCHN 29.1.0 regtest on
 * 2026-10-01. Parent, unsigned and signed bytes are preserved verbatim.
 * This offline fixture contains only public scripts and pre-signed bytes;
 * replay does not establish chain inclusion, maturity, or current node policy.
 * The treasury CashAddr uses the mainnet prefix for the extractor API;
 * the same locking script was used on regtest. Asset mapping is synthetic.
 * Replay from the Utils root with the ordinary workspace test script:
 * npm run test --workspace @rosen-bridge/rosen-extractor -- --run
 * tests/getRosenData/bitcoin-cash/bitcoinCashRpcRosenExtractor.canonical.spec.ts
 * tests/getRosenData/bitcoin-cash/bitcoinCashRosenExtractor.canonical.spec.ts
 * tests/getRosenData/bitcoin-cash/canonicalLockTestUtils.spec.ts
 * (Pass the three relative spec paths on the same command line.)
 */
export const canonicalLock = {
  parentTransactionHex:
    '02000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0c510101082f454233322e302fffffffff0100f2052a010000001976a914751e76e8199196d454941c45d1b3a323f1433bd688ac00000000',
  parentTxId:
    '32b7770b3a9f946d9078165a6e0f1ab44c4befbc5176e07a9fe8a5e71c42c240',
  parentIndex: 0,
  parentValueSatoshis: '5000000000',
  sourceScript: '76a914751e76e8199196d454941c45d1b3a323f1433bd688ac',
  treasuryScript: '76a914222222222222222222222222222222222222222288ac',
  unsignedHex:
    '020000000140c2421ce7a5e89f7ae07651bcef4b4cb41a0f6e5a1678906d949f3a0b77b7320000000000ffffffff03a0860100000000001976a914222222222222222222222222222222222222222288ac0000000000000000356a3300000000000000006400000000000000642103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a93392069042a010000001976a914751e76e8199196d454941c45d1b3a323f1433bd688ac00000000',
  signedHex:
    '020000000140c2421ce7a5e89f7ae07651bcef4b4cb41a0f6e5a1678906d949f3a0b77b732000000006441cb72069f8986e9391641575689cb54b00b86ef805a4719ebf4be2a65178e3a17cef97d006cbc08dfd3e7e296cc97594e9465e98500bbd7f2a32ef526f4a6034641210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ffffffff03a0860100000000001976a914222222222222222222222222222222222222222288ac0000000000000000356a3300000000000000006400000000000000642103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a93392069042a010000001976a914751e76e8199196d454941c45d1b3a323f1433bd688ac00000000',
  txId: '0ad574daa5b9311754447d2f93ee46e3a0b273cfe5607706cc5373a30f3504eb',
  unsignedTxId:
    '27bea0cbb2360837a6add1f38c80a6bf6f1b8697aaac39851f7c250caeaba5ff',
  /** SHA-256 over decoded hexadecimal bytes, not their textual encoding. */
  parentSha256:
    'ca4436cd802bd200b065b39c233080fe41b48b8427907c61695521da0bcba5e0',
  unsignedSha256:
    '0c164ad982ab8d3773401d8ea0b41e0d898d38f44fb6cfdec1721661e13259c0',
  signedSha256:
    'ea9ed2e0bdcc2a06acb1443032e0412657a62dcd487a5a43eaa27efdbdc19433',
  amountSatoshis: '100000',
  changeSatoshis: '4999899424',
  minerFeeSatoshis: '576',
  signedSizeBytes: 281,
  /** Rosen fee fields are integer wrapped-asset units, six decimals here. */
  bridgeFee: '100',
  networkFee: '100',
  wrappedAmount: '1000',
  sourceDecimals: 8,
  wrappedDecimals: 6,
  targetTokenId:
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  destinationAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  metadataHex:
    '6a3300000000000000006400000000000000642103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
};

/** Exact RPC-required projection: BCH decimal text avoids floating rounding. */
export const canonicalLockRpc: BitcoinCashRpcTransaction = {
  hex: canonicalLock.signedHex,
  txid: canonicalLock.txId,
  vin: [{ txid: canonicalLock.parentTxId, vout: canonicalLock.parentIndex }],
  vout: [
    {
      n: 0,
      value: '0.00100000',
      scriptPubKey: { hex: canonicalLock.treasuryScript },
    },
    {
      n: 1,
      value: '0.00000000',
      scriptPubKey: { hex: canonicalLock.metadataHex },
    },
    {
      n: 2,
      value: '49.99899424',
      scriptPubKey: { hex: canonicalLock.sourceScript },
    },
  ],
};

/** Raw extractor fields; amount is source satoshis before inherited wrapping. */
export const canonicalLockRawData = {
  toChain: 'ergo',
  toAddress: canonicalLock.destinationAddress,
  bridgeFee: canonicalLock.bridgeFee,
  networkFee: canonicalLock.networkFee,
  rawData: canonicalLock.metadataHex,
  fromAddress: `box:${canonicalLock.parentTxId}.${canonicalLock.parentIndex}`,
  sourceChainTokenId: 'bch',
  amount: canonicalLock.amountSatoshis,
  targetChainTokenId: canonicalLock.targetTokenId,
  sourceTxId: canonicalLock.txId,
};

/** Scanner/Guard-facing get output wraps once to six-decimal asset units. */
export const canonicalLockWrappedData = {
  ...canonicalLockRawData,
  amount: canonicalLock.wrappedAmount,
};
