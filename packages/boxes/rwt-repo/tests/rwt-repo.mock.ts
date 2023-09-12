import { rwtRepoInfoSample } from './rwt-repo-TestData';

export function mockedErgoExplorerClientFactory(
  url: string,
  boxInfo: any = rwtRepoInfoSample.boxInfo
) {
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
            items: [boxInfo],
            total: 1,
          };
        }
        return {
          items: [],
          total: 0,
        };
      },
      async getApiV1BoxesP1(boxId: string) {
        if (boxId === boxInfo.boxId) {
          return boxInfo;
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
