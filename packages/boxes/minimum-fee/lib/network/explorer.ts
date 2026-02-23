import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { ErgoBoxWrapper } from '../types';
import { AbstractMinimumFeeNetwork } from './abstract';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import JsonBigInt from '@rosen-bridge/json-bigint';
import handleApiError from '../handleApiError';

class MinimumFeeExplorerNetwork extends AbstractMinimumFeeNetwork {
  protected readonly BOX_FETCHING_PAGE_SIZE = 50;
  protected explorerClient: ReturnType<typeof ergoExplorerClientFactory>;

  constructor(networkUrl: string, logger?: AbstractLogger) {
    super(logger);
    this.explorerClient = ergoExplorerClientFactory(networkUrl);
  }

  /**
   * gets the boxes by token id
   * @returns promise that resolves to an array of ErgoBoxWrapper objects
   */
  getBoxesByTokenId: (tokenId: string) => Promise<ErgoBoxWrapper[]> = async (
    tokenId: string,
  ): Promise<ErgoBoxWrapper[]> => {
    this.logger.debug(`Fetching boxes with token ID: ${tokenId} from explorer`);
    const boxes: Array<ErgoBoxWrapper> = [];

    try {
      let currentPage = 0;
      let boxesPage =
        await this.explorerClient.v1.getApiV1BoxesUnspentBytokenidP1(tokenId, {
          offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
          limit: this.BOX_FETCHING_PAGE_SIZE,
        });

      this.logger.debug(
        `requested 'explorerClient.getApiV1BoxesUnspentBytokenidP1' for token [${
          tokenId
        }]. res: ${JsonBigInt.stringify(boxesPage)}`,
      );

      while (boxesPage.items?.length) {
        boxes.push(
          ...boxesPage.items.map((box) => ({
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
          })),
        );

        currentPage++;

        boxesPage =
          await this.explorerClient.v1.getApiV1BoxesUnspentBytokenidP1(
            tokenId,
            {
              offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
              limit: this.BOX_FETCHING_PAGE_SIZE,
            },
          );

        this.logger.debug(
          `requested 'explorerClient.getApiV1BoxesUnspentBytokenidP1' for token [${
            tokenId
          }]. res: ${JsonBigInt.stringify(boxesPage)}`,
        );
      }
    } catch (error) {
      return handleApiError(
        error,
        'Failed to get boxes by token id from Ergo Explorer:',
      );
    }

    return boxes;
  };
}

export { MinimumFeeExplorerNetwork };
