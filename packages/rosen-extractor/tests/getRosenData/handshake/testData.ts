export const lockAddress = 'hs1qqzs0e6rrkr0r85e4h6m8xq7457ca07sh6ezhpv';
export const lockAddressHash = '00a0fce863b0de33d335beb67303d5a7b1d7fa17';

export const baseTx = {
  id: 'abc123cd9ed1ac1dbd6a9185fab6a34488325bec478ecfd26f76405ab1f2cd11d1',
  inputs: [
    {
      txId: 'fe18c9485e2944034e1612c15ffe42d032a5c5634227aca30d949404da5d85b8',
      index: 2,
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

const changeAddress = 'hs1qklfprkfm3cr3ktefsgksl02rfjt38ax234gwyq';
const changeAddressHash = 'b7d211d93b8e071b2f29822d0fbd434c9713f4ca';

export const txUtxos = {
  lockTx: {
    outputs: [
      // Data output 0: chunk 0 at value 1000
      {
        value: 1000n,
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
      // Data output 1: chunk 1 at value 1001
      {
        value: 1001n,
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
      // Data output 2: chunk 2 at value 1002
      {
        value: 1002n,
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
        value: 100000n,
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
        value: 50000n,
        address: {
          version: 0,
          hash: changeAddressHash,
          string: changeAddress,
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
    outputs: [
      {
        value: 100000n,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
        },
      },
    ],
  },
  noDataOutputs: {
    outputs: [
      {
        value: 100000n,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
        },
      },
      {
        value: 15584394312n,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
        },
      },
    ],
  },
  noLock: {
    outputs: [
      // Data output at value 1000 (no lock output)
      {
        value: 1000n,
        address: {
          version: 0,
          hash: dataChunk0,
          string:
            'hs1qqqqqqqqqq0pdypgslz72mqqyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3v2yzd',
        },
      },
      {
        value: 15594394312n,
        address: {
          version: 0,
          hash: '3c57eac03143c004195bb5ab1fe67e5f88a2b0554104613', // Different hash (not lock)
          string: 'hs1q83t74spnrspqgx273k4rle3lu40g52c92sg5vyn',
        },
      },
    ],
  },
  invalidData: {
    outputs: [
      {
        value: 100000n,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
        },
      },
      // Data output with invalid chunk (toChain code 64 = invalid)
      {
        value: 1000n,
        address: {
          version: 0,
          hash: '640000000005f5e10000000000009896', // Invalid toChain code
          string:
            'hs1qqqqqqqqqq0pdypgslz72mqqyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3v2yzd',
        },
      },
    ],
  },
  invalidLockCovenant: {
    outputs: [
      {
        value: 1000n,
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
      {
        value: 1001n,
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
      {
        value: 1002n,
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
      {
        value: 100000n,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
        },
        covenant: {
          type: 1,
          action: '',
          items: [],
        },
      },
      {
        value: 50000n,
        address: {
          version: 0,
          hash: changeAddressHash,
          string: changeAddress,
        },
        covenant: {
          type: 0,
          action: '',
          items: [],
        },
      },
    ],
  },
  unorderedTx: {
    outputs: [
      // Data output 1: chunk 1 at value 1001 (out of order)
      {
        value: 1001n,
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
      // Data output 0: chunk 0 at value 1000 (out of order)
      {
        value: 1000n,
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
      // Data output 2: chunk 2 at value 1002 (out of order)
      {
        value: 1002n,
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
        value: 100000n,
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
        value: 50000n,
        address: {
          version: 0,
          hash: changeAddressHash,
          string: changeAddress,
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
  invalidLockCovenant: {
    ...baseTx,
    ...txUtxos.invalidLockCovenant,
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
  rawData: `${dataChunk0}:1000,${dataChunk1}:1001,${dataChunk2}:1002,${lockAddressHash}:100000,${changeAddressHash}:50000`,
};

export const rosenDataUnordered = {
  ...rosenData,
  rawData: `${dataChunk1}:1001,${dataChunk0}:1000,${dataChunk2}:1002,${lockAddressHash}:100000,${changeAddressHash}:50000`,
};

export const lockUtxo = {
  value: 100000n,
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
