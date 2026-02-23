export const lockAddress = 'hs1qvq4029zf8zvms3pw6t9znju5wqte3hpykr8q3s';
export const lockAddressHash = '602af514493899b8442ed2ca29cb94701798dc24';

const baseTx = {
  txid: 'abc123cd9ed1ac1dbd6a9185fab6a34488325bec478ecfd26f76405ab1f2cd11d1',
  hash: 'abc123cd9ed1ac1dbd6a9185fab6a34488325bec478ecfd26f76405ab1f2cd11d1',
  version: 1,
  size: 225,
  vsize: 225,
  locktime: 0,
  vin: [
    {
      txid: 'fe18c9485e2944034e1612c15ffe42d032a5c5634227aca30d949404da5d85b8',
      vout: 2,
      txinwitness: [],
      sequence: 4294967295,
    },
  ],
};

// Rosen data hex (60 bytes total, reconstructed from 3 P2WPKH outputs):
// Chunk 0: 000000000005f5e10000000000009896802103e5 (40 hex chars / 20 bytes)
// Chunk 1: bedab3f782ef17a73e9bdc41ee0e18c3ab477400 (40 hex chars / 20 bytes)
// Chunk 2: f35bcf7caa54171db7ff36000000000000000000 (40 hex chars / 20 bytes, padded)
// Data output hashes (from chunked rosenDataHex - 40 chars per chunk for P2WPKH)
const dataChunk0 = '000000000005f5e10000000000009896802103e5';
const dataChunk1 = 'bedab3f782ef17a73e9bdc41ee0e18c3ab477400';
const dataChunk2 = 'f35bcf7caa54171db7ff36000000000000000000';

export const txUtxos = {
  lockTx: {
    vout: [
      // Data output 0: chunk 0 at value 0.001 (1000 dollarydoos)
      {
        value: 0.001,
        n: 0,
        address: {
          version: 0,
          hash: dataChunk0,
          string:
            'hs1qqqqqqqqqq0pdypgslz72mqqyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3v2yzd',
        },
        covenant: {
          type: 0,
          action: '',
          items: [],
        },
      },
      // Data output 1: chunk 1 at value 0.001001 (1001 dollarydoos)
      {
        value: 0.001001,
        n: 1,
        address: {
          version: 0,
          hash: dataChunk1,
          string:
            'hs1qqgqqq7gzvh5gw6gvqq5gvqq5gvqq5gvqq5gvqq5gvqq5gvqq5gvqq5gq0tymtt',
        },
        covenant: {
          type: 0,
          action: '',
          items: [],
        },
      },
      // Data output 2: chunk 2 at value 0.001002 (1002 dollarydoos)
      {
        value: 0.001002,
        n: 2,
        address: {
          version: 0,
          hash: dataChunk2,
          string:
            'hs1qqepqz7p9qqvq9qqvq9qqvq9qqvq9qqvq9qqvq9qqvq9qqvq9qqvq9qq0mh80w',
        },
        covenant: {
          type: 0,
          action: '',
          items: [],
        },
      },
      // Lock output
      {
        value: 0.1,
        n: 3,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
        },
        covenant: {
          type: 0,
          action: '',
          items: [],
        },
      },
      // Change output
      {
        value: 0.05,
        n: 4,
        address: {
          version: 0,
          hash: 'abcdef0123456789abcdef0123456789abcdef01',
          string: 'hs1q5cd7v36rvmt9pmcn9zznuaqfd70j2c303y50ve',
        },
        covenant: {
          type: 0,
          action: '',
          items: [],
        },
      },
    ],
  },
  lessBoxes: {
    vout: [
      {
        value: 155.94394312,
        n: 0,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
        },
      },
    ],
  },
  noDataOutputs: {
    vout: [
      {
        value: 0.1,
        n: 0,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
        },
      },
      {
        value: 155.84394312,
        n: 1,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
        },
      },
    ],
  },
  noLock: {
    vout: [
      // Data output at value 0.001 (1000 dollarydoos, no lock output)
      {
        value: 0.001,
        n: 0,
        address: {
          version: 0,
          hash: dataChunk0,
          string:
            'hs1qqqqqqqqqq0pdypgslz72mqqyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3v2yzd',
        },
      },
      {
        value: 155.94394312,
        n: 1,
        address: {
          version: 0,
          hash: '3c57eac03143c004195bb5ab1fe67e5f88a2b0554104613', // Different hash (not lock)
          string: 'hs1q83t74spnrspqgx273k4rle3lu40g52c92sg5vyn',
        },
      },
    ],
  },
  invalidData: {
    vout: [
      {
        value: 0.1,
        n: 0,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
        },
      },
      // Data output with invalid chunk (toChain code 64 = invalid)
      {
        value: 0.001,
        n: 1,
        address: {
          version: 0,
          hash: '640000000005f5e10000000000009896', // Invalid toChain code
          string:
            'hs1qqqqqqqqqq0pdypgslz72mqqyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3v2yzd',
        },
      },
    ],
  },
  unorderedTx: {
    vout: [
      // Data output 1: chunk 1 at value 0.001001 (1001 dollarydoos, out of order)
      {
        value: 0.001001,
        n: 0,
        address: {
          version: 0,
          hash: dataChunk1,
          string:
            'hs1qqgqqq7gzvh5gw6gvqq5gvqq5gvqq5gvqq5gvqq5gvqq5gvqq5gvqq5gq0tymtt',
        },
        covenant: {
          type: 0,
          action: '',
          items: [],
        },
      },
      // Data output 0: chunk 0 at value 0.001 (1000 dollarydoos, out of order)
      {
        value: 0.001,
        n: 1,
        address: {
          version: 0,
          hash: dataChunk0,
          string:
            'hs1qqqqqqqqqq0pdypgslz72mqqyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3v2yzd',
        },
        covenant: {
          type: 0,
          action: '',
          items: [],
        },
      },
      // Data output 2: chunk 2 at value 0.001002 (1002 dollarydoos, out of order)
      {
        value: 0.001002,
        n: 2,
        address: {
          version: 0,
          hash: dataChunk2,
          string:
            'hs1qqepqz7p9qqvq9qqvq9qqvq9qqvq9qqvq9qqvq9qqvq9qqvq9qqvq9qq0mh80w',
        },
        covenant: {
          type: 0,
          action: '',
          items: [],
        },
      },
      // Lock output
      {
        value: 0.1,
        n: 3,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
        },
        covenant: {
          type: 0,
          action: '',
          items: [],
        },
      },
      // Change output
      {
        value: 0.05,
        n: 4,
        address: {
          version: 0,
          hash: 'abcdef0123456789abcdef0123456789abcdef01',
          string: 'hs1q5cd7v36rvmt9pmcn9zznuaqfd70j2c303y50ve',
        },
        covenant: {
          type: 0,
          action: '',
          items: [],
        },
      },
    ],
  },
};

export const txs = {
  lockTx: {
    ...baseTx,
    ...txUtxos.lockTx,
  },
  lessBoxes: {
    ...baseTx,
    ...txUtxos.lessBoxes,
  },
  noDataOutputs: {
    ...baseTx,
    ...txUtxos.noDataOutputs,
  },
  noLock: {
    ...baseTx,
    ...txUtxos.noLock,
  },
  invalidData: {
    ...baseTx,
    ...txUtxos.invalidData,
  },
  unorderedTx: {
    ...baseTx,
    ...txUtxos.unorderedTx,
  },
};

export const rosenData = {
  toChain: 'ergo',
  toAddress: '9iCzESRfvKU6Axyt3BnBuVrYW3ZYj3knPF95STzrjaRrjtTcj9R',
  bridgeFee: '100000000',
  networkFee: '10000000',
  fromAddress:
    'box:fe18c9485e2944034e1612c15ffe42d032a5c5634227aca30d949404da5d85b8.2',
  sourceChainTokenId: 'hns',
  amount: '100000',
  targetChainTokenId:
    'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  sourceTxId:
    'abc123cd9ed1ac1dbd6a9185fab6a34488325bec478ecfd26f76405ab1f2cd11d1',
  rawData: `${dataChunk0}:0.001,${dataChunk1}:0.001001,${dataChunk2}:0.001002,${lockAddressHash}:0.1,abcdef0123456789abcdef0123456789abcdef01:0.05`,
};

export const rosenDataUnordered = {
  ...rosenData,
  rawData: `${dataChunk1}:0.001001,${dataChunk0}:0.001,${dataChunk2}:0.001002,${lockAddressHash}:0.1,abcdef0123456789abcdef0123456789abcdef01:0.05`,
};

export const lockUtxo = {
  n: 1,
  value: 0.1,
  address: {
    version: 0,
    hash: lockAddressHash,
    string: lockAddress,
  },
  covenant: {
    type: 0,
    action: '',
    items: [],
  },
};

export const hnsTransformation = {
  from: 'hns',
  to: 'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  amount: '100000',
};
