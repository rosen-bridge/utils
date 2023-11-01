import { mempoolTxsSample, repoAddress, boxInfo1 } from '../rwtRepoTestData';

export function mockedErgoExplorerClientFactory(
  url: string,
  boxInfo: any = boxInfo1
) {
  return {
    v0: {
      async getApiV0TransactionsUnconfirmedByaddressP1(address: string) {
        if (address === repoAddress) {
          return mempoolTxsSample;
        }
        return {
          items: [],
          total: 0,
        };
      },
    },
    v1: {
      async getApiV1BoxesUnspentByaddressP1(p1: string) {
        if (p1 === repoAddress) {
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
