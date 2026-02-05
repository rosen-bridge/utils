import { Address, ErgoTree, NetworkPrefix } from 'ergo-lib-wasm-nodejs';
import { ChainMinimumFee, ErgoBoxWrapper, Fee } from './types';
import { FailedError, NotFoundError } from './errors';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { MinimumFeeBoxBuilder } from './minimumFeeBoxBuilder';
import { MinimumFeeConfig } from './minimumFeeConfig';
import { ERGO_NATIVE_TOKEN } from './constants';
import { extractFeeFromBox } from './utils';
import AbstractMinimumFeeNetwork from './network/abstract';

export class MinimumFeeBox {
  protected readonly BOX_FETCHING_PAGE_SIZE = 50;
  protected logger: AbstractLogger;
  protected box: ErgoBoxWrapper | undefined;
  protected tokenId: string;
  protected minimumFeeNFT: string;
  protected network: AbstractMinimumFeeNetwork;

  constructor(
    tokenId: string,
    minimumFeeNFT: string,
    network: AbstractMinimumFeeNetwork,
    logger?: AbstractLogger,
  ) {
    this.tokenId = tokenId;
    this.minimumFeeNFT = minimumFeeNFT;
    this.network = network;
    this.logger = logger ? logger : new DummyLogger();
  }

  /**
   * fetches the box from the blockchain
   * @returns true if action was successful, otherwise false
   */
  fetchBox = async (): Promise<boolean> => {
    const boxHasAppropriateTokens = (box: ErgoBoxWrapper) => {
      const tokenLen = box.assets.length;
      let hasMinimumFeeNFT = false;
      let hasTargetToken = this.tokenId === ERGO_NATIVE_TOKEN ? true : false;
      const hasCorrectTokens =
        this.tokenId === ERGO_NATIVE_TOKEN ? tokenLen === 1 : tokenLen === 2;
      for (let i = 0; i < tokenLen; i++) {
        const id = box.assets[i].tokenId;
        if (id === this.minimumFeeNFT) hasMinimumFeeNFT = true;
        else if (id === this.tokenId) hasTargetToken = true;
      }
      return hasCorrectTokens && hasMinimumFeeNFT && hasTargetToken;
    };

    try {
      const boxes = await this.network.getBoxesByTokenId(this.minimumFeeNFT);

      this.box = this.selectEligibleBox(
        boxes.filter((box: ErgoBoxWrapper) => boxHasAppropriateTokens(box)),
      );
      return true;
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof FailedError) {
        this.logger.warn(`No valid minimum-fee box. reason: ${e}`);
        this.box = undefined;
      } else {
        this.logger.warn(
          `An error occurred while updating minimum-fee box for token [${this.tokenId}]: ${e}`,
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
  protected selectEligibleBox = (
    eligibleBoxes: Array<ErgoBoxWrapper>,
  ): ErgoBoxWrapper => {
    this.logger.debug(
      `Found [${
        eligibleBoxes.length
      }] minimum-fee boxes: ${JsonBigInt.stringify(eligibleBoxes)}`,
    );

    if (eligibleBoxes.length === 0) {
      throw new NotFoundError(
        `Found no minimum-fee box for token [${this.tokenId}]`,
      );
    } else if (eligibleBoxes.length > 1) {
      throw new FailedError(
        `Found [${eligibleBoxes.length}] minimum-fee boxes for token [${this.tokenId}]`,
      );
    } else {
      this.logger.debug(
        `Found minimum-fee box [${eligibleBoxes[0].boxId}] for token [${this.tokenId}]`,
      );
      return eligibleBoxes[0];
    }
  };

  /**
   * returns fetched config box
   */
  getBox = (): ErgoBoxWrapper | undefined => this.box;

  /**
   * gets current feeConfig
   */
  getConfigs = (): Array<Fee> => {
    if (!this.box) throw Error(`Box is not fetched yet`);
    const fee = extractFeeFromBox(this.box);
    this.logger.debug(
      `Extracted fee config from box [${
        this.box.boxId
      }]: ${JsonBigInt.stringify(fee)}`,
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
    toChain: string,
  ): ChainMinimumFee => {
    if (!this.box) throw Error(`Box is not fetched yet`);

    const fees = this.getConfigs().reverse();
    for (const fee of fees) {
      if (!Object.hasOwn(fee.heights, fromChain))
        throw new NotFoundError(
          `No fee found for chain [${fromChain}] in box [${this.box.boxId}]`,
        );
      if (fee.heights[fromChain] < height) {
        const chainFee = fee.configs[toChain];
        if (chainFee) return new ChainMinimumFee(chainFee);
        else
          throw new Error(
            `Chain [${toChain}] is not supported at given height of fromChain [${height} of ${fromChain}] in box [${this.box.boxId}]`,
          );
      }
    }

    throw new NotFoundError(
      `Config does not support height [${height}] for chain [${fromChain}] in box [${
        this.box.boxId
      }]`,
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
      Address.recreate_from_ergo_tree(
        ErgoTree.from_base16_bytes(this.box.ergoTree),
      ).to_base58(NetworkPrefix.Mainnet),
    )
      .setValue(BigInt(this.box.value))
      .setToken(this.tokenId);

    this.getConfigs().forEach((fee) => {
      this.logger.debug(
        `Extracted fee config from box [${this.box!.boxId}]: ${JsonBigInt.stringify(
          fee,
        )}`,
      );
      const chainFee = new MinimumFeeConfig();
      Object.keys(fee.heights).forEach((chain) => {
        if (Object.hasOwn(fee.configs, chain))
          chainFee.setChainConfig(
            chain,
            fee.heights[chain],
            fee.configs[chain],
          );
        else chainFee.setChainConfig(chain, fee.heights[chain], undefined);
      });
      builder.addConfig(chainFee);
    });
    return builder;
  };
}
