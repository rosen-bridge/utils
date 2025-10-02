import {
  BitcoinRunesTx,
  BitcoinRunesTxOutput,
} from '../../../lib/getRosenData/bitcoin-runes/types';

export const mockLockAddress =
  'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk';

export const baseTx: Pick<BitcoinRunesTx, 'id' | 'inputs'> = {
  id: 'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
  inputs: [
    {
      txId: '32a02f0d2612225bd41e82d60f80844ae006d10a836e80cef7a83d9ebb9fa92a',
      index: 0,
      scriptPubKey:
        '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
    },
  ],
};

export const txUtxos: Record<string, Pick<BitcoinRunesTx, 'outputs'>> = {
  lockTx: {
    outputs: [
      {
        scriptPubKey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        value: 3793n,
        runes: [{ runeId: '880887:3052', quantity: 750000n }],
      },
      {
        scriptPubKey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        value: 500n,
        runes: [{ runeId: '880887:3052', quantity: 250000n }],
      },
      {
        scriptPubKey: '6a5d0c160100f7e135ec1790a10f00',
        value: 0n,
        runes: [],
      },
      {
        scriptPubKey: '0014010000000000001388000000000000089839011b',
        value: 294n,
        runes: [],
      },
      {
        scriptPubKey: '00142eff6f19da9c786a5be52986e4fa888754f48fdc',
        value: 295n,
        runes: [],
      },
      {
        scriptPubKey: '001482639073e4b9827cba6224d854f00de94428ff00',
        value: 296n,
        runes: [],
      },
      {
        scriptPubKey: '001424e297ad5ab773a19ed6fac80c40de0000000000',
        value: 297n,
        runes: [],
      },
    ],
  },
  corruptData: {
    outputs: [
      {
        scriptPubKey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        value: 3793n,
        runes: [{ runeId: '880887:3052', quantity: 750000n }],
      },
      {
        scriptPubKey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        value: 500n,
        runes: [{ runeId: '880887:3052', quantity: 250000n }],
      },
      {
        scriptPubKey: '6a5d0c160100f7e135ec1790a10f00',
        value: 0n,
        runes: [],
      },
      {
        // corrupted toChain
        scriptPubKey: '0014500000000000001388000000000000089839011b',
        value: 294n,
        runes: [],
      },
      {
        scriptPubKey: '00142eff6f19da9c786a5be52986e4fa888754f48fdc',
        value: 295n,
        runes: [],
      },
      {
        scriptPubKey: '001482639073e4b9827cba6224d854f00de94428ff00',
        value: 296n,
        runes: [],
      },
      {
        scriptPubKey: '001424e297ad5ab773a19ed6fac80c40de0000000000',
        value: 297n,
        runes: [],
      },
    ],
  },
  unorderedTx: {
    outputs: [
      {
        scriptPubKey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        value: 500n,
        runes: [{ runeId: '880887:3052', quantity: 250000n }],
      },
      {
        scriptPubKey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        value: 3793n,
        runes: [{ runeId: '880887:3052', quantity: 750000n }],
      },
      {
        scriptPubKey: '6a5d0c160100f7e135ec1790a10f00',
        value: 0n,
        runes: [],
      },
      {
        scriptPubKey: '001482639073e4b9827cba6224d854f00de94428ff00',
        value: 296n,
        runes: [],
      },
      {
        scriptPubKey: '0014010000000000001388000000000000089839011b',
        value: 294n,
        runes: [],
      },
      {
        scriptPubKey: '00142eff6f19da9c786a5be52986e4fa888754f48fdc',
        value: 295n,
        runes: [],
      },
      {
        scriptPubKey: '001424e297ad5ab773a19ed6fac80c40de0000000000',
        value: 297n,
        runes: [],
      },
    ],
  },
  lessBoxes: {
    outputs: [
      {
        scriptPubKey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        value: 3793n,
        runes: [{ runeId: '880887:3052', quantity: 750000n }],
      },
      {
        scriptPubKey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        value: 500n,
        runes: [{ runeId: '880887:3052', quantity: 250000n }],
      },
      {
        scriptPubKey: '6a5d0c160100f7e135ec1790a10f00',
        value: 0n,
        runes: [],
      },
      {
        scriptPubKey: '0014010000000000001388000000000000089839011b',
        value: 294n,
        runes: [],
      },
    ],
  },
  noLock: {
    outputs: [
      {
        scriptPubKey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        value: 3793n,
        runes: [{ runeId: '880887:3052', quantity: 750000n }],
      },
      {
        scriptPubKey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb8',
        value: 500n,
        runes: [{ runeId: '880887:3052', quantity: 250000n }],
      },
      {
        scriptPubKey: '6a5d0c160100f7e135ec1790a10f00',
        value: 0n,
        runes: [],
      },
      {
        scriptPubKey: '0014010000000000001388000000000000089839011b',
        value: 294n,
        runes: [],
      },
      {
        scriptPubKey: '00142eff6f19da9c786a5be52986e4fa888754f48fdc',
        value: 295n,
        runes: [],
      },
      {
        scriptPubKey: '001482639073e4b9827cba6224d854f00de94428ff00',
        value: 296n,
        runes: [],
      },
      {
        scriptPubKey: '001424e297ad5ab773a19ed6fac80c40de0000000000',
        value: 297n,
        runes: [],
      },
    ],
  },
};

export const txs = {
  lockTx: {
    ...baseTx,
    ...txUtxos.lockTx,
  },
  corruptData: {
    ...baseTx,
    ...txUtxos.corruptData,
  },
  unorderedTx: {
    ...baseTx,
    ...txUtxos.unorderedTx,
  },
  lessBoxes: {
    ...baseTx,
    ...txUtxos.lessBoxes,
  },
  noLock: {
    ...baseTx,
    ...txUtxos.noLock,
  },
};

export const rosenData = {
  toChain: 'cardano',
  toAddress:
    'addr1qydjalm0r8dfc7r2t0jjnphyl2ygw4853lwgycusw0jtnqnuhf3zfkz57qx7j3pgluqzfc5h44dtwuapnmt04jqvgr0qwd9mqk',
  bridgeFee: '5000',
  networkFee: '2200',
  fromAddress:
    'box:32a02f0d2612225bd41e82d60f80844ae006d10a836e80cef7a83d9ebb9fa92a.0',
  sourceChainTokenId: '880887:3052',
  amount: '250000',
  targetChainTokenId:
    'e8699f09f993366363e2354a7520770ded59d23f5aeaad6717e73614.72706e52504f4352',
  sourceTxId:
    'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
  rawData:
    '010000000000001388000000000000089839011b2eff6f19da9c786a5be52986e4fa888754f48fdc82639073e4b9827cba6224d854f00de94428ff0024e297ad5ab773a19ed6fac80c40de0000000000',
};

export const opReturnScripts = {
  valid:
    '010000000000001388000000000000089839011b2eff6f19da9c786a5be52986e4fa888754f48fdc82639073e4b9827cba6224d854f00de94428ff0024e297ad5ab773a19ed6fac80c40de',
  invalidToChain:
    'ff0000000000001388000000000000089839011b2eff6f19da9c786a5be52986e4fa888754f48fdc82639073e4b9827cba6224d854f00de94428ff0024e297ad5ab773a19ed6fac80c40de',
};

export const opReturnData = {
  toChain: 'cardano',
  toAddress:
    'addr1qydjalm0r8dfc7r2t0jjnphyl2ygw4853lwgycusw0jtnqnuhf3zfkz57qx7j3pgluqzfc5h44dtwuapnmt04jqvgr0qwd9mqk',
  bridgeFee: '5000',
  networkFee: '2200',
};

export const lockUtxo: Record<string, BitcoinRunesTxOutput> = {
  valid: {
    scriptPubKey:
      '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
    value: 500n,
    runes: [{ runeId: '880887:3052', quantity: 250000n }],
  },
  noRune: {
    scriptPubKey:
      '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
    value: 500n,
    runes: [],
  },
  noSupportedRune: {
    scriptPubKey:
      '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
    value: 500n,
    runes: [{ runeId: '881887:3054', quantity: 250000n }],
  },
};
export const rosenAssetTransformations = {
  from: '880887:3052',
  to: '8b35fd2dabc9bdf2b69aa9c25eb7e7818297add61b2dd3b5ab039439e100e487',
  amount: '250000',
};
