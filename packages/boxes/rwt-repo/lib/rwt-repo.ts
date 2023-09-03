import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';

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
  constructor(
    private repoAddress: string,
    private repoNft: string,
    private rwt: string,
    private networkType: ErgoNetworkType,
    private networkUrl: string,
    private logger: AbstractLogger = new DummyLogger()
  ) {}

  // TODO: implement this
  updateBox(trackMempool: boolean) {
    return trackMempool;
  }

  async getBoxFromExplorer() {
    const explorer = ergoExplorerClientFactory(this.networkUrl);
    const itemsInfo = await explorer.v1.getApiV1BoxesUnspentByaddressP1(
      this.repoAddress
    );

    const repoBoxes = itemsInfo.items?.filter((item) =>
      item.assets?.some((asset) => asset.tokenId === this.repoNft)
    );

    if (repoBoxes === undefined || repoBoxes.length <= 0) {
      const error = new Error(
        `no unspent boxes wtih address "${this.repoAddress}" and NFT-ID "${this.repoNft}" were found by explorer`
      );
      this.logger.error(error.message);
      throw error;
    }

    return repoBoxes[0];
  }

  async getBoxFromNode() {
    const node = ergoNodeClientFactory(this.networkUrl);
    const boxes = await node.getBoxesByAddressUnspent(this.repoAddress);
    const repoBoxes = boxes.filter((box) =>
      box.assets?.some((asset) => asset.tokenId === this.repoNft)
    );

    if (repoBoxes.length <= 0) {
      const error = new Error(
        `no unspent boxes wtih address "${this.repoAddress}" and NFT-ID "${this.repoNft}" were found by Ergo node`
      );
      this.logger.error(error.message);
      throw error;
    }

    return repoBoxes[0];
  }
}

export enum ErgoNetworkType {
  Node,
  Explorer,
}
