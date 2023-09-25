import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';
import { ErgoNetworkType } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import {
  UOutputInfo,
  UTransactionInfo,
} from '@rosen-clients/ergo-explorer/dist/src/v0/types';
import { OutputInfo } from '@rosen-clients/ergo-explorer/dist/src/v1/types';
import ergoNodeClientFactory, {
  ErgoTransactionOutput,
  IndexedErgoBox,
  Transactions,
} from '@rosen-clients/ergo-node';
import { Address, ErgoBox, ErgoTree } from 'ergo-lib-wasm-nodejs';
import { jsonBigInt, min } from './utils';

export class RWTRepoBuilder {
  private lastModifiedWid?: string;
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
   * adds (wid, rwtCount) pair to this.widPermits. Also stores wid in
   * this.lastModifiedWid and does the following updates:
   * this.rwtCount -= rwtCount;
   * this.rsnCount += rwtCount;
   * @param {string} wid
   * @param {bigint} rwtCount
   * @return {RWTRepoBuilder}  {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  addNewUser(wid: string, rwtCount: bigint): RWTRepoBuilder {
    const widExists = this.widPermits.map((permit) => permit.wid).includes(wid);
    if (widExists) {
      throw new Error(`cannot add user: wid already exists in widPermits`);
    }
    this.widPermits.push({ wid, rwtCount });

    if (this.rwtCount < rwtCount) {
      throw new Error(
        `cannot add user: RWTRepoBuilder.addNewUser: this.rwtCount=[${this.rwtCount}] is less than passed rwtCount=[${rwtCount}] to addNewUser`
      );
    }
    this.rwtCount -= rwtCount;
    this.rsnCount += rwtCount;

    this.logger.debug(
      `added new user with wid=[${wid}] and rwtCount=[${rwtCount}]`
    );

    this.lastModifiedWid = wid;

    return this;
  }

  /**
   * removes (wid, rwtCount) pair from this.widPermits. Also stores wid in
   * this.lastModifiedWid and does the following updates:
   * this.rwtCount += rwtCount;
   * this.rsnCount -= rwtCount;
   *
   * @param {string} wid
   * @return {RWTRepoBuilder}  {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  removeUser(wid: string): RWTRepoBuilder {
    const widIndex = this.widPermits.map((permit) => permit.wid).indexOf(wid);
    if (widIndex === -1) {
      throw new Error(`cannot remove user: wid doesn't exist in widPermits`);
    }
    const { rwtCount } = this.widPermits.splice(widIndex, 1)[0];
    this.rwtCount += rwtCount;
    this.rsnCount -= rwtCount;

    this.logger.debug(`removed user with wid=[${wid}]`);

    this.lastModifiedWid = wid;

    return this;
  }

  /**
   * sets value of this.commitmentRwtCount
   *
   * @param {bigint} commitmentRwtCount
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  setCommitmentRwtCount(commitmentRwtCount: bigint): RWTRepoBuilder {
    this.commitmentRwtCount = commitmentRwtCount;
    return this;
  }

  /**
   * sets value of this.quorumPercentage
   *
   * @param {number} watcherQuoromPercentage
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  setWatcherQuoromPercentage(watcherQuoromPercentage: number): RWTRepoBuilder {
    this.quorumPercentage = watcherQuoromPercentage;
    return this;
  }

  /**
   * sets value of this.approvalOffset
   *
   * @param {number} approvalOffset
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  setApprovalOffset(approvalOffset: number): RWTRepoBuilder {
    this.approvalOffset = approvalOffset;
    return this;
  }

  /**
   * sets value of this.maximumApproval
   *
   * @param {number} maximumApproval
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  setMaximumApproval(maximumApproval: number): RWTRepoBuilder {
    this.maximumApproval = maximumApproval;
    return this;
  }

  /**
   * sets value of this.ergCollateral
   *
   * @param {bigint} ergCollateral
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  setErgCollateral(ergCollateral: bigint): RWTRepoBuilder {
    this.ergCollateral = ergCollateral;
    return this;
  }

  /**
   * sets value of this.rsnCollateral
   *
   * @param {bigint} rsnCollateral
   * @return {RWTRepoBuilder}
   * @memberof RWTRepoBuilder
   */
  setRsnCollateral(rsnCollateral: bigint): RWTRepoBuilder {
    this.rsnCollateral = rsnCollateral;
    return this;
  }
}

export class RWTRepo {
  protected box?: ErgoBox;
  private explorerClient: ReturnType<typeof ergoExplorerClientFactory>;
  private nodeClient: ReturnType<typeof ergoNodeClientFactory>;
  private repoErgoTree: ErgoTree;

  constructor(
    private repoAddress: string,
    private repoNft: string,
    private rwt: string,
    private networkType: ErgoNetworkType,
    private networkUrl: string,
    private logger: AbstractLogger = new DummyLogger()
  ) {
    if (networkType === ErgoNetworkType.Explorer) {
      this.explorerClient = ergoExplorerClientFactory(this.networkUrl);
    } else {
      this.nodeClient = ergoNodeClientFactory(this.networkUrl);
    }

    this.repoErgoTree = Address.from_base58(this.repoAddress).to_ergo_tree();

    this.logger.debug(
      `RWTRepo instance created with repo-address=[${this.repoAddress}] and repo-nft=[${this.repoNft}]`
    );
  }

  /**
   * fetches and updates this.box with unspent box info for this.repoAddress and
   * this.repoNft values. It uses from explorer or node api depending on
   * this.networkType value. if trackMempool is set to true then first mempool
   * is checked.
   *
   * @param {boolean} trackMempool whether first check mempool for the unspent
   * box info
   * @return {Promise<void>}
   * @memberof RWTRepo
   */
  async updateBox(trackMempool: boolean) {
    this.logger.debug(`box is being updated from ${this.networkType} api`);
    if (trackMempool && (await this.getBoxFromMempool())) {
      return;
    }
    await this.getBox();
  }

  /**
   * fetches and updates this.box with unspent box info for this.repoAddress and
   * this.repoNft values from Ergo chain's set of unspent boxes. returns
   * undefined if no unspent boxes were found
   *
   * @private
   * @return {Promise<ErgoBox | undefined>}
   * @memberof RWTRepo
   */
  private async getBox() {
    if (this.box) {
      const currentBoxInfo =
        this.networkType === ErgoNetworkType.Explorer
          ? await this.explorerClient.v1.getApiV1BoxesP1(
              this.box.box_id().to_str()
            )
          : await this.nodeClient.getBoxById(this.box.box_id().to_str());
      if (!currentBoxInfo.spentTransactionId) {
        this.logger.debug(
          `box is still unspent and didn't need to be updated: ${this.rwtRepoLogDescription}`
        );
        return this.box;
      }
    }

    let boxInfos: OutputInfo[] | IndexedErgoBox[];

    if (this.networkType === ErgoNetworkType.Explorer) {
      const explorerUnspentItems =
        await this.explorerClient.v1.getApiV1BoxesUnspentByaddressP1(
          this.repoAddress
        );

      if (explorerUnspentItems.items == undefined) {
        this.logger.info(`no unspent box found: ${this.rwtRepoLogDescription}`);
        this.box = undefined;
        return undefined;
      }

      boxInfos = explorerUnspentItems.items;
    } else {
      boxInfos = await this.nodeClient.getBoxesByAddressUnspent(
        this.repoAddress
      );
    }

    this.box = this.createBoxFromBoxInfo(boxInfos);
    this.logger.info(`box updated: ${this.rwtRepoLogDescription}`);

    return this.box;
  }

  /**
   * fetches and updates this.box with unspent box info for this.repoAddress and
   * this.repoNft values from Ergo chain's mempool. returns undefined if no
   * unspent boxes were found
   *
   * @private
   * @return {Promise<ErgoBox | undefined>}
   * @memberof RWTRepo
   */
  private async getBoxFromMempool() {
    let mempoolTxs: UTransactionInfo[] | Transactions;

    if (this.networkType === ErgoNetworkType.Explorer) {
      const explorerMempoolTxs =
        await this.explorerClient.v0.getApiV0TransactionsUnconfirmedByaddressP1(
          this.repoAddress
        );

      if (explorerMempoolTxs.items == undefined) {
        this.box = undefined;
        this.logger.debug(
          `no box found in mempool: ${this.rwtRepoLogDescription}`
        );
        return this.box;
      }

      mempoolTxs = explorerMempoolTxs.items;
    } else {
      mempoolTxs = await this.nodeClient.getUnconfirmedTransactionsByErgoTree(
        this.repoErgoTree.to_base16_bytes()
      );
    }

    this.box = this.createBoxfromTx(mempoolTxs);
    this.logger.info(`box updated from mempool: ${this.rwtRepoLogDescription}`);

    return this.box;
  }

  /**
   * creates an RWTRepo ErgoBox instance from the corresponding boxInfo in the
   * passed boxInfos array
   *
   * @private
   * @param {(IndexedErgoBox[] | OutputInfo[])} boxInfos
   * @return {ErgoBox | undefined}
   * @memberof RWTRepo
   */
  private createBoxFromBoxInfo(boxInfos: IndexedErgoBox[] | OutputInfo[]) {
    const rwtBoxInfos = boxInfos.filter((item) =>
      item.assets?.some((asset) => asset.tokenId === this.repoNft)
    );

    this.logger.debug(
      `rwtRepo boxIds received: [${rwtBoxInfos
        .map((item) => item.boxId)
        .join(', ')}]`
    );

    if (rwtBoxInfos === undefined || rwtBoxInfos.length <= 0) {
      this.logger.info(`no unspent box found: ${this.rwtRepoLogDescription}`);
      return undefined;
    }

    const box = ErgoBox.from_json(jsonBigInt.stringify(rwtBoxInfos[0]));
    return box;
  }

  /**
   * creates an RWTRepo ErgoBox instance from the corresponding boxInfo in the
   * passed transactions array
   *
   * @private
   * @param {(Transactions | UTransactionInfo[])} txs
   * @return {ErgoBox | undefined}
   * @memberof RWTRepo
   */
  private createBoxfromTx(txs: Transactions | UTransactionInfo[]) {
    const inputBoxIds = txs.flatMap(
      (tx) =>
        tx.inputs?.map((input) => ('id' in input ? input.id : input.boxId)) ||
        []
    );

    const inputBoxIdSet = new Set(inputBoxIds);

    this.logger.debug(
      `boxIds found in mempool: [${[...inputBoxIdSet].join(', ')}]`
    );

    const rwtOutputBoxInfos = txs
      .flatMap<UOutputInfo | ErgoTransactionOutput>((tx) => tx.outputs || [])
      .filter(
        (box) =>
          (('id' in box && box.id && !inputBoxIdSet.has(box.id)) ||
            ('boxId' in box && box.boxId && !inputBoxIdSet.has(box.boxId))) &&
          box.ergoTree === this.repoErgoTree.to_base16_bytes() &&
          box.assets?.some((asset) => asset.tokenId === this.repoNft)
      );

    if (!rwtOutputBoxInfos.length) {
      this.logger.debug(
        `no box found in mempool: ${this.rwtRepoLogDescription}`
      );
      return undefined;
    }

    const box = ErgoBox.from_json(jsonBigInt.stringify(rwtOutputBoxInfos[0]));
    return box;
  }

  /**
   * creates an instance of RWTRepoBuilder
   *
   * @return {RWTRepoBuilder}
   * @memberof RWTRepo
   */
  toBuilder() {
    if (!this.box) {
      const error = new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
      this.logger.error(error.message);
      throw error;
    }

    const rwtCount = BigInt(
      this.box.tokens().get(1).amount().as_i64().to_str()
    );

    const rsn = this.box.tokens().get(2).id().to_str();
    const rsnCount = BigInt(
      this.box.tokens().get(2).amount().as_i64().to_str()
    );

    const chainIdBytes = this.r4?.at(0);
    const chainId =
      chainIdBytes != undefined
        ? Buffer.from(chainIdBytes).toString('hex')
        : undefined;

    const quorumPercentage = Number(this.r6At(1));
    const approvalOffset = Number(this.r6At(2));
    const maximumApproval = Number(this.r6At(3));
    const widPermits = this.r4
      ?.slice(1)
      .map((wid) => Buffer.from(wid).toString('hex'))
      .map((wid) => {
        return { wid, rwtCount: this.getPermitCount(wid) };
      });

    if (
      !chainId ||
      !quorumPercentage ||
      !approvalOffset ||
      !maximumApproval ||
      !widPermits
    ) {
      const error = new Error(
        `could not create RWTRepoBuilder becudase one of [chainId=${chainId}, quorumPercentage=${quorumPercentage}, approvalOffset=${approvalOffset}, maximumApproval=${maximumApproval}, widPermits=${widPermits}] could not be calculated: ${this.rwtRepoLogDescription} `
      );
      this.logger.error(error.message);
      throw error;
    }

    return new RWTRepoBuilder(
      this.repoAddress,
      this.repoNft,
      this.rwt,
      rwtCount,
      rsn,
      rsnCount,
      chainId,
      this.getCommitmentRwtCount(),
      quorumPercentage,
      approvalOffset,
      maximumApproval,
      this.getErgCollateral(),
      this.getRsnCollateral(),
      widPermits,
      this.logger
    );
  }

  /**
   * extract the value of ergCollateral from R6[4] of this.box. If this.box is
   * undefined an exception is thrown
   *
   * @return {bigint}
   * @memberof RWTRepo
   */
  getErgCollateral() {
    if (!this.box) {
      const error = new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
      throw error;
    }

    const ergCollateralRegister = (
      this.box.register_value(6)?.to_i64_str_array() as string[] | undefined
    )?.at(4);

    if (!ergCollateralRegister) {
      const error = new Error(
        `could not extract ergCollateral from R6[4]: ${this.rwtRepoLogDescription} `
      );
      this.logger.error(error.message);
      throw error;
    }

    this.logger.debug(
      `ergCollateral in R6[4] register value: ${ergCollateralRegister}`
    );

    return BigInt(ergCollateralRegister);
  }

  /**
   * extract the value of rsnCollateral from R6[5] of this.box. If this.box is
   * undefined an exception is thrown
   *
   * @return {bigint}
   * @memberof RWTRepo
   */
  getRsnCollateral() {
    if (!this.box) {
      const error = new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
      this.logger.error(error.message);
      throw error;
    }

    const rsnCollateralRegister = (
      this.box.register_value(6)?.to_i64_str_array() as string[] | undefined
    )?.at(5);

    if (!rsnCollateralRegister) {
      const error = new Error(
        `could not extract rsnCollateral from R6[5]: ${this.rwtRepoLogDescription} `
      );
      this.logger.error(error.message);
      throw error;
    }

    return BigInt(rsnCollateralRegister);
  }

  /**
   * calculates and returns the value of requiredCommitmentCount according to
   * this formula: min(R6[3], R6[1] * (len(R4) - 1) / 100 + R6[2])
   *
   * @return {bigint}
   * @memberof RWTRepo
   */
  getRequiredCommitmentCount() {
    if (!this.box) {
      const error = new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
      this.logger.error(error.message);
      throw error;
    }

    const r6_1 = this.r6At(1);
    const r6_2 = this.r6At(2);
    const r6_3 = this.r6At(3);
    const r4 = this.r4;

    if (!r6_1 || !r6_2 || !r6_3 || !r4) {
      const error = new Error(
        `could not calculate RequiredCommitmentCount, because R6[1] or R6[2] or R6[3] or R4 is undefined: ${this.rwtRepoLogDescription} `
      );
      this.logger.error(error.message);
      throw error;
    }

    const requiredCommitmentCount = min(
      (r6_1 * BigInt(r4.length - 1)) / 100n + r6_2,
      r6_3
    );

    return requiredCommitmentCount;
  }

  /**
   * extract the value of commitmentRwtCount from R6[0] of this.box. If this.box
   * is undefined an exception is thrown
   *
   * @return {bigint}
   * @memberof RWTRepo
   */
  getCommitmentRwtCount() {
    if (!this.box) {
      const error = new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
      this.logger.error(error.message);
      throw error;
    }

    const commitmentRwtCount = this.r6At(0);

    if (!commitmentRwtCount) {
      const error = new Error(
        `could not extract commitmentRwtCount from R6[0]: ${this.rwtRepoLogDescription} `
      );
      this.logger.error(error.message);
      throw error;
    }

    return commitmentRwtCount;
  }

  /**
   * finds the index wid in R4 register of this.box and returns -1 if not found.
   *
   * @param {string} wid - watcher id in hex format
   * @return {number}
   * @memberof RWTRepo
   */
  getWidIndex(wid: string) {
    if (!this.box) {
      const error = new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
      this.logger.error(error.message);
      throw error;
    }

    const r4Hex = this.r4?.map((bytes) => Buffer.from(bytes).toString('hex'));

    if (!r4Hex) {
      const error = new Error(
        `could not extract widIndex for wid=[${wid}] from R4: ${this.rwtRepoLogDescription} `
      );
      this.logger.error(error.message);
      throw error;
    }

    let widIndex = r4Hex.slice(1).indexOf(wid);
    widIndex = widIndex === -1 ? widIndex : widIndex + 1;

    return widIndex;
  }

  /**
   * gets permitCount for wid by first finding widIndex (index of wid in R4) and
   * extracting R5[WidIndex] as permitCount
   *
   * @param {string} wid
   * @return {bigint}
   * @memberof RWTRepo
   */
  getPermitCount(wid: string) {
    if (!this.box) {
      const error = new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
      this.logger.error(error.message);
      throw error;
    }

    const widIndex = this.getWidIndex(wid);

    if (widIndex === -1) {
      return 0n;
    }

    const permitCount = this.r5?.at(widIndex);

    if (permitCount == undefined) {
      const error = new Error(
        `could not extract permitCount for wid=[${wid}] and widIndex=[${widIndex}] from R5: ${this.rwtRepoLogDescription} `
      );
      this.logger.error(error.message);
      throw error;
    }

    return permitCount;
  }

  /**
   * returns the value at the specified index of the R6 register of this.box as
   * a bigint
   *
   * @private
   * @param {number} index
   * @return {bigint | undefined}
   * @memberof RWTRepo
   */
  private r6At(index: number) {
    const val = (
      this.box?.register_value(6)?.to_i64_str_array() as string[] | undefined
    )?.at(index);

    return val ? BigInt(val) : undefined;
  }

  /**
   * pareses the R4 register of this.box which is a Coll[Coll[SByte]] and
   * returns it as a Uint8Array[].
   *
   * @readonly
   * @memberof RWTRepo
   */
  get r4() {
    return this.box?.register_value(4)?.to_coll_coll_byte();
  }

  /**
   * parses R5:Coll[SLong] as an array of bigints
   *
   * @readonly
   * @memberof RWTRepo
   */
  get r5() {
    return (
      this.box?.register_value(5)?.to_i64_str_array() as string[] | undefined
    )?.map(BigInt);
  }

  /**
   * returns a string description of this instance's specs that can be used in
   * logs.
   *
   * @readonly
   * @private
   * @memberof RWTRepo
   */
  private get rwtRepoLogDescription() {
    if (this.box) {
      return `boxId=[${this.box?.box_id().to_str()}]`;
    } else {
      return `no boxes stored yet!`;
    }
  }
}
