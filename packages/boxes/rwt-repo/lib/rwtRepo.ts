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
import { Address, ErgoBox } from 'ergo-lib-wasm-nodejs';
import { ErgoTree } from 'ergo-lib-wasm-nodejs';
import { jsonBigInt } from './utils';

export class RWTRepoBuilder {
  constructor(
    private repoAddress: string,
    private repoNft: string,
    private rwt: string,
    private networkType: ErgoNetworkType,
    private networkUrl: string,
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
