export const lockAddress = 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h';

export const baseTx = {
  txid: '6a1b9e7a755afb5d82ecaa5f432d51bd23e452ee1031fc99066e92788a075a84',
  version: 1,
  locktime: 0,
  size: 250,
  weight: 670,
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
      txid: 'eff4900465d1603d12c1dc8f231a07ce2196c04196aa26bb80147bb152137aaf',
      vout: 0,
      prevout: {
        scriptpubkey: '0014bf1916dc33dbdd65f60d8b1f65eb35e8120835fc',
        scriptpubkey_asm:
          'OP_0 OP_PUSHBYTES_20 bf1916dc33dbdd65f60d8b1f65eb35e8120835fc',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'bc1qhuv3dhpnm0wktasd3v0kt6e4aqfqsd0uhfdu7d',
        value: 1337220,
      },
      scriptsig: '',
      scriptsig_asm: '',
      witness: [
        '3045022100d267a326ce452a3eb2aae3c746f1b8a7108b7b2294f1dd0edb5e6ca556c8cc34022016f93fe05e7b4e9e22f711be86ffc69a8e6b71a4f57e43abe67b095c0639895801',
        '028f229625405262b55baa85847ba45ea9b8d1d5d3db93e2dd22f31ba7e0cdbc97',
      ],
      is_coinbase: false,
      sequence: 4294967293,
    },
  ],
};
export const txUtxos = {
  lockTx: {
    vout: [
      {
        scriptpubkey:
          '6a3300000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
        scriptpubkey_asm:
          'OP_RETURN OP_PUSHDATA1 00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
        scriptpubkey_type: 'op_return',
        value: 0,
      },
      {
        scriptpubkey: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
        scriptpubkey_asm:
          'OP_0 OP_PUSHBYTES_20 b20272a6591937ba7d687dc889f3637ed40efa6a',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h',
        value: 3000000000,
      },
    ],
  },
  lessBoxes: {
    vout: [
      {
        scriptpubkey: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
        scriptpubkey_asm:
          'OP_0 OP_PUSHBYTES_20 b20272a6591937ba7d687dc889f3637ed40efa6a',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h',
        value: 1325220,
      },
    ],
  },
  noOpReturn: {
    vout: [
      {
        scriptpubkey: '001490e17f3b1763f70ac2de508981b91c43b3f4c243',
        scriptpubkey_asm:
          'OP_0 OP_PUSHBYTES_20 90e17f3b1763f70ac2de508981b91c43b3f4c243',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'bc1qjrsh7wchv0ms4sk72zycrwgugwelfsjrqyvd8t',
        value: 1000000,
      },
      {
        scriptpubkey: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
        scriptpubkey_asm:
          'OP_0 OP_PUSHBYTES_20 b20272a6591937ba7d687dc889f3637ed40efa6a',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h',
        value: 325220,
      },
    ],
  },
  noLock: {
    vout: [
      {
        scriptpubkey:
          '6a3300000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
        scriptpubkey_asm:
          'OP_RETURN OP_PUSHDATA1 00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
        scriptpubkey_type: 'op_return',
        value: 0,
      },
      {
        scriptpubkey: '001490e17f3b1763f70ac2de508981b91c43b3f4c243',
        scriptpubkey_asm:
          'OP_0 OP_PUSHBYTES_20 90e17f3b1763f70ac2de508981b91c43b3f4c243',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'bc1qjrsh7wchv0ms4sk72zycrwgugwelfsjrqyvd8t',
        value: 1325220,
      },
    ],
  },
  invalidData: {
    vout: [
      {
        scriptpubkey:
          '6a3309000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
        scriptpubkey_asm:
          'OP_RETURN OP_PUSHDATA1 09000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
        scriptpubkey_type: 'op_return',
        value: 0,
      },
      {
        scriptpubkey: '0014b20272a6591937ba7d687dc889f3637ed40efa6a',
        scriptpubkey_asm:
          'OP_0 OP_PUSHBYTES_20 b20272a6591937ba7d687dc889f3637ed40efa6a',
        scriptpubkey_type: 'v0_p2wpkh',
        scriptpubkey_address: 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h',
        value: 3000000000,
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
  toAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  bridgeFee: '1968503938',
  networkFee: '9842520',
  fromAddress:
    'box:eff4900465d1603d12c1dc8f231a07ce2196c04196aa26bb80147bb152137aaf.0',
  sourceChainTokenId: 'btc',
  amount: '3000000000',
  targetChainTokenId:
    'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  sourceTxId:
    '6a1b9e7a755afb5d82ecaa5f432d51bd23e452ee1031fc99066e92788a075a84',
};

export const lockUtxo = {
  scriptpubkey: '001490e17f3b1763f70ac2de508981b91c43b3f4c243',
  scriptpubkey_asm:
    'OP_0 OP_PUSHBYTES_20 90e17f3b1763f70ac2de508981b91c43b3f4c243',
  scriptpubkey_type: 'v0_p2wpkh',
  scriptpubkey_address: 'bc1qjrsh7wchv0ms4sk72zycrwgugwelfsjrqyvd8t',
  value: 3000000000,
};
export const btcTransformation = {
  from: 'btc',
  to: 'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
  amount: '3000000000',
};
