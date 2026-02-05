import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { ErgoBoxWrapper } from '../types';
import AbstractMinimumFeeNetwork from './abstract';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import JsonBigInt from '@rosen-bridge/json-bigint';
import handleApiError from '../handleApiError';
import { FailedError } from '../errors';

class MinimumFeeNodeNetwork extends AbstractMinimumFeeNetwork {
  protected readonly BOX_FETCHING_PAGE_SIZE = 50;
  protected nodeClient: ReturnType<typeof ergoNodeClientFactory>;

  constructor(networkUrl: string, logger?: AbstractLogger) {
    super(logger);
    this.nodeClient = ergoNodeClientFactory(networkUrl);
  }

  /**
   * gets the boxes by token id
   * @returns promise that resolves to an array of ErgoBoxWrapper objects
   */
  getBoxesByTokenId: (tokenId: string) => Promise<ErgoBoxWrapper[]> = async (
    tokenId: string,
  ): Promise<ErgoBoxWrapper[]> => {
    this.logger.debug(`Fetching boxes with token ID: ${tokenId} from node`);

    const boxes: Array<ErgoBoxWrapper> = [];
    try {
      let currentPage = 0;
      let boxesPage = await this.nodeClient.getBoxesByTokenIdUnspent(tokenId, {
        offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
        limit: this.BOX_FETCHING_PAGE_SIZE,
      });
      this.logger.debug(
        `requested 'nodeClient.getBoxesByTokenIdUnspent' for token [${
          tokenId
        }]. res: ${JsonBigInt.stringify(boxesPage)}`,
      );
      while (boxesPage.length !== 0) {
        boxes.push(
          ...boxesPage.map((box) => ({
            boxId: box.boxId ?? '',
            txId: box.transactionId ?? '',
            address: box.address,
            index: box.index ?? 0,
            value: box.value,
            creationHeight: box.creationHeight,
            assets: box.assets ?? [],
            additionalRegisters: {
              R4: box.additionalRegisters.R4 ?? '',
              R5: box.additionalRegisters.R5 ?? '',
              R6: box.additionalRegisters.R6 ?? '',
              R7: box.additionalRegisters.R7 ?? '',
              R8: box.additionalRegisters.R8 ?? '',
              R9: box.additionalRegisters.R9 ?? '',
            },
            ergoTree: box.ergoTree,
            globalIndex: box.globalIndex,
            spentTransactionId: box.spentTransactionId,
          })),
        );
        currentPage++;
        boxesPage = await this.nodeClient.getBoxesByTokenIdUnspent(tokenId, {
          offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
          limit: this.BOX_FETCHING_PAGE_SIZE,
        });
        this.logger.debug(
          `requested 'nodeClient.getBoxesByTokenIdUnspent' for token [${
            tokenId
          }]. res: ${JsonBigInt.stringify(boxesPage)}`,
        );
      }
    } catch (error) {
      const baseError = 'Failed to get boxes by token id from Ergo Node:';
      handleApiError(error, baseError, {
        handleRespondedState: (error) => {
          if (error.response.status === 400) return;
          throw new FailedError(
            `${baseError} [${error.response.status}] ${error.response.data.reason}`,
          );
        },
      });
    }

    return boxes;
  };
}

export default MinimumFeeNodeNetwork;
