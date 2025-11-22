import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { RWTRepoBuilder } from './rwtRepoBuilder';

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
    const widPermits = this.r4
      ?.slice(1)
      .map((wid) => Buffer.from(wid).toString('hex'))
      .map((wid) => {
        return { wid, rwtCount: 1n };
      });

    if (!chainId || !widPermits) {
      throw new Error(
        `could not create RWTRepoBuilder because one of [chainId=${chainId}, widPermits=${widPermits}] could not be calculated: ${this.rwtRepoLogDescription} `,
      );
    }

    this.logger.debug(
      `creating new RWTRepoBuilder instance with following arguments: repoAddress=[${
        this.repoAddress
      }], repoNft=[${this.repoNft}], rwt=[${
        this.rwt
      }], rwtCount=[${rwtCount}], rsn=[${rsn}], rsnCount=[${rsnCount}], chainId=[${chainId}], widPermits=[${widPermits}]`,
    );

    return new RWTRepoBuilder(
      this.repoAddress,
      this.repoNft,
      this.rwt,
      rwtCount,
      rsn,
      rsnCount,
      chainId,
      widPermits,
      this.logger,
    );
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
