export const mockLockAddress =
  'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk';

export const baseTx = {
  txid: 'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
  version: 2,
  locktime: 0,
  size: 0,
  weight: 0,
  fee: 12000,
  status: {
    confirmed: true,
    block_height: 828669,
    block_hash:
      '00000000000000f00f6cd48bce528e90543e92b99a56ba6a9638abf8650c0c3c',
    block_time: 1706930825,
  },
  vin: [
    {
      txid: '32a02f0d2612225bd41e82d60f80844ae006d10a836e80cef7a83d9ebb9fa92a',
      vout: 0,
      prevout: {
        scriptpubkey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        scriptpubkey_asm:
          'OP_1 6049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        scriptpubkey_type: 'V1_P2TR',
        scriptpubkey_address:
          'bc1pvpyum6lxgrfr675wz8v9jxk2jmqvm9nzdly9p2cmvhnawhl0tvtsz73adv',
        value: 6000,
      },
      scriptsig: '',
      scriptsig_asm: '',
      witness: [
        'b435ab4a123da05904df5a6e60678ff0bda2f6353b4cf3392dcdda62dad22ce07ccce654c5360b738b4cba08b346ae89eec63bf865aeb285266c0064c36b44d9',
      ],
      is_coinbase: false,
      sequence: 4294967295,
    },
  ],
};

export const txUtxos = {
  lockTx: {
    vout: [
      {
        scriptpubkey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        scriptpubkey_asm:
          'OP_1 33fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        scriptpubkey_type: 'V1_P2TR',
        scriptpubkey_address:
          'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
        value: 500,
      },
      {
        scriptpubkey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        scriptpubkey_asm:
          'OP_1 6049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        scriptpubkey_type: 'V1_P2TR',
        scriptpubkey_address:
          'bc1pvpyum6lxgrfr675wz8v9jxk2jmqvm9nzdly9p2cmvhnawhl0tvtsz73adv',
        value: 3793,
      },
      {
        scriptpubkey: '6a5d0c160100f7e135ec1790a10f00',
        scriptpubkey_asm: 'OP_RETURN OP_13 160100f7e135ec1790a10f00',
        scriptpubkey_type: 'OP_RETURN',
        scriptpubkey_address: '',
        value: 0,
      },
      {
        scriptpubkey: '0014010000000000001388000000000000089839011b',
        scriptpubkey_asm: 'OP_0 010000000000001388000000000000089839011b',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1qqyqqqqqqqqqp8zqqqqqqqqqqpzvrjqgmvkrl7x',
        value: 294,
      },
      {
        scriptpubkey_asm: 'OP_0 2eff6f19da9c786a5be52986e4fa888754f48fdc',
        scriptpubkey: '00142eff6f19da9c786a5be52986e4fa888754f48fdc',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1q9mlk7xw6n3ux5kl99xrwf75gsa20fr7udfwt4u',
        value: 295,
      },
      {
        scriptpubkey_asm: 'OP_0 82639073e4b9827cba6224d854f00de94428ff00',
        scriptpubkey: '001482639073e4b9827cba6224d854f00de94428ff00',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1qsf3equlyhxp8ewnzynv9fuqda9zz3lcq0lv6t8',
        value: 296,
      },
      {
        scriptpubkey_asm: 'OP_0 24e297ad5ab773a19ed6fac80c40de0000000000',
        scriptpubkey: '001424e297ad5ab773a19ed6fac80c40de0000000000',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1qyn3f0t26kae6r8kkltyqcsx7qqqqqqqq5r2dp2',
        value: 297,
      },
    ],
  },
  corruptData: {
    vout: [
      {
        scriptpubkey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        scriptpubkey_asm:
          'OP_1 33fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        scriptpubkey_type: 'V1_P2TR',
        scriptpubkey_address:
          'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
        value: 500,
      },
      {
        scriptpubkey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        scriptpubkey_asm:
          'OP_1 6049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        scriptpubkey_type: 'V1_P2TR',
        scriptpubkey_address:
          'bc1pvpyum6lxgrfr675wz8v9jxk2jmqvm9nzdly9p2cmvhnawhl0tvtsz73adv',
        value: 3793,
      },
      {
        scriptpubkey: '6a5d0c160100f7e135ec1790a10f00',
        scriptpubkey_asm: 'OP_RETURN OP_13 160100f7e135ec1790a10f00',
        scriptpubkey_type: 'OP_RETURN',
        scriptpubkey_address: '',
        value: 0,
      },
      {
        // corrupted toChain
        scriptpubkey: '0014500000000000001388000000000000089839011b',
        scriptpubkey_asm: 'OP_0 500000000000001388000000000000089839011b',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1q2qqqqqqqqqqp8zqqqqqqqqqqpzvrjqgmvd57m6',
        value: 294,
      },
      {
        scriptpubkey_asm: 'OP_0 2eff6f19da9c786a5be52986e4fa888754f48fdc',
        scriptpubkey: '00142eff6f19da9c786a5be52986e4fa888754f48fdc',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1q9mlk7xw6n3ux5kl99xrwf75gsa20fr7udfwt4u',
        value: 295,
      },
      {
        scriptpubkey_asm: 'OP_0 82639073e4b9827cba6224d854f00de94428ff00',
        scriptpubkey: '001482639073e4b9827cba6224d854f00de94428ff00',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1qsf3equlyhxp8ewnzynv9fuqda9zz3lcq0lv6t8',
        value: 296,
      },
      {
        scriptpubkey_asm: 'OP_0 24e297ad5ab773a19ed6fac80c40de0000000000',
        scriptpubkey: '001424e297ad5ab773a19ed6fac80c40de0000000000',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1qyn3f0t26kae6r8kkltyqcsx7qqqqqqqq5r2dp2',
        value: 297,
      },
    ],
  },
  unorderedTx: {
    vout: [
      {
        scriptpubkey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        scriptpubkey_asm:
          'OP_1 33fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        scriptpubkey_type: 'V1_P2TR',
        scriptpubkey_address:
          'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
        value: 500,
      },
      {
        scriptpubkey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        scriptpubkey_asm:
          'OP_1 6049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        scriptpubkey_type: 'V1_P2TR',
        scriptpubkey_address:
          'bc1pvpyum6lxgrfr675wz8v9jxk2jmqvm9nzdly9p2cmvhnawhl0tvtsz73adv',
        value: 3793,
      },
      {
        scriptpubkey: '6a5d0c160100f7e135ec1790a10f00',
        scriptpubkey_asm: 'OP_RETURN OP_13 160100f7e135ec1790a10f00',
        scriptpubkey_type: 'OP_RETURN',
        scriptpubkey_address: '',
        value: 0,
      },
      {
        scriptpubkey_asm: 'OP_0 82639073e4b9827cba6224d854f00de94428ff00',
        scriptpubkey: '001482639073e4b9827cba6224d854f00de94428ff00',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1qsf3equlyhxp8ewnzynv9fuqda9zz3lcq0lv6t8',
        value: 296,
      },
      {
        scriptpubkey: '0014010000000000001388000000000000089839011b',
        scriptpubkey_asm: 'OP_0 010000000000001388000000000000089839011b',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1qqyqqqqqqqqqp8zqqqqqqqqqqpzvrjqgmvkrl7x',
        value: 294,
      },
      {
        scriptpubkey_asm: 'OP_0 2eff6f19da9c786a5be52986e4fa888754f48fdc',
        scriptpubkey: '00142eff6f19da9c786a5be52986e4fa888754f48fdc',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1q9mlk7xw6n3ux5kl99xrwf75gsa20fr7udfwt4u',
        value: 295,
      },
      {
        scriptpubkey_asm: 'OP_0 24e297ad5ab773a19ed6fac80c40de0000000000',
        scriptpubkey: '001424e297ad5ab773a19ed6fac80c40de0000000000',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1qyn3f0t26kae6r8kkltyqcsx7qqqqqqqq5r2dp2',
        value: 297,
      },
    ],
  },
  lessBoxes: {
    vout: [
      {
        scriptpubkey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        scriptpubkey_asm:
          'OP_1 33fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
        scriptpubkey_type: 'V1_P2TR',
        scriptpubkey_address:
          'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
        value: 500,
      },
      {
        scriptpubkey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        scriptpubkey_asm:
          'OP_1 6049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        scriptpubkey_type: 'V1_P2TR',
        scriptpubkey_address:
          'bc1pvpyum6lxgrfr675wz8v9jxk2jmqvm9nzdly9p2cmvhnawhl0tvtsz73adv',
        value: 3793,
      },
      {
        scriptpubkey: '6a5d0c160100f7e135ec1790a10f00',
        scriptpubkey_asm: 'OP_RETURN OP_13 160100f7e135ec1790a10f00',
        scriptpubkey_type: 'OP_RETURN',
        scriptpubkey_address: '',
        value: 0,
      },
      {
        scriptpubkey: '0014010000000000001388000000000000089839011b',
        scriptpubkey_asm: 'OP_0 010000000000001388000000000000089839011b',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1qqyqqqqqqqqqp8zqqqqqqqqqqpzvrjqgmvkrl7x',
        value: 294,
      },
    ],
  },
  noLock: {
    vout: [
      {
        scriptpubkey:
          '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb8',
        scriptpubkey_asm:
          'OP_1 33fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb8',
        scriptpubkey_type: 'V1_P2TR',
        scriptpubkey_address:
          'bc1px0ad45qrfwc20yfd9wljeytrvfa6tmrcxv6pgxze2svvx00tp7mstj5rpk',
        value: 500,
      },
      {
        scriptpubkey:
          '51206049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        scriptpubkey_asm:
          'OP_1 6049cdebe640d23d7a8e11d8591aca96c0cd96626fc850ab1b65e7d75fef5b17',
        scriptpubkey_type: 'V1_P2TR',
        scriptpubkey_address:
          'bc1pvpyum6lxgrfr675wz8v9jxk2jmqvm9nzdly9p2cmvhnawhl0tvtsz73adv',
        value: 3793,
      },
      {
        scriptpubkey: '6a5d0c160100f7e135ec1790a10f00',
        scriptpubkey_asm: 'OP_RETURN OP_13 160100f7e135ec1790a10f00',
        scriptpubkey_type: 'OP_RETURN',
        scriptpubkey_address: '',
        value: 0,
      },
      {
        scriptpubkey: '0014010000000000001388000000000000089839011b',
        scriptpubkey_asm: 'OP_0 010000000000001388000000000000089839011b',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1qqyqqqqqqqqqp8zqqqqqqqqqqpzvrjqgmvkrl7x',
        value: 294,
      },
      {
        scriptpubkey_asm: 'OP_0 2eff6f19da9c786a5be52986e4fa888754f48fdc',
        scriptpubkey: '00142eff6f19da9c786a5be52986e4fa888754f48fdc',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1q9mlk7xw6n3ux5kl99xrwf75gsa20fr7udfwt4u',
        value: 295,
      },
      {
        scriptpubkey_asm: 'OP_0 82639073e4b9827cba6224d854f00de94428ff00',
        scriptpubkey: '001482639073e4b9827cba6224d854f00de94428ff00',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1qsf3equlyhxp8ewnzynv9fuqda9zz3lcq0lv6t8',
        value: 296,
      },
      {
        scriptpubkey_asm: 'OP_0 24e297ad5ab773a19ed6fac80c40de0000000000',
        scriptpubkey: '001424e297ad5ab773a19ed6fac80c40de0000000000',
        scriptpubkey_type: 'V0_P2WPKH',
        scriptpubkey_address: 'bc1qyn3f0t26kae6r8kkltyqcsx7qqqqqqqq5r2dp2',
        value: 297,
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
  sourceChainTokenId: '',
  amount: '0',
  targetChainTokenId: '',
  sourceTxId:
    'ac16759cc66ad1f4b9fe49e068d979728302ed6fb566d94665c76a654a93eeb2',
  rawData:
    '010000000000001388000000000000089839011b2eff6f19da9c786a5be52986e4fa888754f48fdc82639073e4b9827cba6224d854f00de94428ff0024e297ad5ab773a19ed6fac80c40de0000000000',
};
