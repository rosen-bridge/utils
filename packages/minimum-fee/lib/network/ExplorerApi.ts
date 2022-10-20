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
  boxSearch = async (
    ergoTreeTemplateHash: string,
    tokenIds: string[]
  ): Promise<Boxes> => {
    return this.explorerApi
      .post<Boxes>(
        `/v1/boxes/unspent/search`,
        {
          ergoTreeTemplateHash: ergoTreeTemplateHash,
          assets: tokenIds,
        },
        {
          transformResponse: (data) => JsonBI.parse(data),
        }
      )
      .then((res) => res.data)
      .catch((e) => {
        throw Error(
          `An error occurred while getting boxes for ErgoTreeTemplateHash [${ergoTreeTemplateHash}] containing tokens ${JSON.stringify(
            tokenIds
          )}: ${e}`
        );
      });
  };
}
