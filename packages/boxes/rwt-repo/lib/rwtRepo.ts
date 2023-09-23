import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';
import { ErgoNetworkType } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { Address, ErgoBox } from 'ergo-lib-wasm-nodejs';
import { jsonBigInt, min } from './utils';

export class RWTRepoBuilder {
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
}

export class RWTRepo {
  protected box?: ErgoBox;
  private explorerClient: ReturnType<typeof ergoExplorerClientFactory>;
  private nodeClient: ReturnType<typeof ergoNodeClientFactory>;

  constructor(
    private repoAddress: string,
    private repoNft: string,
    private rwt: string,
    private networkType: ErgoNetworkType,
    private networkUrl: string,
    private logger: AbstractLogger = new DummyLogger()
  ) {
    this.explorerClient = ergoExplorerClientFactory(this.networkUrl);
    this.nodeClient = ergoNodeClientFactory(this.networkUrl);
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
    if (this.networkType === ErgoNetworkType.Explorer) {
      if (trackMempool) {
        this.logger.info(
          `trying to update box from explorer mempool: ${this.rwtRepoLogDescription}`
        );
        if (await this.getBoxFromExplorerMempool()) {
          return;
        }
      }

      this.logger.info(
        `trying to update box from explorer api: ${this.rwtRepoLogDescription}`
      );
      await this.getBoxFromExplorer();
    } else {
      if (trackMempool) {
        this.logger.info(
          `trying to update box from node mempool: ${this.rwtRepoLogDescription}`
        );
        if (await this.getBoxFromNodeMempool()) {
          return;
        }
      }

      this.logger.info(
        `trying to update box from node api: ${this.rwtRepoLogDescription}`
      );
      await this.getBoxFromNode();
    }
  }

  /**
   * fetches and updates this.box with unspent box info for this.repoAddress and
   * this.repoNft values from explorer api. returns undefined if no unspent
   * boxes were found
   *
   * @private
   * @return {Promise<ErgoBox | undefined>}
   * @memberof RWTRepo
   */
  private async getBoxFromExplorer() {
    if (this.box) {
      const currentBoxInfo = await this.explorerClient.v1.getApiV1BoxesP1(
        this.box.box_id().to_str()
      );
      if (!currentBoxInfo.spentTransactionId) {
        this.logger.info(
          `from explorer api, box is still unspent and didn't need to be updated: ${this.rwtRepoLogDescription}`
        );
        return this.box;
      }
    }

    const itemsInfo =
      await this.explorerClient.v1.getApiV1BoxesUnspentByaddressP1(
        this.repoAddress
      );

    const rwtBoxInfos = itemsInfo.items?.filter((item) =>
      item.assets?.some((asset) => asset.tokenId === this.repoNft)
    );

    if (rwtBoxInfos === undefined || rwtBoxInfos.length <= 0) {
      this.logger.info(
        `no unspent box found in explorer api: ${this.rwtRepoLogDescription}`
      );
      return undefined;
    }

    const box = ErgoBox.from_json(jsonBigInt.stringify(rwtBoxInfos[0]));
    this.box = box;
    this.logger.info(
      `box updated from explorer api: ${this.rwtRepoLogDescription}`
    );
    return this.box;
  }

  /**
   * fetches and updates this.box with unspent box info for this.repoAddress and
   * this.repoNft values from explorer api mempool. returns undefined if no
   * unspent boxes were found
   *
   * @private
   * @return {Promise<ErgoBox | undefined>}
   * @memberof RWTRepo
   */
  private async getBoxFromExplorerMempool() {
    const txs =
      await this.explorerClient.v0.getApiV0TransactionsUnconfirmedByaddressP1(
        this.repoAddress
      );

    const inputBoxIds = txs.items?.flatMap(
      (item) => item.inputs?.map((input) => input.id) || []
    );

    const inputBoxIdSet = new Set(inputBoxIds);

    const outputBoxInfos = txs.items?.flatMap(
      (item) =>
        item.outputs?.filter(
          (output) =>
            !inputBoxIdSet.has(output.id) &&
            output.address &&
            output.address === this.repoAddress &&
            output.assets?.some((asset) => asset.tokenId === this.repoNft)
        ) || []
    );

    if (!outputBoxInfos || !outputBoxInfos.length) {
      this.logger.info(
        `no box found in explorer mempool: ${this.rwtRepoLogDescription}`
      );
      return undefined;
    }

    const box = ErgoBox.from_json(jsonBigInt.stringify(outputBoxInfos[0]));
    this.box = box;
    this.logger.info(
      `box updated from explorer mempool: ${this.rwtRepoLogDescription}`
    );
    return box;
  }

  /**
   * fetches and updates this.box with unspent box info for this.repoAddress and
   * this.repoNft values from the node api. returns undefined if no unspent
   * boxes were found
   *
   * @private
   * @return {Promise<ErgoBox | undefined>}
   * @memberof RWTRepo
   */
  private async getBoxFromNode() {
    if (this.box) {
      const boxState = await this.nodeClient.getBoxById(
        this.box.box_id().to_str()
      );
      if (!boxState.spentTransactionId) {
        this.logger.info(
          `from node api, box is still unspent and didn't need to be updated: ${this.rwtRepoLogDescription}`
        );
        return this.box;
      }
    }

    const boxInfos = await this.nodeClient.getBoxesByAddressUnspent(
      this.repoAddress
    );
    const rwtBoxInfos = boxInfos.filter((boxInfo) =>
      boxInfo.assets?.some((asset) => asset.tokenId === this.repoNft)
    );

    if (rwtBoxInfos.length <= 0) {
      this.logger.info(
        `no unspent box found in node api: ${this.rwtRepoLogDescription}`
      );
      return undefined;
    }

    const box = ErgoBox.from_json(jsonBigInt.stringify(rwtBoxInfos[0]));
    this.box = box;
    this.logger.info(
      `box updated from node api: ${this.rwtRepoLogDescription}`
    );
    return box;
  }

  /**
   * fetches and updates this.box with unspent box info for this.repoAddress and
   * this.repoNft values from the node mempool api. returns undefined if no
   * unspent boxes were found
   *
   * @private
   * @return {Promise<ErgoBox | undefined>}
   * @memberof RWTRepo
   */
  private async getBoxFromNodeMempool() {
    const repoErgoTree = Address.from_base58(this.repoAddress).to_ergo_tree();
    const txs = await this.nodeClient.getUnconfirmedTransactionsByErgoTree(
      repoErgoTree.to_base16_bytes()
    );

    const inputBoxIds = txs.flatMap(
      (tx) => tx.inputs?.map((input) => input.boxId) || []
    );

    const inputBoxIdSet = new Set(inputBoxIds);

    const rwtOutputBoxInfos = txs
      .flatMap((tx) => tx.outputs)
      .filter(
        (box) =>
          box.boxId &&
          !inputBoxIdSet.has(box.boxId) &&
          box.ergoTree === repoErgoTree.to_base16_bytes() &&
          box.assets?.some((asset) => asset.tokenId === this.repoNft)
      );

    if (!rwtOutputBoxInfos.length) {
      this.logger.info(
        `no box found in node mempool: ${this.rwtRepoLogDescription}`
      );
      return undefined;
    }

    const box = ErgoBox.from_json(jsonBigInt.stringify(rwtOutputBoxInfos[0]));
    this.box = box;
    this.logger.info(
      `box updated from node mempool: ${this.rwtRepoLogDescription}`
    );
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
      this.logger.error(error.message);
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

    const widIndex = r4Hex.indexOf(wid);

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
      return `boxId->"${this.box?.box_id().to_str()}" --- repo-address->"${
        this.repoAddress
      }" --- repo-nft->"${this.repoNft}"`;
    } else {
      return `repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`;
    }
  }
}
