import { rwtRepoInfoSample } from '../rwtRepoTestData';

export function mockedErgoNodeClientFactory(url: string) {
  return {
    getBoxesByAddressUnspent(address: string) {
      if (address === rwtRepoInfoSample.Address) {
        return [rwtRepoInfoSample.boxInfo];
      }
      return [];
    },
    getBoxById(boxId: string) {
      if (boxId === rwtRepoInfoSample.boxInfo.boxId) {
        return rwtRepoInfoSample.boxInfo;
      }
      throw new Error('no boxes with this id were found');
    },
    getUnconfirmedTransactionsByErgoTree(ergoTree: string) {
      if (ergoTree === rwtRepoInfoSample.boxInfo.ergoTree) {
        return rwtRepoInfoSample.MempoolTxSample.items;
      }
      return [];
    },
  };
}
