import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

export class RWTRepoBuilder {
  private value?: bigint;
  private height?: number;

  constructor(
    private repoAddress: string,

    private repoNft: string,

    private rwt: string,

    private rwtCount: bigint,

    private rsn: string,

    private rsnCount: bigint,

    private chainId: string,

    private watcherCount: number,

    private logger: AbstractLogger = new DummyLogger(),
  ) {}

  /**
   * adds a new user for the passed wid and rwt amount
   *
   * @return {RWTRepoBuilder}
   */
  addNewUser = (): RWTRepoBuilder => {
    this.watcherCount += 1;
    this.logger.debug(`added watcher, watcherCount=${this.watcherCount}`);
    return this;
  };

  /**
   * removes the user corresponding to the passed wid
   *
   * @return {RWTRepoBuilder}
   */
  removeUser = (): RWTRepoBuilder => {
    if (this.watcherCount <= 0) throw new Error('no watchers to remove');
    this.watcherCount -= 1;
    this.logger.debug(`removed watcher, watcherCount=${this.watcherCount}`);
    return this;
  };

  /**
   * decrements rwtCount. throws exception if wid not found.
   *
   * @param {bigint} amount
   * @return {RWTRepoBuilder}
   */
  decrementPermits = (amount: bigint): RWTRepoBuilder => {
    if (this.rwtCount < amount)
      throw new Error('not enough totalPermits to decrease');
    this.rwtCount += amount;
    this.rsnCount -= amount;
    this.logger.debug(`decreased totalPermits by ${amount}`);
    return this;
  };
  /**
   * increments rwtCount. throws exception if wid not found.
   *
   * @param {bigint} amount
   * @return {RWTRepoBuilder}
   */
  incrementPermits = (amount: bigint): RWTRepoBuilder => {
    if (this.rwtCount < amount) {
      throw new Error(
        `available RWT count [${this.rwtCount}] is less than required amount[${amount}]`,
      );
    }
    this.rwtCount -= amount;
    this.rsnCount += amount;
    this.logger.debug(`increased totalPermits by ${amount}`);
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
        ergoLib.Address.from_base58(this.repoAddress).to_ergo_tree(),
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

    boxBuilder.add_token(
      ergoLib.TokenId.from_str(this.repoNft),
      ergoLib.TokenAmount.from_i64(ergoLib.I64.from_str('1')),
    );
    this.logger.debug(
      `add 1 repoNft token to the box with tokenId=[${this.repoNft}]`,
    );

    boxBuilder.add_token(
      ergoLib.TokenId.from_str(this.rwt),
      ergoLib.TokenAmount.from_i64(
        ergoLib.I64.from_str(this.rwtCount.toString()),
      ),
    );
    this.logger.debug(
      `add ${this.rwtCount} rwt tokens to the box with tokenId=[${this.rwt}]`,
    );

    boxBuilder.add_token(
      ergoLib.TokenId.from_str(this.rsn),
      ergoLib.TokenAmount.from_i64(
        ergoLib.I64.from_str(this.rsnCount.toString()),
      ),
    );
    this.logger.debug(
      `add ${this.rsn} rsn tokens to the box with tokenId=[${this.rsn}]`,
    );

    return boxBuilder.build();
  };

  /**
   * sets value for the box that is built by this.build method
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
   * sets creation height for the box that is built by this.build method
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
