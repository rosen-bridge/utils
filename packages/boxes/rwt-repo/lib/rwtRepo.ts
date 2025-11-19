import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { RWTRepoBuilder } from './rwtRepoBuilder';
import { min } from './utils';

export class RWTRepo {
  constructor(
    protected box: ergoLib.ErgoBox,
    private repoAddress: string,
    private repoNft: string,
    private rwt: string,
    private logger: AbstractLogger = new DummyLogger(),
  ) {
    this.logger.debug(
      `RWTRepo instance created with repo-address=[${this.repoAddress}] and repo-nft=[${this.repoNft}]`,
    );
  }

  /**
   * creates an instance of RWTRepoBuilder using current instance's properties
   *
   * @return {RWTRepoBuilder}
   */
  toBuilder = () => {
    if (!this.box) {
      throw new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`,
      );
    }

    const rwtCount = BigInt(
      this.box.tokens().get(1).amount().as_i64().to_str(),
    );

    const rsn = this.box.tokens().get(2).id().to_str();
    const rsnCount = BigInt(
      this.box.tokens().get(2).amount().as_i64().to_str(),
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
        return { wid, rwtCount: 1n };
      });

    if (
      !chainId ||
      !quorumPercentage ||
      !approvalOffset ||
      !maximumApproval ||
      !widPermits
    ) {
      throw new Error(
        `could not create RWTRepoBuilder because one of [chainId=${chainId}, quorumPercentage=${quorumPercentage}, approvalOffset=${approvalOffset}, maximumApproval=${maximumApproval}, widPermits=${widPermits}] could not be calculated: ${this.rwtRepoLogDescription} `,
      );
    }

    this.logger.debug(
      `creating new RWTRepoBuilder instance with following arguments: repoAddress=[${
        this.repoAddress
      }], repoNft=[${this.repoNft}], rwt=[${
        this.rwt
      }], rwtCount=[${rwtCount}], rsn=[${rsn}], rsnCount=[${rsnCount}], chainId=[${chainId}], quorumPercentage=[${quorumPercentage}], approvalOffset=[${approvalOffset}], maximumApproval=[${maximumApproval}], ergCollateral=[${this.getErgCollateral()}], rsnCollateral=[${this.getRsnCollateral()}], widPermits=[${widPermits}]`,
    );

    return new RWTRepoBuilder(
      this.repoAddress,
      this.repoNft,
      this.rwt,
      rwtCount,
      rsn,
      rsnCount,
      chainId,
      quorumPercentage,
      approvalOffset,
      maximumApproval,
      this.getErgCollateral(),
      this.getRsnCollateral(),
      widPermits,
      this.logger,
    );
  };

  /**
   * returns value of ergCollateral for this.box. If this.box is undefined an
   * exception is thrown
   *
   * @return {bigint}
   */
  getErgCollateral = () => {
    if (!this.box) {
      throw new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`,
      );
    }

    const ergCollateralRegister = (
      this.box.register_value(6)?.to_i64_str_array() as string[] | undefined
    )?.at(4);

    if (!ergCollateralRegister) {
      throw new Error(
        `could not extract ergCollateral from R6[4]: ${this.rwtRepoLogDescription} `,
      );
    }

    this.logger.debug(
      `ergCollateral in R6[4] register value: ${ergCollateralRegister}`,
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
    if (!this.box) {
      throw new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`,
      );
    }

    const rsnCollateralRegister = (
      this.box.register_value(6)?.to_i64_str_array() as string[] | undefined
    )?.at(5);

    if (!rsnCollateralRegister) {
      throw new Error(
        `could not extract rsnCollateral from R6[5]: ${this.rwtRepoLogDescription} `,
      );
    }

    this.logger.debug(
      `rsnCollateral in R6[5] register value: ${rsnCollateralRegister}`,
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
    if (!this.box) {
      throw new Error(
        `no boxes stored for this RwtRepo instance: ${this.rwtRepoLogDescription}}`,
      );
    }

    const r6_1 = this.r6At(1);
    const r6_2 = this.r6At(2);
    const r6_3 = this.r6At(3);
    const r4 = this.r4;

    if (!r6_1 || !r6_2 || !r6_3 || !r4) {
      throw new Error(
        `could not calculate RequiredCommitmentCount, because R6[1] or R6[2] or R6[3] or R4 is undefined: ${this.rwtRepoLogDescription} `,
      );
    }

    const requiredCommitmentCount = min(
      (r6_1 * BigInt(r4.length - 1)) / 100n + r6_2,
      r6_3,
    );

    return requiredCommitmentCount;
  };

  /**
   * returns value of R6[index] register of this.box
   *
   * @param {number} index
   * @return {bigint | undefined}
   */
  private r6At = (index: number) => {
    const val = (
      this.box?.register_value(6)?.to_i64_str_array() as string[] | undefined
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
    return this.box?.register_value(4)?.to_coll_coll_byte();
  }

  /**
   * returns value of R5 register for this.box
   *
   * @readonly
   * @type {(bigint[] | undefined)}
   */
  get r5(): bigint[] | undefined {
    return (
      this.box?.register_value(5)?.to_i64_str_array() as string[] | undefined
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
    if (this.box) {
      return `boxId=[${this.box?.box_id().to_str()}]`;
    } else {
      return `no boxes stored yet!`;
    }
  }
}
