import { rwtRepoInfoSample } from './rwt-repo-TestData';

export function mockedErgoExplorerClientFactory(url: string) {
  return {
    v0: {
      async getApiV0TransactionsUnconfirmedByaddressP1(address: string) {
        if (address === rwtRepoInfoSample.Address) {
          return rwtRepoInfoSample.MempoolTxSample;
        }
        return {
          items: [],
          total: 0,
        };
      },
    },
    v1: {
      async getApiV1BoxesUnspentByaddressP1(p1: string) {
        if (p1 === rwtRepoInfoSample.Address) {
          return {
            items: [rwtRepoInfoSample.BoxInfo],
            total: 1,
          };
        }
        return {
          items: [],
          total: 0,
        };
      },
      async getApiV1BoxesP1(boxId: string) {
        if (boxId === rwtRepoInfoSample.BoxInfo.boxId) {
          return rwtRepoInfoSample.BoxInfo;
        }
        throw new Error('no boxes with this id were found');
      },
    },
  };
}

export function mockedErgoNodeClientFactory(url: string) {
  return {
    getBoxesByAddressUnspent(address: string) {
      if (address === rwtRepoInfoSample.Address) {
        return [rwtRepoInfoSample.BoxInfo];
      }
      return [];
    },
    getBoxById(boxId: string) {
      if (boxId === rwtRepoInfoSample.BoxInfo.boxId) {
        return rwtRepoInfoSample.BoxInfo;
      }
      throw new Error('no boxes with this id were found');
    },
    getUnconfirmedTransactionsByErgoTree(ergoTree: string) {
      if (ergoTree === rwtRepoInfoSample.BoxInfo.ergoTree) {
        return rwtRepoInfoSample.MempoolTxSample.items;
      }
      return [];
    },
  };
}
