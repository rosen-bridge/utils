import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';
import { ErgoNetworkType } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { Address, ErgoBox } from 'ergo-lib-wasm-nodejs';
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
    if (this.networkType === ErgoNetworkType.Explorer) {
      if (trackMempool && (await this.getBoxFromExplorerMempool())) {
        return;
      }

      await this.getBoxFromExplorer();
    } else {
      if (trackMempool && (await this.getBoxFromNodeMempool())) {
        return;
      }

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
        this.logger.debug(
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

    this.logger.debug(
      `rwtRepo boxIds from explorer api: [${rwtBoxInfos
        ?.map((item) => item.boxId)
        .join(', ')}]`
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

    this.logger.debug(
      `boxIds found in explorer mempool api: [${[...inputBoxIdSet].join(', ')}]`
    );

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
      this.logger.debug(
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
        this.logger.debug(
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

    this.logger.debug(
      `rwtRepo boxIds from node api: [${rwtBoxInfos
        .map((item) => item.boxId)
        .join(', ')}]`
    );

    if (rwtBoxInfos.length <= 0) {
      this.logger.debug(
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

    this.logger.debug(
      `boxIds found in node mempool api: [${[...inputBoxIdSet].join(', ')}]`
    );

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
      this.logger.debug(
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
