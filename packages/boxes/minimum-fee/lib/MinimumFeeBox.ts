import { ErgoBox } from 'ergo-lib-wasm-nodejs';
import { ErgoNetworkType } from './types';
import { FailedError, NotFoundError } from './errors';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory, {
  IndexedErgoBox,
} from '@rosen-clients/ergo-node';
import JsonBigInt from '@rosen-bridge/json-bigint';
import handleApiError from './handleApiError';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';

const ERGO_NATIVE_TOKEN = 'erg';

export class MinimumFeeBox {
  protected readonly BOX_FETCHING_PAGE_SIZE = 50;
  protected logger: AbstractLogger;
  protected box: ErgoBox;
  protected tokenId: string;
  protected minimumFeeNFT: string;
  protected address: string;
  protected explorerClient: ReturnType<typeof ergoExplorerClientFactory>;
  protected nodeClient: ReturnType<typeof ergoNodeClientFactory>;

  constructor(
    tokenId: string,
    minimumFeeNFT: string,
    address: string,
    networkType: ErgoNetworkType,
    networkUrl: string,
    logger?: AbstractLogger
  ) {
    this.tokenId = tokenId;
    this.minimumFeeNFT = minimumFeeNFT;
    this.address = address;
    if (networkType === ErgoNetworkType.explorer)
      this.explorerClient = ergoExplorerClientFactory(networkUrl);
    else this.nodeClient = ergoNodeClientFactory(networkUrl);
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * fetches the box from the blockchain
   */
  fetchBox = async (): Promise<void> => {
    if (this.explorerClient) this.box = await this.fetchBoxUsingExplorer();
    else this.box = await this.fetchBoxUsingNode();
  };

  /**
   * returns fetched box or throws approprite error if found more or none
   * @param eligibleBoxes
   */
  protected selectEligibleBox = (eligibleBoxes: Array<ErgoBox>): ErgoBox => {
    this.logger.debug(
      `Found [${
        eligibleBoxes.length
      }] minimum-fee boxes: ${JsonBigInt.stringify(
        eligibleBoxes.map((box) => box.to_json())
      )}`
    );

    if (eligibleBoxes.length === 0)
      throw new NotFoundError(
        `Found no minimum-fee box for token [${this.tokenId}] and address [${this.address}]`
      );
    else if (eligibleBoxes.length > 1)
      throw new FailedError(
        `Found [${eligibleBoxes.length}] minimum-fee boxes for token [${this.tokenId}] and address [${this.address}]`
      );
    else {
      this.logger.debug(
        `Found minimum-fee box [${eligibleBoxes[0]
          .box_id()
          .to_str()}] for token [${this.tokenId}] and address [${this.address}]`
      );
      return eligibleBoxes[0];
    }
  };

  /**
   * fetches box from the blockchain using explorer client
   */
  protected fetchBoxUsingExplorer = async (): Promise<ErgoBox> => {
    const eligibleBoxes: Array<ErgoBox> = [];
    try {
      let currentPage = 0;
      let boxesPage =
        await this.explorerClient.v1.getApiV1BoxesUnspentBytokenidP1(
          this.minimumFeeNFT,
          {
            offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
            limit: this.BOX_FETCHING_PAGE_SIZE,
          }
        );
      while (boxesPage.items?.length) {
        this.logger.debug(
          `requested 'explorerClient.getApiV1BoxesUnspentBytokenidP1' for token [${
            this.minimumFeeNFT
          }]. res: ${JsonBigInt.stringify(boxesPage)}`
        );

        eligibleBoxes.push(
          ...boxesPage.items
            .filter((box) =>
              box.address === this.address && this.tokenId === ERGO_NATIVE_TOKEN
                ? box.assets?.length === 1
                : box.assets?.length === 2 &&
                  box.assets?.some((asset) => asset.tokenId === this.tokenId)
            )
            .map((box: any) => ErgoBox.from_json(JsonBigInt.stringify(box)))
        );
        currentPage++;
        boxesPage =
          await this.explorerClient.v1.getApiV1BoxesUnspentBytokenidP1(
            this.minimumFeeNFT,
            {
              offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
              limit: this.BOX_FETCHING_PAGE_SIZE,
            }
          );
      }
    } catch (error) {
      return handleApiError(
        error,
        'Failed to get boxes by token id from Ergo Explorer:'
      );
    }

    return this.selectEligibleBox(eligibleBoxes);
  };

  /**
   * fetches the box from the blockchain using node client
   */
  protected fetchBoxUsingNode = async (): Promise<ErgoBox> => {
    const eligibleBoxes: Array<ErgoBox> = [];
    try {
      const boxHasConfigToken = (box: IndexedErgoBox) =>
        box.assets?.some((asset) => asset.tokenId === this.minimumFeeNFT);
      const boxHasAppropriateToken = (box: IndexedErgoBox) =>
        this.tokenId === ERGO_NATIVE_TOKEN
          ? box.assets?.length === 1
          : box.assets?.length === 2 &&
            box.assets?.some((asset) => asset.tokenId === this.tokenId);

      let currentPage = 0;
      let boxesPage = await this.nodeClient.getBoxesByAddressUnspent(
        this.address,
        {
          offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
          limit: this.BOX_FETCHING_PAGE_SIZE,
        }
      );
      while (boxesPage.length !== 0) {
        this.logger.debug(
          `requested 'nodeClient.getBoxesByAddressUnspent' for token [${
            this.minimumFeeNFT
          }]. res: ${JsonBigInt.stringify(boxesPage)}`
        );

        eligibleBoxes.push(
          ...boxesPage
            .filter(
              (box) => boxHasConfigToken(box) && boxHasAppropriateToken(box)
            )
            .map((box: IndexedErgoBox) =>
              ErgoBox.from_json(JsonBigInt.stringify(box))
            )
        );
        currentPage++;
        boxesPage = await this.nodeClient.getBoxesByAddressUnspent(
          this.address,
          {
            offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
            limit: this.BOX_FETCHING_PAGE_SIZE,
          }
        );
      }
    } catch (error) {
      const baseError = 'Failed to get boxes by token id from Ergo Node:';
      handleApiError(error, baseError, {
        handleRespondedState: (error) => {
          if (error.response.status === 400) return;
          throw new FailedError(
            `${baseError} [${error.response.status}] ${error.response.data.reason}`
          );
        },
      });
    }

    return this.selectEligibleBox(eligibleBoxes);
  };

  /**
   * returns fetched config box
   */
  getBox = (): ErgoBox => this.box;
}
