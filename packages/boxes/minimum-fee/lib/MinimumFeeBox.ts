import { Address, ErgoBox, NetworkPrefix } from 'ergo-lib-wasm-nodejs';
import { ChainMinimumFee, ErgoNetworkType, Fee } from './types';
import { FailedError, NotFoundError } from './errors';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import JsonBigInt from '@rosen-bridge/json-bigint';
import handleApiError from './handleApiError';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { MinimumFeeBoxBuilder } from './MinimumFeeBoxBuilder';
import { MinimumFeeConfig } from './MinimumFeeConfig';
import { ERGO_NATIVE_TOKEN } from './constants';
import { extractFeeFromBox } from './utils';

export class MinimumFeeBox {
  protected readonly BOX_FETCHING_PAGE_SIZE = 50;
  protected logger: AbstractLogger;
  protected box: ErgoBox | undefined;
  protected tokenId: string;
  protected minimumFeeNFT: string;
  protected explorerClient: ReturnType<typeof ergoExplorerClientFactory>;
  protected nodeClient: ReturnType<typeof ergoNodeClientFactory>;

  constructor(
    tokenId: string,
    minimumFeeNFT: string,
    networkType: ErgoNetworkType,
    networkUrl: string,
    logger?: AbstractLogger
  ) {
    this.tokenId = tokenId;
    this.minimumFeeNFT = minimumFeeNFT;
    if (networkType === ErgoNetworkType.explorer)
      this.explorerClient = ergoExplorerClientFactory(networkUrl);
    else this.nodeClient = ergoNodeClientFactory(networkUrl);
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * fetches the box from the blockchain
   * @returns true if action was successful, otherwise false
   */
  fetchBox = async (): Promise<boolean> => {
    const boxHasAppropriateTokens = (box: ErgoBox) => {
      const tokenLen = box.tokens().len();
      let hasMinimumFeeNFT = false;
      let hasTargetToken = this.tokenId === ERGO_NATIVE_TOKEN ? true : false;
      const hasCorrectTokens =
        this.tokenId === ERGO_NATIVE_TOKEN ? tokenLen === 1 : tokenLen === 2;
      for (let i = 0; i < tokenLen; i++) {
        const id = box.tokens().get(i).id().to_str();
        if (id === this.minimumFeeNFT) hasMinimumFeeNFT = true;
        else if (id === this.tokenId) hasTargetToken = true;
      }
      return hasCorrectTokens && hasMinimumFeeNFT && hasTargetToken;
    };

    try {
      const boxes = this.explorerClient
        ? await this.fetchBoxesUsingExplorer()
        : await this.fetchBoxesUsingNode();

      this.box = this.selectEligibleBox(
        boxes.filter((box: ErgoBox) => boxHasAppropriateTokens(box))
      );
      return true;
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof FailedError) {
        this.logger.warn(`No valid minimum-fee box. reason: ${e}`);
        this.box = undefined;
      } else {
        this.logger.warn(
          `An error occurred while updating minimum-fee box for token [${this.tokenId}]: ${e}`
        );
        if (e instanceof Error && e.stack) this.logger.warn(e.stack);
      }
      return false;
    }
  };

  /**
   * returns fetched box or throws appropriate error if found more or none
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

    if (eligibleBoxes.length === 0) {
      throw new NotFoundError(
        `Found no minimum-fee box for token [${this.tokenId}]`
      );
    } else if (eligibleBoxes.length > 1) {
      throw new FailedError(
        `Found [${eligibleBoxes.length}] minimum-fee boxes for token [${this.tokenId}]`
      );
    } else {
      this.logger.debug(
        `Found minimum-fee box [${eligibleBoxes[0]
          .box_id()
          .to_str()}] for token [${this.tokenId}]`
      );
      return eligibleBoxes[0];
    }
  };

  /**
   * fetches box from the blockchain using explorer client
   */
  protected fetchBoxesUsingExplorer = async (): Promise<Array<ErgoBox>> => {
    const boxes: Array<ErgoBox> = [];
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
      this.logger.debug(
        `requested 'explorerClient.getApiV1BoxesUnspentBytokenidP1' for token [${
          this.minimumFeeNFT
        }]. res: ${JsonBigInt.stringify(boxesPage)}`
      );
      while (boxesPage.items?.length) {
        boxes.push(
          ...boxesPage.items.map((box) =>
            ErgoBox.from_json(JsonBigInt.stringify(box))
          )
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
        this.logger.debug(
          `requested 'explorerClient.getApiV1BoxesUnspentBytokenidP1' for token [${
            this.minimumFeeNFT
          }]. res: ${JsonBigInt.stringify(boxesPage)}`
        );
      }
    } catch (error) {
      return handleApiError(
        error,
        'Failed to get boxes by token id from Ergo Explorer:'
      );
    }

    return boxes;
  };

  /**
   * fetches the box from the blockchain using node client
   */
  protected fetchBoxesUsingNode = async (): Promise<Array<ErgoBox>> => {
    const boxes: Array<ErgoBox> = [];
    try {
      let currentPage = 0;
      let boxesPage = await this.nodeClient.getBoxesByTokenIdUnspent(
        this.minimumFeeNFT,
        {
          offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
          limit: this.BOX_FETCHING_PAGE_SIZE,
        }
      );
      this.logger.debug(
        `requested 'nodeClient.getBoxesByTokenIdUnspent' for token [${
          this.minimumFeeNFT
        }]. res: ${JsonBigInt.stringify(boxesPage)}`
      );
      while (boxesPage.length !== 0) {
        boxes.push(
          ...boxesPage.map((box) =>
            ErgoBox.from_json(JsonBigInt.stringify(box))
          )
        );
        currentPage++;
        boxesPage = await this.nodeClient.getBoxesByTokenIdUnspent(
          this.minimumFeeNFT,
          {
            offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
            limit: this.BOX_FETCHING_PAGE_SIZE,
          }
        );
        this.logger.debug(
          `requested 'nodeClient.getBoxesByTokenIdUnspent' for token [${
            this.minimumFeeNFT
          }]. res: ${JsonBigInt.stringify(boxesPage)}`
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

    return boxes;
  };

  /**
   * returns fetched config box
   */
  getBox = (): ErgoBox | undefined => this.box;

  /**
   * gets current feeConfig
   */
  getConfigs = (): Array<Fee> => {
    if (!this.box) throw Error(`Box is not fetched yet`);
    const fee = extractFeeFromBox(this.box);
    this.logger.debug(
      `Extracted fee config from box [${this.box
        .box_id()
        .to_str()}]: ${JsonBigInt.stringify(fee)}`
    );
    return fee;
  };

  /**
   * gets corresponding config for two chains and height
   * @param fromChain
   * @param height blockchain height for fromChain
   * @param toChain
   */
  getFee = (
    fromChain: string,
    height: number,
    toChain: string
  ): ChainMinimumFee => {
    if (!this.box) throw Error(`Box is not fetched yet`);

    const fees = this.getConfigs().reverse();
    for (const fee of fees) {
      if (!Object.hasOwn(fee.heights, fromChain))
        throw new NotFoundError(
          `No fee found for chain [${fromChain}] in box [${this.box
            .box_id()
            .to_str()}]`
        );
      if (fee.heights[fromChain] < height) {
        const chainFee = fee.configs[toChain];
        if (chainFee) return new ChainMinimumFee(chainFee);
        else
          throw new Error(
            `Chain [${toChain}] is not supported at given height of fromChain [${height} of ${fromChain}] in box [${this.box
              .box_id()
              .to_str()}]`
          );
      }
    }

    throw new NotFoundError(
      `Config does not support height [${height}] for chain [${fromChain}] in box [${this.box
        .box_id()
        .to_str()}]`
    );
  };

  /**
   * generates a MinimumFeeBoxBuilder using current box
   *  note that 'height' parameter of builder won't be set
   */
  toBuilder = (): MinimumFeeBoxBuilder => {
    if (!this.box) throw Error(`Box is not fetched yet`);

    const builder = new MinimumFeeBoxBuilder(
      this.minimumFeeNFT,
      Address.recreate_from_ergo_tree(this.box.ergo_tree()).to_base58(
        NetworkPrefix.Mainnet
      )
    )
      .setValue(BigInt(this.box.value().as_i64().to_str()))
      .setToken(this.tokenId);

    this.getConfigs().forEach((fee) => {
      this.logger.debug(
        `Extracted fee config from box [${this.box!.box_id().to_str()}]: ${JsonBigInt.stringify(
          fee
        )}`
      );
      const chainFee = new MinimumFeeConfig();
      Object.keys(fee.heights).forEach((chain) => {
        if (Object.hasOwn(fee.configs, chain))
          chainFee.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain]
          );
        else chainFee.setChainConfig(chain, fee.heights[chain], undefined);
      });
      builder.addConfig(chainFee);
    });
    return builder;
  };
}
