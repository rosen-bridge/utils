import axios from 'axios';
import { Boxes } from './types';
import { JsonBI } from './parser';

export default class ExplorerApi {
  private explorerApi;

  /**
   * initializes class parameters
   * @param explorerBaseUrl base url to explorer api
   */
  constructor(explorerBaseUrl: string) {
    this.explorerApi = axios.create({
      baseURL: explorerBaseUrl,
      timeout: 8000,
    });
  }

  /**
   * searches for a box in explorer
   * @param ergoTreeTemplateHash the ergoTreeTemplateHash of the box
   * @param tokenIds the list of tokens which the box should contains
   */
  searchBoxByTokenId = async (
    tokenId: string,
    page = 0,
    limit = 20
  ): Promise<Boxes> => {
    return this.explorerApi
      .get<Boxes>(
        `/v1/boxes/unspent/byTokenId/${tokenId}?offset=${
          page * limit
        }&limit=${limit}`,
        {
          transformResponse: (data) => JsonBI.parse(data),
        }
      )
      .then((res) => res.data)
      .catch((e) => {
        throw Error(
          `An error occurred while getting boxes for token ${tokenId}: ${e}`
        );
      });
  };
}
