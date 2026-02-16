import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

export class RepoConfig {
  private r4Values: string[];

  constructor(
    private repoConfigBox: ergoLib.ErgoBox,
    private logger: AbstractLogger = new DummyLogger(),
  ) {
    try {
      const r4 = this.repoConfigBox.register_value(4);
      if (!r4 || r4.to_i64_str_array().length < 6) {
        throw new Error('Invalid Repo config box: missing R4 register');
      }
      this.r4Values = r4.to_i64_str_array();
    } catch (e) {
      throw Error(`Failed to create repo config: ${e}`);
    }
  }

  /**
   * returns the count of required Rwt count for a commitment
   *
   * @returns {bigint} Commitment Rwt count
   */
  getCommitmentRwtCount = (): bigint => {
    return BigInt(this.r4Values[0]);
  };

  /**
   * returns the required percentage of a chain watchers
   *
   * @returns {number} Watcher quorum percentage
   */
  getPercentage = (): number => {
    return Number(this.r4Values[1]);
  };

  /**
   * returns minimum number of commitment for approval offset
   *
   * @returns {bigint} minimum needed approval
   */
  getMinApproval = (): bigint => {
    return BigInt(this.r4Values[2]);
  };

  /**
   * returns maximum number of commitment for an event
   *
   * @returns {bigint} maximum needed approval
   */
  getMaxApproval = (): bigint => {
    return BigInt(this.r4Values[3]);
  };

  /**
   * returns required amount value for a collateral Box
   *
   * @returns {bigint} required Erg for collateral
   */
  getCollateralErg = (): bigint => {
    return BigInt(this.r4Values[4]);
  };

  /**
   * returns required amount locked rsn token for a collateral Box
   *
   * @returns {bigint} required rsn for collateral
   */
  getCollateralRsn = (): bigint => {
    return BigInt(this.r4Values[5]);
  };

  /**
   * Minimum number of commitments needed for an event
   *
   * @param {number} watcherCount
   * @returns {bigint} number of commitment
   */
  getMinCommitment = (watcherCount: number): bigint => {
    const formula =
      this.getMinApproval() +
      BigInt(Math.floor((this.getPercentage() * watcherCount) / 100));
    return (
      (this.getMaxApproval() < formula ? this.getMaxApproval() : formula) + 1n
    );
  };
}
