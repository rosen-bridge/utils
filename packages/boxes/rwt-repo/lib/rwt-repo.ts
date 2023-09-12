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

// const rwtRepo = new RWTRepo(
//   '5qwczr7KdspNWq5dg6FZJZSDJ9YGcYDsCVi53E6M9gPamGjQTee9Zp5HLbJXQvWJ49ksh9Ao9YK3VcjHZjVVN2rP74YoYUwCo1xY25jJQRvmqF7tMJdUYAWxB1mg3U5xrcYy6oKhev7TNtnzgWW9831r6yx5B9jmBDj7FoC36s8y7DeKQPsG1HaZLBnyLyR8iKWRUeASSFg8QXMksZdE1ZgsnF218aEmjbeEmnj2DcjwQgatAhJKRzN24PNStzk2D41UL3Xe5FSTyVw7p3u6vXim2hDSKj3qAcGboaVv9SKayhbezzdYxiuKodcyggY63H39cUhgYFwHWahpNhVZBjWP4Q4yAm7ebxjfF2RFFjW8njZNGS1SERo5dqRZZcQ79faKeXmNkZ47TnHB8qQHhwxg4BVEWppfWUyoTbSFdBHGxZufej126i8P3QZaTT7Wi28iC8HA9xTj8ZT7A5facme2TGCFjVucYjRzPLd8PXHqjPq9hoAvUjRQi9pV6uppFppuhAPoNrCyi8JA2yTEcohaokoYLmRgp86QKW4AgCADJKhTczSoHz5wsDbbzTsGeoajPwPEosM2dDazqBobiuhnX5x1m4iegB4QWYJkeNWxPdXCWgxK3fTqGDhKdS6jja9nKUMtixmaLPrwLF22S61NcifoxwEfgTKT11UnmtGMCXkkTDkcreuGUkhZMAG7Kqy3MeuMvJin8f6fb6Mivr6A6ad6rqKChyPiFWr2YaeVbdeidGbQrW9FfjvYhRrTkwBBMcRac6eazjmVqYbe9Mqy1znj8t5PpdyndoGZHPmSbYo9ZF3ZTbjh9qT3kKPQ6TVc772NGyrYWaupPsbk7MJYTBZ5WWtnHbxQyqSLAEmeq4csX3pr5kcgQCoqkqY3UkgoFRBjsTDFp61FiAc6KdivhAh4AvWB5jAYKfqps6XwgQrCRqifD8XN6k6k41Cs6UeMU5FzH4fMqEwBTDyAsCigVaY7gz3eMdDrARc1Ec23rEYepqtuBeWe2ienoMgYazHwp27DvinbAyppFziYmf1n898UXpNqsD5ctyZxQ54n67mEXUAuYq7nJMEsTQpYSX9P4dh6qP9geDbYRbFwpN27gJG5HwqwhFwk1n4ytVxVrc7nHqUe86c5gPXb1DZTgJc9YC9b3yQhE6gcNk83Yn8vkrHvHXPE7wgzxQHgV1iMBtk8DkoFCBbHcd3X4MTskaSNKYcWgx4QPSf2GAg2xcsgRePe6ZKRuRLqoZ8dJKyZRc911UUxkY7qd4ZaBrp8ymmWy2s3mjbN3CY9uqXTLTdokNVUzdvAcrC8SKUAqbX567RN9TcuE5FmagD7RFpmy6eVME1MWSvdscheeoXWcvMCYPwVAvotnFrsypXmnZHXgEdNLQVsk19iNQKYG7Lxu51msGC7gKmVGaiifzrB',
//   '32ee5d947cfe8db5480157ffa566b9b7d9faf41fa145c9d00628c7c1599878f6',
//   '',
//   ErgoNetworkType.Explorer,
//   'https://api.ergoplatform.com/',
// );

// await rwtRepo.updateBox(false);
// console.log(
//   `#### commitmentCount: ${rwtRepo.r4
//     ?.length} --- "${rwtRepo.getRequiredCommitmentCount()}"`,
// );
