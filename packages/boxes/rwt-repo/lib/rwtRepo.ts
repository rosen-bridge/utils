import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { ErgoNetworkType } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory, {
  V0,
  V1,
} from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory, {
  ErgoTransactionOutput,
  IndexedErgoBox,
  Transactions,
} from '@rosen-clients/ergo-node';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { RWTRepoBuilder } from './rwtRepoBuilder';
import { jsonBigInt, min } from './utils';

export class RWTRepo {
  protected _box?: ergoLib.ErgoBox;
  private explorerClient: ReturnType<typeof ergoExplorerClientFactory>;
  private nodeClient: ReturnType<typeof ergoNodeClientFactory>;
  private repoErgoTree: ergoLib.ErgoTree;

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

    this.repoErgoTree = ergoLib.Address.from_base58(
      this.repoAddress
    ).to_ergo_tree();

    this.logger.debug(
      `RWTRepo instance created with repo-address=[${this.repoAddress}] and repo-nft=[${this.repoNft}]`
    );
  }

  /**
   * fetches the unspent RWTRepo box and stores it in this.box
   *
   * @param {boolean} trackMempool whether mempool should be checked for box
   * info first
   * @return {Promise<void>}
   */
  updateBox = async (trackMempool: boolean) => {
    this.logger.debug(`box is being updated from ${this.networkType} api`);
    if (trackMempool && (await this.getBoxFromMempool())) {
      return;
    }
    await this.getBox();
  };

  /**
   * fetches the unspent RWTRepo box info from explorer or node api and stores
   * it in this.box
   *
   * @return {Promise<ErgoBox | undefined>}
   */
  private getBox = async () => {
    if (this._box) {
      const currentBoxInfo =
        this.networkType === ErgoNetworkType.Explorer
          ? await this.explorerClient.v1.getApiV1BoxesP1(
              this._box.box_id().to_str()
            )
          : await this.nodeClient.getBoxById(this._box.box_id().to_str());
      if (!currentBoxInfo.spentTransactionId) {
        this.logger.debug(
          `box is still unspent and didn't need to be updated: ${this.rwtRepoLogDescription}`
        );
        return this._box;
      }
    }

    let boxInfos: V1.OutputInfo[] | IndexedErgoBox[];

    if (this.networkType === ErgoNetworkType.Explorer) {
      const explorerUnspentItems =
        await this.explorerClient.v1.getApiV1BoxesUnspentByaddressP1(
          this.repoAddress
        );

      if (explorerUnspentItems.items == undefined) {
        this.logger.info(`no unspent box found: ${this.rwtRepoLogDescription}`);
        this._box = undefined;
        return undefined;
      }

      boxInfos = explorerUnspentItems.items;
    } else {
      boxInfos = await this.nodeClient.getBoxesByAddressUnspent(
        this.repoAddress
      );
    }

    this._box = this.createBoxFromBoxInfo(boxInfos);
    this.logger.info(`box updated: ${this.rwtRepoLogDescription}`);

    return this._box;
  };

  /**
   * fetches the unspent RWTRepo box info from mempool and stores it in
   * this.box. returns undefined if no box was found.
   *
   * @return {Promise<ErgoBox | undefined>}
   */
  private getBoxFromMempool = async () => {
    let mempoolTxs: V0.UTransactionInfo[] | Transactions;

    if (this.networkType === ErgoNetworkType.Explorer) {
      const explorerMempoolTxs =
        await this.explorerClient.v0.getApiV0TransactionsUnconfirmedByaddressP1(
          this.repoAddress
        );

      if (explorerMempoolTxs.items == undefined) {
        this._box = undefined;
        this.logger.debug(
          `no box found in mempool: ${this.rwtRepoLogDescription}`
        );
        return this._box;
      }

      mempoolTxs = explorerMempoolTxs.items;
    } else {
      mempoolTxs = await this.nodeClient.getUnconfirmedTransactionsByErgoTree(
        this.repoErgoTree.to_base16_bytes()
      );
    }

    this._box = this.createBoxfromTx(mempoolTxs);
    this.logger.info(`box updated from mempool: ${this.rwtRepoLogDescription}`);

    return this._box;
  };

  /**
   * creates an RWTRepo ErgoBox instance for this.repoNft from data in the
   * passed collection of box info
   *
   * @param {(IndexedErgoBox[] | OutputInfo[])} boxInfos
   * @return {ErgoBox | undefined}
   */
  private createBoxFromBoxInfo = (
    boxInfos: IndexedErgoBox[] | V1.OutputInfo[]
  ) => {
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

    const box = ergoLib.ErgoBox.from_json(jsonBigInt.stringify(rwtBoxInfos[0]));
    return box;
  };

  /**
   * creates an RWTRepo ErgoBox instance for this.repoNft from data in the
   * passed collection of transactions
   *
   * @param {(Transactions | UTransactionInfo[])} txs
   * @return {ErgoBox | undefined}
   */
  private createBoxfromTx = (txs: Transactions | V0.UTransactionInfo[]) => {
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
      .flatMap<V0.UOutputInfo | ErgoTransactionOutput>((tx) => tx.outputs || [])
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

    const box = ergoLib.ErgoBox.from_json(
      jsonBigInt.stringify(rwtOutputBoxInfos[0])
    );
    return box;
  };

  /**
   * creates an instance of RWTRepoBuilder using current instance's properties
   *
   * @return {RWTRepoBuilder}
   */
  toBuilder = () => {
    if (!this._box) {
      throw new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
    }

    const rwtCount = BigInt(
      this._box.tokens().get(1).amount().as_i64().to_str()
    );

    const rsn = this._box.tokens().get(2).id().to_str();
    const rsnCount = BigInt(
      this._box.tokens().get(2).amount().as_i64().to_str()
    );

    const chainIdBytes = this.r4?.at(0);
    const chainId =
      chainIdBytes != undefined
        ? Buffer.from(chainIdBytes).toString()
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
      throw new Error(
        `could not create RWTRepoBuilder because one of [chainId=${chainId}, quorumPercentage=${quorumPercentage}, approvalOffset=${approvalOffset}, maximumApproval=${maximumApproval}, widPermits=${widPermits}] could not be calculated: ${this.rwtRepoLogDescription} `
      );
    }

    this.logger.debug(
      `creating new RWTRepoBuilder instance with following arguments: repoAddress=[${
        this.repoAddress
      }], repoNft=[${this.repoNft}], rwt=[${
        this.rwt
      }], rwtCount=[${rwtCount}], rsn=[${rsn}], rsnCount=[${rsnCount}], chainId=[${chainId}], commitmentRwtCount=[${this.getCommitmentRwtCount()}], quorumPercentage=[${quorumPercentage}], approvalOffset=[${approvalOffset}], maximumApproval=[${maximumApproval}], ergCollateral=[${this.getErgCollateral()}], rsnCollateral=[${this.getRsnCollateral()}], widPermits=[${widPermits}]`
    );

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
  };

  /**
   * returns value of ergCollateral for this.box. If this.box is undefined an
   * exception is thrown
   *
   * @return {bigint}
   */
  getErgCollateral = () => {
    if (!this._box) {
      throw new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
    }

    const ergCollateralRegister = (
      this._box.register_value(6)?.to_i64_str_array() as string[] | undefined
    )?.at(4);

    if (!ergCollateralRegister) {
      throw new Error(
        `could not extract ergCollateral from R6[4]: ${this.rwtRepoLogDescription} `
      );
    }

    this.logger.debug(
      `ergCollateral in R6[4] register value: ${ergCollateralRegister}`
    );

    return BigInt(ergCollateralRegister);
  };

  /**
   * returns value of rsnCollateral for this.box. If this.box is undefined an
   * exception is thrown
   *
   * @return {bigint}
   */
  getRsnCollateral = () => {
    if (!this._box) {
      throw new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
    }

    const rsnCollateralRegister = (
      this._box.register_value(6)?.to_i64_str_array() as string[] | undefined
    )?.at(5);

    if (!rsnCollateralRegister) {
      throw new Error(
        `could not extract rsnCollateral from R6[5]: ${this.rwtRepoLogDescription} `
      );
    }

    this.logger.debug(
      `rsnCollateral in R6[5] register value: ${rsnCollateralRegister}`
    );

    return BigInt(rsnCollateralRegister);
  };

  /**
   * calculates requiredCommitmentCount according to this formula:
   * min(R6[3], R6[1] * (len(R4) - 1) / 100 + R6[2])
   *
   * @return {bigint}
   */
  getRequiredCommitmentCount = () => {
    if (!this._box) {
      throw new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
    }

    const r6_1 = this.r6At(1);
    const r6_2 = this.r6At(2);
    const r6_3 = this.r6At(3);
    const r4 = this.r4;

    if (!r6_1 || !r6_2 || !r6_3 || !r4) {
      throw new Error(
        `could not calculate RequiredCommitmentCount, because R6[1] or R6[2] or R6[3] or R4 is undefined: ${this.rwtRepoLogDescription} `
      );
    }

    const requiredCommitmentCount = min(
      (r6_1 * BigInt(r4.length - 1)) / 100n + r6_2,
      r6_3
    );

    return requiredCommitmentCount;
  };

  /**
   * returns value of commitmentRwtCount for this.box. If this.box is undefined
   * an exception is thrown.
   *
   * @return {bigint}
   */
  getCommitmentRwtCount = () => {
    if (!this._box) {
      throw new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
    }

    const commitmentRwtCount = this.r6At(0);

    if (!commitmentRwtCount) {
      throw new Error(
        `could not extract commitmentRwtCount from R6[0]: ${this.rwtRepoLogDescription} `
      );
    }

    this.logger.debug(
      `commitmentRwtCount in R6[0] register value: ${commitmentRwtCount}`
    );

    return commitmentRwtCount;
  };

  /**
   * finds the index of wid in R4 register of this.box. returns -1 if not found.
   *
   * @param {string} wid - watcher id in hex format
   * @return {number}
   */
  getWidIndex = (wid: string) => {
    if (!this._box) {
      throw new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
    }

    const r4Hex = this.r4?.map((bytes) => Buffer.from(bytes).toString('hex'));

    if (!r4Hex) {
      throw new Error(
        `could not extract widIndex for wid=[${wid}] from R4: ${this.rwtRepoLogDescription} `
      );
    }

    let widIndex = r4Hex.slice(1).indexOf(wid);
    widIndex = widIndex === -1 ? widIndex : widIndex + 1;

    if (widIndex !== -1) {
      this.logger.debug(
        `index of wid=[${wid}] found in R4: index=[${widIndex}], R4[${widIndex}]=[${r4Hex[widIndex]}]`
      );
    } else {
      this.logger.debug(`index of wid=[${wid}] not found in R4`);
    }

    return widIndex;
  };

  /**
   * returns permitCount for passed wid
   *
   * @param {string} wid
   * @return {bigint}
   */
  getPermitCount = (wid: string) => {
    if (!this._box) {
      throw new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`
      );
    }

    const widIndex = this.getWidIndex(wid);

    if (widIndex === -1) {
      return 0n;
    }

    const permitCount = this.r5?.at(widIndex);

    if (permitCount == undefined) {
      throw new Error(
        `could not extract permitCount for wid=[${wid}] and widIndex=[${widIndex}] from R5: ${this.rwtRepoLogDescription} `
      );
    }

    this.logger.debug(
      `permitCount for wid=[${wid}] in R5: permitCount=${permitCount}, widIndex=${widIndex}`
    );

    return permitCount;
  };

  /**
   * returns value of R6[index] register of this.box
   *
   * @param {number} index
   * @return {bigint | undefined}
   */
  private r6At = (index: number) => {
    const val = (
      this._box?.register_value(6)?.to_i64_str_array() as string[] | undefined
    )?.at(index);

    return val ? BigInt(val) : undefined;
  };

  /**
   * returns value of R4 register for this.box
   *
   * @readonly
   * @type {(Uint8Array[] | undefined)}
   */
  get r4(): Uint8Array[] | undefined {
    return this._box?.register_value(4)?.to_coll_coll_byte();
  }

  /**
   * returns value of R5 register for this.box
   *
   * @readonly
   * @type {(bigint[] | undefined)}
   */
  get r5(): bigint[] | undefined {
    return (
      this._box?.register_value(5)?.to_i64_str_array() as string[] | undefined
    )?.map(BigInt);
  }

  /**
   * returns a string description of this instance that can be used in logs.
   *
   * @readonly
   * @private
   * @type {string}
   */
  private get rwtRepoLogDescription(): string {
    if (this._box) {
      return `boxId=[${this._box?.box_id().to_str()}]`;
    } else {
      return `no boxes stored yet!`;
    }
  }

  /**
   * returns this instances RWTRepo box
   *
   * @readonly
   * @type {(ergoLib.ErgoBox | undefined)}
   */
  public get box(): ergoLib.ErgoBox | undefined {
    return this._box;
  }
}
