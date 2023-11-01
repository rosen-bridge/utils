import { mempoolTxsSample, repoAddress, boxInfo1 } from '../rwtRepoTestData';

export function mockedErgoNodeClientFactory(url: string) {
  return {
    getBoxesByAddressUnspent(address: string) {
      if (address === repoAddress) {
        return [boxInfo1];
      }
      return [];
    },
    getBoxById(boxId: string) {
      if (boxId === boxInfo1.boxId) {
        return boxInfo1;
      }
      throw new Error('no boxes with this id were found');
    },
    getUnconfirmedTransactionsByErgoTree(ergoTree: string) {
      if (ergoTree === boxInfo1.ergoTree) {
        return mempoolTxsSample.items;
      }
      return [];
    },
  };
}
