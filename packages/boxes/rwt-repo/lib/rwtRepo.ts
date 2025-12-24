import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { RWTRepoBuilder } from './rwtRepoBuilder';

export class RWTRepo {
  private readonly chainId: string;
  private readonly totalWatchers: number;
  constructor(
    protected box: ergoLib.ErgoBox,
    private logger: AbstractLogger = new DummyLogger(),
  ) {
    try {
      if (this.box.tokens().len() < 4) {
        throw new Error(
          'Invalid RWTRepo box: expected at least 4 tokens (NFT, RWT, RSN, AWC)',
        );
      }

      const chainIdReg = this.box.register_value(4);
      if (!chainIdReg) {
        throw new Error('Invalid RWTRepo box: missing R4 register (chainId)');
      }
      this.chainId = Buffer.from(chainIdReg.to_byte_array()).toString('utf8');

      const totalWatchersReg = this.box.register_value(5);
      if (!totalWatchersReg) {
        throw new Error(
          'Invalid RWTRepo box: missing R5 register (totalWatchers)',
        );
      }
      this.totalWatchers = Number(totalWatchersReg.to_i64().to_str());

      this.logger.debug(
        `RWTRepo created repoNft=[${this.getRepoNftId()}] chainId=[${this.chainId}] watchers=[${this.totalWatchers}]`,
      );
    } catch (e) {
      throw Error(`Failed to create RWTRepo: ${e}`);
    }
  }

  /**
   * Creates an instance of RWTRepoBuilder using current instance's properties
   *
   * @return {RWTRepoBuilder}
   */
  toBuilder = (): RWTRepoBuilder => {
    return new RWTRepoBuilder(
      this.getRepoErgoTree(),
      this.getRepoNftId(),
      this.getAwcId(),
      this.getAwcCount(),
      this.getRwtId(),
      this.getRwtCount(),
      this.getRsnId(),
      this.getRsnCount(),
      this.chainId,
      this.totalWatchers,
      this.logger,
    );
  };

  /**
   * Return the name of the chain
   *
   * @returns {string} chainId
   */
  getChainName = (): string => {
    return this.chainId;
  };

  /**
   * Return the count of the total watchers
   *
   * @returns {number} totalWatchers
   */
  getTotalWatcherCount = (): number => {
    return this.totalWatchers;
  };

  getRepoErgoTree = (): string => {
    return this.box.ergo_tree().to_base16_bytes();
  };

  /**
   * Reads the id of the RepoNft token (index 0) from the box.
   *
   * @returns {string} RWT token amount as bigint
   */
  getRepoNftId = (): string => {
    return this.box.tokens().get(0).id().to_str();
  };

  /**
   * Reads the id of the RWT token (index 1) from the box.
   *
   * @returns {string} RWT token amount as bigint
   */
  getRwtId = (): string => {
    return this.box.tokens().get(1).id().to_str();
  };

  /**
   * Reads the amount of the RWT token (index 1) from the box.
   *
   * @returns {bigint} RWT token amount as bigint
   */
  getRwtCount = (): bigint => {
    return BigInt(this.box.tokens().get(1).amount().as_i64().to_str());
  };

  /**
   * Reads the RSN token ID (index 2) from the box.
   *
   * @returns {string} RSN token ID as a string
   */
  getRsnId = (): string => {
    return this.box.tokens().get(2).id().to_str();
  };

  /**
   * Reads the amount of the RSN token (index 2) from the box.
   *
   * @returns {bigint} RSN token amount as bigint
   */
  getRsnCount = (): bigint => {
    return BigInt(this.box.tokens().get(2).amount().as_i64().to_str());
  };

  /**
   * Reads the AWC token ID (index 3) from the box.
   *
   * @returns {string} AWC token ID as a string
   */
  getAwcId = (): string => {
    return this.box.tokens().get(3).id().to_str();
  };

  /**
   * Reads the amount of the AWC token (index 3) from the box.
   *
   * @returns {bigint} AWC token amount as bigint
   */
  getAwcCount = (): bigint => {
    return BigInt(this.box.tokens().get(3).amount().as_i64().to_str());
  };
}
