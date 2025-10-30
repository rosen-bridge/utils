export const lockAddress = 'hs1qvq4029zf8zvms3pw6t9znju5wqte3hpykr8q3s';
export const lockAddressHash =
  '602af514493899b8442ed2ca29cb94701798dc24';

export const baseTx = {
  id: 'abc123cd9ed1ac1dbd6a9185fab6a34488325bec478ecfd26f76405ab1f2cd11d1',
  inputs: [
    {
      txId: 'fe18c9485e2944034e1612c15ffe42d032a5c5634227aca30d949404da5d85b8',
      index: 2,
    },
  ],
};

// Rosen data without OP_RETURN prefix (6a33)
const rosenDataHex =
  '000000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36';

export const txUtxos = {
  lockTx: {
    outputs: [
      {
        value: 0n,
        address: {
          version: 31, // OP_RETURN in Handshake
          hash: rosenDataHex,
          string: 'hs1lqqqqqqqq9a0przqqqqqqqqzexvqysxw96m6ma0gqachhulqqw0ahucl7dlhxedsy8rwl',
        },
      },
      {
        value: 100000n,
        address: {
          version: 0, // Witness v0
          hash: lockAddressHash,
          string: lockAddress,
        },
      },
    ],
  },
  lessBoxes: {
    outputs: [
      {
        value: 15594394312n,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
        },
      },
    ],
  },
  noOpReturn: {
    outputs: [
      {
        value: 10000000n,
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
      {
        value: 0n,
        address: {
          version: 31,
          hash: rosenDataHex,
          string: 'hs1lqqqqqqqq9a0przqqqqqqqqzexvqysxw96m6ma0gqachhulqqw0ahucl7dlhxedsy8rwl',
        },
      },
      {
        value: 15594394312n,
        address: {
          version: 0,
          hash: '3c57eac03143c004195bb5ab1fe67e5f88a2b0554104613', // Different hash
          string: 'hs1q83t74spnrspqgx273k4rle3lu40g52c92sg5vyn',
        },
      },
    ],
  },
  invalidData: {
    outputs: [
      {
        value: 0n,
        address: {
          version: 31,
          hash: '090000000005f5e10000000000009896802103e5bedab3f782ef17a73e9bdc41ee0e18c3ab477400f35bcf7caa54171db7ff36',
          string: 'hs1lpyqqqqqq9a0przqqqqqqqqzexvqysxw96m6ma0gqachhulqqw0ahucl7dlhxeaqhp8u7',
        },
      },
      {
        value: 15594394312n,
        address: {
          version: 0,
          hash: lockAddressHash,
          string: lockAddress,
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
  noOpReturn: {
    ...baseTx,
    ...txUtxos.noOpReturn,
  },
  noLock: {
    ...baseTx,
    ...txUtxos.noLock,
  },
  invalidData: {
    ...baseTx,
    ...txUtxos.invalidData,
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
  rawData: rosenDataHex,
};

export const lockUtxo = {
  value: 100000n,
  address: {
    version: 0,
    hash: lockAddressHash,
    string: lockAddress,
  },
};

export const hnsTransformation = {
  from: 'hns',
  to: 'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  amount: '100000',
};
