import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

export class RWTRepoBuilder {
  private value?: bigint;
  private height?: number;
  private lastModifiedWidIndex?: number;

  constructor(
    private repoAddress: string,
    private repoNft: string,
    private rwt: string,
    private rwtCount: bigint,
    private rsn: string,
    private rsnCount: bigint,
    private chainId: string,
    private commitmentRwtCount: bigint,
    private quorumPercentage: number,
    private approvalOffset: number,
    private maximumApproval: number,
    private ergCollateral: bigint,
    private rsnCollateral: bigint,
    private widPermits: Array<{ wid: string; rwtCount: bigint }>,
    private logger: AbstractLogger = new DummyLogger()
  ) {}

  /**
   * adds (wid, rwtCount) pair to this.widPermits. Also does the following
   * updates:
   * this.rwtCount -= rwtCount;
   * this.rsnCount += rwtCount;
   * @param {string} wid
   * @param {bigint} rwtCount
   * @return {RWTRepoBuilder}  {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  addNewUser = (wid: string, rwtCount: bigint): RWTRepoBuilder => {
    const widExists = this.widPermits.map((permit) => permit.wid).includes(wid);
    if (widExists) {
      throw new Error(`cannot add user: wid already exists in widPermits`);
    }
    this.widPermits.push({ wid, rwtCount });

    if (this.rwtCount < rwtCount) {
      throw new Error(
        `available RWT count [${this.rwtCount}] is less than required rwt count[${rwtCount}]`
      );
    }
    this.rwtCount -= rwtCount;
    this.rsnCount += rwtCount;

    this.logger.debug(
      `added new user with wid=[${wid}] and rwtCount=[${rwtCount}]`
    );

    return this;
  };

  /**
   * removes (wid, rwtCount) pair from this.widPermits. Also stores wid's index
   * in this.lastModifiedWidIndex and does the following updates:
   * this.rwtCount += rwtCount;
   * this.rsnCount -= rwtCount;
   *
   * @param {string} wid
   * @return {RWTRepoBuilder}  {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  removeUser = (wid: string): RWTRepoBuilder => {
    const widIndex = this.indexOfWid(wid);

    if (widIndex === -1) {
      throw new Error(`cannot remove user: wid doesn't exist in widPermits`);
    }
    const { rwtCount } = this.widPermits.splice(widIndex, 1)[0];
    this.rwtCount += rwtCount;
    this.rsnCount -= rwtCount;

    this.logger.debug(`removed user with wid=[${wid}]`);
    this.lastModifiedWidIndex = widIndex;

    return this;
  };

  /**
   * sets value of this.commitmentRwtCount
   *
   * @param {bigint} commitmentRwtCount
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  setCommitmentRwtCount = (commitmentRwtCount: bigint): RWTRepoBuilder => {
    this.commitmentRwtCount = commitmentRwtCount;
    return this;
  };

  /**
   * sets value of this.quorumPercentage
   *
   * @param {number} watcherQuorumPercentage
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  setWatcherQuorumPercentage = (
    watcherQuorumPercentage: number
  ): RWTRepoBuilder => {
    this.quorumPercentage = watcherQuorumPercentage;
    return this;
  };

  /**
   * sets value of this.approvalOffset
   *
   * @param {number} approvalOffset
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  setApprovalOffset = (approvalOffset: number): RWTRepoBuilder => {
    this.approvalOffset = approvalOffset;
    return this;
  };

  /**
   * sets value of this.maximumApproval
   *
   * @param {number} maximumApproval
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  setMaximumApproval = (maximumApproval: number): RWTRepoBuilder => {
    this.maximumApproval = maximumApproval;
    return this;
  };

  /**
   * sets value of this.ergCollateral
   *
   * @param {bigint} ergCollateral
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  setErgCollateral = (ergCollateral: bigint): RWTRepoBuilder => {
    this.ergCollateral = ergCollateral;
    return this;
  };

  /**
   * sets value of this.rsnCollateral
   *
   * @param {bigint} rsnCollateral
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  setRsnCollateral = (rsnCollateral: bigint): RWTRepoBuilder => {
    this.rsnCollateral = rsnCollateral;
    return this;
  };

  /**
   * decrements rwtCount for a specific wid in RWTRepoBuilder.widPermits by the
   * specified amount. throws exception if wid not found in
   * RWTRepoBuilder.widPermits array. Also stores the passed wid in
   * RWTRepoBuilder.lastModifiedWid and does the following updates:
   * RWTRepoBuilder.rwtCount += rwtCount;
   * RWTRepoBuilder.rsnCount -= rwtCount;
   *
   * @param {string} wid
   * @param {bigint} rwtCount
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  decrementPermits = (wid: string, rwtCount: bigint): RWTRepoBuilder => {
    const index = this.indexOfWid(wid);
    if (index === -1) {
      throw new Error(`wid=[${wid}] not found in widPermits`);
    }
    this.widPermits[index].rwtCount -= rwtCount;
    this.rwtCount += rwtCount;
    this.rsnCount -= rwtCount;
    this.lastModifiedWidIndex = index;
    return this;
  };

  /**
   * increments rwtCount for a specific wid in RWTRepoBuilder.widPermits by the
   * specified amount. throws exception if wid not found in
   * RWTRepoBuilder.widPermits array. Also stores the passed wid in
   * RWTRepoBuilder.lastModifiedWid and does the following updates:
   * RWTRepoBuilder.rwtCount -= rwtCount;
   * RWTRepoBuilder.rsnCount += rwtCount;
   *
   * @param {string} wid
   * @param {bigint} rwtCount
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  incrementPermits = (wid: string, rwtCount: bigint): RWTRepoBuilder => {
    const index = this.indexOfWid(wid);
    if (index === -1) {
      throw new Error(`wid=[${wid}] not found in widPermits`);
    }
    this.widPermits[index].rwtCount += rwtCount;
    this.rwtCount -= rwtCount;
    this.rsnCount += rwtCount;
    this.lastModifiedWidIndex = index;
    return this;
  };

  /**
   * creates a RWTRepo box from the properties of this RWTRepoBuilder instance
   *
   * @return {ergoLib.ErgoBoxCandidate}
   * @memberof RWTRepoBuilder
   */
  build = (): ergoLib.ErgoBoxCandidate => {
    if (this.value == undefined || this.height == undefined) {
      throw new Error(
        `value and height should be set on the instance in order for box to be created: value=${this.value}, height=${this.height}`
      );
    }

    const boxBuilder = new ergoLib.ErgoBoxCandidateBuilder(
      ergoLib.BoxValue.from_i64(ergoLib.I64.from_str(this.value.toString())),
      ergoLib.Contract.new(
        ergoLib.Address.from_base58(this.repoAddress).to_ergo_tree()
      ),
      this.height
    );

    this.logger.debug(
      `using following permits in R4 to build the box: [${this.widPermits}]`
    );
    const r4 = ergoLib.Constant.from_coll_coll_byte(
      [this.chainId, ...this.widPermits.map((permit) => permit.wid)].map(
        (item, index) =>
          Uint8Array.from(Buffer.from(item, index === 0 ? undefined : 'hex'))
      )
    );
    boxBuilder.set_register_value(4, r4);

    const r5 = ergoLib.Constant.from_i64_str_array(
      [0n, ...this.widPermits.map((permit) => permit.rwtCount)].map((item) =>
        item.toString()
      )
    );
    boxBuilder.set_register_value(5, r5);

    const r6 = ergoLib.Constant.from_i64_str_array(
      [
        this.commitmentRwtCount,
        this.quorumPercentage,
        this.approvalOffset,
        this.maximumApproval,
        this.ergCollateral,
        this.rsnCollateral,
      ].map((item) => item.toString())
    );
    boxBuilder.set_register_value(6, r6);

    if (this.lastModifiedWidIndex != undefined) {
      const r7 = ergoLib.Constant.from_i32(this.lastModifiedWidIndex);
      boxBuilder.set_register_value(7, r7);
    }

    boxBuilder.add_token(
      ergoLib.TokenId.from_str(this.repoNft),
      ergoLib.TokenAmount.from_i64(ergoLib.I64.from_str('1'))
    );
    this.logger.debug(
      `add 1 repoNft token to the box with tokenId=[${this.repoNft}]`
    );

    boxBuilder.add_token(
      ergoLib.TokenId.from_str(this.rwt),
      ergoLib.TokenAmount.from_i64(
        ergoLib.I64.from_str(this.rwtCount.toString())
      )
    );
    this.logger.debug(
      `add ${this.rwtCount} rwt tokens to the box with tokenId=[${this.rwt}]`
    );

    boxBuilder.add_token(
      ergoLib.TokenId.from_str(this.rsn),
      ergoLib.TokenAmount.from_i64(
        ergoLib.I64.from_str(this.rsnCount.toString())
      )
    );
    this.logger.debug(
      `add ${this.rsn} rsn tokens to the box with tokenId=[${this.rsn}]`
    );

    return boxBuilder.build();
  };

  /**
   * sets value for the box to be built through RWTRepoBuilder.build method
   *
   * @param {bigint} value
   * @memberof RWTRepoBuilder
   */
  setValue = (value: bigint) => {
    if (value < 0n) {
      throw new Error(`box value cannot be negative`);
    }
    this.value = value;
  };

  /**
   * sets creation height for the box to be built through RWTRepoBuilder.build
   * method
   *
   * @param {number} height
   * @memberof RWTRepoBuilder
   */
  setHeight = (height: number) => {
    if (height < 1) {
      throw new Error(`height should be a positive number`);
    }
    this.height = height;
  };

  /**
   * finds index of the passed wid in this.widPermits array
   *
   * @param {string} wid
   * @memberof RWTRepoBuilder
   */
  indexOfWid = (wid: string): number => {
    return this.widPermits.findIndex((permit) => permit.wid === wid);
  };
}
