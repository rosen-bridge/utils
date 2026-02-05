import { ErgoBoxWrapper } from '../lib';

export const jsonToErgoBoxWrapper = (json: string): ErgoBoxWrapper => {
  const data = JSON.parse(json);
  return {
    boxId: data.boxId,
    txId: data.transactionId,
    address: data.address ?? '',
    index: data.index,
    value: BigInt(data.value),
    creationHeight: data.creationHeight,
    assets: data.assets.map((asset: any) => ({
      tokenId: asset.tokenId,
      amount: BigInt(asset.amount),
    })),
    additionalRegisters: data.additionalRegisters,
    ergoTree: data.ergoTree,
    globalIndex: data.globalIndex ? BigInt(data.globalIndex) : 0n,
    spentTransactionId: data.spentTransactionId ?? '',
  };
};

export const parseExplorerBox = (box: Record<string, any>): ErgoBoxWrapper => {
  return {
    boxId: box.boxId,
    txId: box.transactionId,
    address: box.address,
    index: box.index,
    value: box.value,
    creationHeight: box.creationHeight,
    assets: box.assets ?? [],
    additionalRegisters: {
      R4: box.additionalRegisters.R4?.serializedValue ?? '',
      R5: box.additionalRegisters.R5?.serializedValue ?? '',
      R6: box.additionalRegisters.R6?.serializedValue ?? '',
      R7: box.additionalRegisters.R7?.serializedValue ?? '',
      R8: box.additionalRegisters.R8?.serializedValue ?? '',
      R9: box.additionalRegisters.R9?.serializedValue ?? '',
    },
    ergoTree: box.ergoTree,
    globalIndex: box.globalIndex,
    spentTransactionId: box.spentTransactionId,
  };
};
