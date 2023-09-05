import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';
import { ErgoNetworkType } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { UOutputInfo } from '@rosen-clients/ergo-explorer/dist/src/v0/types';
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
    private quoromPercentage: number,
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

  constructor(
    private repoAddress: string,
    private repoNft: string,
    private rwt: string,
    private networkType: ErgoNetworkType,
    private networkUrl: string,
    private logger: AbstractLogger = new DummyLogger()
  ) {}

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
          `trying to update box from explorer mempool: repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
        );
        if (await this.getBoxFromExplorerMempool()) {
          return;
        }
      }

      this.logger.info(
        `trying to update box from explorer api: repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
      );
      await this.getBoxFromExplorer();
    } else {
      if (trackMempool) {
        this.logger.info(
          `trying to update box from node mempool: repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
        );
        if (await this.getBoxFromNodeMempool()) {
          return;
        }
      }

      this.logger.info(
        `trying to update box from node api: repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
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
    const explorer = ergoExplorerClientFactory(this.networkUrl);

    if (this.box) {
      const currentBoxInfo = await explorer.v1.getApiV1BoxesP1(
        this.box.box_id.toString()
      );
      if (currentBoxInfo.spentTransactionId === undefined) {
        this.logger.info(
          `from explorer api, box with id "${this.box.box_id}" is still unspent and didn't need to be updated: repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
        );
        return this.box;
      }
    }

    const itemsInfo = await explorer.v1.getApiV1BoxesUnspentByaddressP1(
      this.repoAddress
    );

    const rwtBoxInfos = itemsInfo.items?.filter((item) =>
      item.assets?.some((asset) => asset.tokenId === this.repoNft)
    );

    if (rwtBoxInfos === undefined || rwtBoxInfos.length <= 0) {
      this.logger.info(
        `no unspent box found in explorer api: repo-repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
      );
      return undefined;
    }

    const box = ErgoBox.from_json(jsonBigInt.stringify(rwtBoxInfos[0]));
    this.box = box;
    this.logger.info(
      `box updated from explorer api: repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
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
    const explorer = ergoExplorerClientFactory(this.networkUrl);

    const txs = await explorer.v0.getApiV0TransactionsUnconfirmedByaddressP1(
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
        `no box found in explorer mempool: repo-repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
      );
      return undefined;
    }

    const box = ErgoBox.from_json(jsonBigInt.stringify(outputBoxInfos[0]));
    this.box = box;
    this.logger.info(
      `box updated from explorer mempool: repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
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
    const node = ergoNodeClientFactory(this.networkUrl);

    if (this.box) {
      const boxState = await node.getBoxById(this.box.box_id.toString());
      if (boxState.spentTransactionId === undefined) {
        this.logger.info(
          `from node api, box "${this.box.box_id}" is still unspent and didn't need to update: repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
        );
        return this.box;
      }
    }

    const boxInfos = await node.getBoxesByAddressUnspent(this.repoAddress);
    const rwtBoxInfos = boxInfos.filter((boxInfo) =>
      boxInfo.assets?.some((asset) => asset.tokenId === this.repoNft)
    );

    if (rwtBoxInfos.length <= 0) {
      this.logger.info(
        `no unspent box found in node api: repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
      );
      return undefined;
    }

    const box = ErgoBox.from_json(jsonBigInt.stringify(rwtBoxInfos[0]));
    this.box = box;
    this.logger.info(
      `box updated from node api: repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
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
    const node = ergoNodeClientFactory(this.networkUrl);

    const repoErgoTree = Address.from_base58(this.repoAddress).to_ergo_tree();
    const txs = await node.getUnconfirmedTransactionsByErgoTree(
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
        `no box found in node mempool: repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
      );
      return undefined;
    }

    const box = ErgoBox.from_json(jsonBigInt.stringify(rwtOutputBoxInfos[0]));
    this.box = box;
    this.logger.info(
      `box updated from node mempool: repo-address->"${this.repoAddress}" --- repo-nft->"${this.repoNft}"`
    );
    return box;
  }
}
