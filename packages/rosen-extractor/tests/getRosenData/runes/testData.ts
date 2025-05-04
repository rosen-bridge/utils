export const lockAddress =
  'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk';

export const baseTx = {
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
export const txUtxos = {
  lockTx: {
    outputs: [
      {
        scriptPubKey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        value: 500n,
      },
      {
        scriptPubKey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        value: 3793n,
      },
      {
        scriptPubKey: '6a5d0c160100f7e135ec1790a10f00',
        value: 0n,
      },
      {
        scriptPubKey: '0014010000000000001388000000000000089839011b',
        value: 294n,
      },
      {
        scriptPubKey: '00142eff6f19da9c786a5be52986e4fa888754f48fdc',
        value: 295n,
      },
      {
        scriptPubKey: '001482639073e4b9827cba6224d854f00de94428ff00',
        value: 296n,
      },
      {
        scriptPubKey: '001424e297ad5ab773a19ed6fac80c40de0000000000',
        value: 297n,
      },
    ],
  },
  lessBoxes: {
    outputs: [
      {
        scriptPubKey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        value: 500n,
      },
      {
        scriptPubKey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        value: 3793n,
      },
      {
        scriptPubKey: '6a5d0c160100f7e135ec1790a10f00',
        value: 0n,
      },
      {
        scriptPubKey: '0014010000000000001388000000000000089839011b',
        value: 294n,
      },
      {
        scriptPubKey: '00142eff6f19da9c786a5be52986e4fa888754f48fdc',
        value: 295n,
      },
      {
        scriptPubKey: '001482639073e4b9827cba6224d854f00de94428ff00',
        value: 296n,
      },
    ],
  },
  noLock: {
    outputs: [
      {
        scriptPubKey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb8',
        value: 500n,
      },
      {
        scriptPubKey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        value: 3793n,
      },
      {
        scriptPubKey: '6a5d0c160100f7e135ec1790a10f00',
        value: 0n,
      },
      {
        scriptPubKey: '0014010000000000001388000000000000089839011b',
        value: 294n,
      },
      {
        scriptPubKey: '00142eff6f19da9c786a5be52986e4fa888754f48fdc',
        value: 295n,
      },
      {
        scriptPubKey: '001482639073e4b9827cba6224d854f00de94428ff00',
        value: 296n,
      },
      {
        scriptPubKey: '001424e297ad5ab773a19ed6fac80c40de0000000000',
        value: 297n,
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
  sourceChainTokenId: 'undefined',
  amount: '0',
  targetChainTokenId: 'undefined',
  sourceTxId:
    'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
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
