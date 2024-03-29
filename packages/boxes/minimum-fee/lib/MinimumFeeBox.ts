import { Address, ErgoBox } from 'ergo-lib-wasm-nodejs';
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

export class MinimumFeeBox {
  protected readonly BOX_FETCHING_PAGE_SIZE = 50;
  protected logger: AbstractLogger;
  protected box: ErgoBox;
  protected tokenId: string;
  protected minimumFeeNFT: string;
  protected address: string;
  protected ergoTree: string;
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
    this.ergoTree = Address.from_base58(this.address)
      .to_ergo_tree()
      .to_base16_bytes();
    if (networkType === ErgoNetworkType.explorer)
      this.explorerClient = ergoExplorerClientFactory(networkUrl);
    else this.nodeClient = ergoNodeClientFactory(networkUrl);
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * fetches the box from the blockchain
   */
  fetchBox = async (): Promise<void> => {
    const boxes = this.explorerClient
      ? await this.fetchBoxesUsingExplorer()
      : await this.fetchBoxesUsingNode();

    const boxHasCorrectAddress = (box: ErgoBox) =>
      box.ergo_tree().to_base16_bytes() === this.ergoTree;
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

    this.box = this.selectEligibleBox(
      boxes.filter(
        (box: ErgoBox) =>
          boxHasCorrectAddress(box) && boxHasAppropriateTokens(box)
      )
    );
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
  protected fetchBoxesUsingExplorer = async (): Promise<Array<ErgoBox>> => {
    const boxes: Array<ErgoBox> = [];
    try {
      let currentPage = 0;
      let boxesPage =
        await this.explorerClient.v1.getApiV1BoxesUnspentByaddressP1(
          this.address,
          {
            offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
            limit: this.BOX_FETCHING_PAGE_SIZE,
          }
        );
      this.logger.debug(
        `requested 'explorerClient.getApiV1BoxesUnspentByaddressP1' for address [${
          this.address
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
          await this.explorerClient.v1.getApiV1BoxesUnspentByaddressP1(
            this.address,
            {
              offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
              limit: this.BOX_FETCHING_PAGE_SIZE,
            }
          );
        this.logger.debug(
          `requested 'explorerClient.getApiV1BoxesUnspentByaddressP1' for address [${
            this.address
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
      let boxesPage = await this.nodeClient.getBoxesByAddressUnspent(
        this.address,
        {
          offset: currentPage * this.BOX_FETCHING_PAGE_SIZE,
          limit: this.BOX_FETCHING_PAGE_SIZE,
        }
      );
      this.logger.debug(
        `requested 'nodeClient.getBoxesByAddressUnspent' for address [${
          this.address
        }]. res: ${JsonBigInt.stringify(boxesPage)}`
      );
      while (boxesPage.length !== 0) {
        boxes.push(
          ...boxesPage.map((box) =>
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
        this.logger.debug(
          `requested 'nodeClient.getBoxesByAddressUnspent' for address [${
            this.address
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
  getBox = (): ErgoBox => this.box;

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

    const fees = this.extractFeeFromBox().reverse();
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
   * extracts Fee config from box registers
   */
  protected extractFeeFromBox = (): Array<Fee> => {
    const R4 = this.box.register_value(4);
    const R5 = this.box.register_value(5);
    const R6 = this.box.register_value(6);
    const R7 = this.box.register_value(7);
    const R8 = this.box.register_value(8);
    const R9 = this.box.register_value(9);

    if (!R4 || !R5 || !R6 || !R7 || !R8 || !R9)
      throw Error(
        `Incomplete register data for minimum-fee config box [${this.box
          .box_id()
          .to_str()}]`
      );

    const fees: Array<Fee> = [];
    const chains = R4.to_coll_coll_byte().map((element) =>
      Buffer.from(element).toString()
    );
    const heights = R5.to_js() as Array<Array<number>>;
    const bridgeFees = R6.to_js() as Array<Array<string>>;
    const networkFees = R7.to_js() as Array<Array<string>>;
    const rsnRatios = R8.to_js() as Array<Array<Array<string>>>;
    const feeRatios = R9.to_js() as Array<Array<string>>;

    for (let feeIdx = 0; feeIdx < heights.length; feeIdx++) {
      const fee: Fee = {
        heights: {},
        configs: {},
      };
      for (let chainIdx = 0; chainIdx < chains.length; chainIdx++) {
        const chain = chains[chainIdx];

        if (heights[feeIdx][chainIdx] === -1) continue;
        fee.heights[chain] = heights[feeIdx][chainIdx];

        if (bridgeFees[feeIdx][chainIdx] === '-1') continue;
        fee.configs[chain] = {
          bridgeFee: BigInt(bridgeFees[feeIdx][chainIdx]),
          networkFee: BigInt(networkFees[feeIdx][chainIdx]),
          rsnRatio: BigInt(rsnRatios[feeIdx][chainIdx][0]),
          rsnRatioDivisor: BigInt(rsnRatios[feeIdx][chainIdx][1]),
          feeRatio: BigInt(feeRatios[feeIdx][chainIdx]),
        };
      }
      fees.push(fee);
    }

    this.logger.debug(
      `Extracted fee config from box [${this.box
        .box_id()
        .to_str()}]: ${JsonBigInt.stringify(fees)}`
    );

    return fees;
  };

  /**
   * generates a MinimumFeeBoxBuilder using current box
   *  note that 'height' parameter of builder won't be set
   */
  toBuilder = (): MinimumFeeBoxBuilder => {
    const builder = new MinimumFeeBoxBuilder(this.minimumFeeNFT, this.address)
      .setValue(BigInt(this.box.value().as_i64().to_str()))
      .setToken(this.tokenId);

    this.extractFeeFromBox().forEach((fee) => {
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
