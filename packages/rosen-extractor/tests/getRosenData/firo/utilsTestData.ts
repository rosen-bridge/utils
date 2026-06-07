export const validFiroAddress = 'a3io3zMLfg9nchA3KSoSEvPz1tztnKDuaT';
export const validFiroOutputScript =
  '76a91420f87f7f202c3d40dea06df136862fdbeef3f8e788ac';
export const invalidFiroAddress = 'a3io3zMLfg9nchA3KSoSEvPz1tztnKDUZZ';
const validOpReturnPayload =
  '00000000000098968000000000009896802103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339';
const padOpReturnPayload = (length: number) =>
  validOpReturnPayload + '00'.repeat(length - validOpReturnPayload.length / 2);
const pushData1Script = (length: number) =>
  `6a4c${length.toString(16).padStart(2, '0')}${padOpReturnPayload(length)}`;
export const opReturnScripts = {
  valid: `6a33${validOpReturnPayload}`,
  validPushData1: pushData1Script(76),
  validPushData2: `6a4d3300${validOpReturnPayload}`,
  validPushData4: `6a4e33000000${validOpReturnPayload}`,
  tooLongPushData1: pushData1Script(81),
  noOpReturn:
    '3300000000000098968000000000009896802103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
  invalidToChain:
    '6a3364000000000098968000000000009896802103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339',
};

export const opReturnData = {
  toChain: 'ergo',
  toAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  bridgeFee: '10000000',
  networkFee: '10000000',
};
