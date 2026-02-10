import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

export class RWTRepoBuilder {
  private height?: number;

  constructor(
    private repoErgoTree: string,

    private repoNftId: string,

    private awcTokenId: string,

    private awcTokenCount: bigint,

    private rwt: string,

    private rwtCount: bigint,

    private rsn: string,

    private rsnCount: bigint,

    private value: bigint,

    private chainId: string,

    private watcherCount: number = 0,

    private logger: AbstractLogger = new DummyLogger(),
  ) {}

  /**
   * Add a new watcher and updates repository state.
   *
   * - Increments total watcher count by one
   * - Decrements available AWC token count by one
   * - Allocates rwt permits for the new watcher
   *
   * @param {bigint} amount rwt amount to allocate to the new watcher
   * @returns Updated RWTRepoBuilder instance
   */
  addNewUser = (amount: bigint): RWTRepoBuilder => {
    this.watcherCount += 1;
    this.awcTokenCount -= 1n;
    this.logger.debug(`added watcher, watcherCount=${this.watcherCount}`);
    return this.getPermits(amount);
  };

  /**
   * Remove a watcher and updates repository state.
   *
   * - Decrements total watcher count by one
   * - Increments available awc token count by one
   * - Revokes the specified amount of rwt permits
   *
   * @param {bigint} amount rwt amount to revoke from the removed watcher
   * @returns Updated RWTRepoBuilder instance
   * @throws Error if no watchers are registered
   */
  removeUser = (amount: bigint): RWTRepoBuilder => {
    if (this.watcherCount <= 0) throw new Error('no watchers to remove');
    this.watcherCount -= 1;
    this.awcTokenCount += 1n;
    this.logger.debug(`removed watcher, watcherCount=${this.watcherCount}`);
    return this.returnPermits(amount);
  };

  /**
   * Returns permits from a watcher to the repository, updating token counts.
   *
   * Effects:
   * - Increases rwt token count by the specified amount
   * - Decreases rsn token count by the same amount
   *
   * @param {bigint} amount - Number of permits to return
   * @returns {RWTRepoBuilder} The updated RWTRepoBuilder instance
   * @throws {Error} If rsn count is less than the specified amount (impossible case)
   */
  returnPermits = (amount: bigint): RWTRepoBuilder => {
    if (this.rsnCount < amount)
      throw new Error(
        `ImpossibleBehavior: available RSN count [${this.rsnCount}] is less than required amount [${amount}]`,
      );
    this.rwtCount += amount;
    this.rsnCount -= amount;
    this.logger.debug(
      `decreased totalPermits by ${amount}. Current counts RWT: ${this.rwtCount}, RSN: ${this.rsnCount}`,
    );
    return this;
  };

  /**
   * Gives permits to a watcher by updating token counts in the repository.
   *
   * - Decreases rwt token count by the specified amount
   * - Increases rsn token count by the same amount
   *
   * @param {bigint} amount - Number of permits to give
   * @returns {RWTRepoBuilder} The updated RWTRepoBuilder instance
   * @throws {Error} If rwt count is less than the specified amount
   */
  getPermits = (amount: bigint): RWTRepoBuilder => {
    if (this.rwtCount < amount) {
      throw new Error(
        `available RWT count [${this.rwtCount}] is less than required amount[${amount}]`,
      );
    }
    this.rwtCount -= amount;
    this.rsnCount += amount;
    this.logger.debug(
      `increased totalPermits by ${amount}. Current counts RWT: ${this.rwtCount}, RSN: ${this.rsnCount}`,
    );
    return this;
  };

  /**
   * creates a RWTRepo box from the properties of this RWTRepoBuilder instance
   *
   * @return {ergoLib.ErgoBoxCandidate}
   */
  build = (): ergoLib.ErgoBoxCandidate => {
    if (this.value == undefined || this.height == undefined) {
      throw new Error(
        `value and height should be set on the instance in order for box to be created: value=${this.value}, height=${this.height}`,
      );
    }

    const boxBuilder = new ergoLib.ErgoBoxCandidateBuilder(
      ergoLib.BoxValue.from_i64(ergoLib.I64.from_str(this.value.toString())),
      ergoLib.Contract.new(
        ergoLib.ErgoTree.from_base16_bytes(this.repoErgoTree),
      ),
      this.height,
    );
    const r4 = ergoLib.Constant.from_byte_array(
      Uint8Array.from(Buffer.from(this.chainId)),
    );
    boxBuilder.set_register_value(4, r4);

    const r5 = ergoLib.Constant.from_i64(
      ergoLib.I64.from_str(this.watcherCount.toString()),
    );
    boxBuilder.set_register_value(5, r5);
    const tokens = [
      { id: this.repoNftId, amount: 1n },
      { id: this.rwt, amount: this.rwtCount },
      { id: this.rsn, amount: this.rsnCount },
      { id: this.awcTokenId, amount: this.awcTokenCount },
    ];

    for (const token of tokens) {
      boxBuilder.add_token(
        ergoLib.TokenId.from_str(token.id),
        ergoLib.TokenAmount.from_i64(
          ergoLib.I64.from_str(token.amount.toString()),
        ),
      );
      this.logger.debug(
        `Added token to box: tokenId=[${token.id}], amount=${token.amount}`,
      );
    }

    return boxBuilder.build();
  };

  /**
   * Sets value for the box that is built by this.build method
   *
   * @param {bigint} value
   */
  setValue = (value: bigint) => {
    if (value < 0n) {
      throw new Error(`box value cannot be negative`);
    }
    this.value = value;
  };

  /**
   * Sets creation height for the box that is built by this.build method
   *
   * @param {number} height
   */
  setHeight = (height: number) => {
    if (height < 1) {
      throw new Error(`height should be a positive number`);
    }
    this.height = height;
  };
}
