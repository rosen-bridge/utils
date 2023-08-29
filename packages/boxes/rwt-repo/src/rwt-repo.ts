import { AbstractLogger } from '@rosen-bridge/logger-interface';

export class RWTRepo {
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
    private widPermits?: Array<{ wid: string; rwtCount: bigint }>,
    private logger?: AbstractLogger
  ) {}
}

export class RWTRepoBuilder {
  constructor(
    private repoAddress: string,
    private repoNft: string,
    private rwt: string,
    private networkType: ErgoNetworkType,
    private networkUrl: string,
    private logger?: AbstractLogger
  ) {}
}

export enum ErgoNetworkType {
  Node,
  Explorer,
}
