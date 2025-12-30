import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

export class CollateralBoxBuilder {
  private value?: bigint;
  private height?: number;

  constructor(
    private collateralErgoTree: string,
    private awcNftId: string,
    private lockedRsn: bigint,
    private rsnTokenId: string,
    private rsnTokenAmount: bigint = 0n,

    private wid: Uint8Array,

    private logger: AbstractLogger = new DummyLogger(),
  ) {}

  /**
   * Borrow permits (increase locked RSN)
   * Rwt > 0
   */
  lockRsn = (amount: bigint): CollateralBoxBuilder => {
    if (amount <= 0n) throw new Error('amount must be positive');

    this.rsnTokenAmount += amount;
    this.logger.debug(
      `locked RSN increased by ${amount}, total=${this.rsnTokenAmount}`,
    );
    return this;
  };

  /**
   * Return permits (decrease locked RSN)
   * Rwt < 0
   */
  unlockRsn = (amount: bigint): CollateralBoxBuilder => {
    if (amount <= 0n) throw new Error('amount must be positive');

    if (this.rsnTokenAmount < amount)
      throw new Error(
        `locked RSN [${this.rsnTokenAmount}] < unlock amount [${amount}]`,
      );

    this.rsnTokenAmount -= amount;
    this.logger.debug(
      `locked RSN decreased by ${amount}, total=${this.rsnTokenAmount}`,
    );
    return this;
  };

  /**
   * Build collateral box
   */
  build = (): ergoLib.ErgoBoxCandidate => {
    if (this.value === undefined || this.height === undefined) {
      throw new Error(`value and height must be set before build`);
    }

    const boxBuilder = new ergoLib.ErgoBoxCandidateBuilder(
      ergoLib.BoxValue.from_i64(ergoLib.I64.from_str(this.value.toString())),
      ergoLib.Contract.new(
        ergoLib.ErgoTree.from_base16_bytes(this.collateralErgoTree),
      ),
      this.height,
    );

    boxBuilder.set_register_value(
      4,
      ergoLib.Constant.from_byte_array(this.wid),
    );

    boxBuilder.set_register_value(
      5,
      ergoLib.Constant.from_i64(
        ergoLib.I64.from_str(this.lockedRsn.toString()),
      ),
    );

    boxBuilder.add_token(
      ergoLib.TokenId.from_str(this.awcNftId),
      ergoLib.TokenAmount.from_i64(ergoLib.I64.from_str('1')),
    );

    if (this.rsnTokenId && this.rsnTokenAmount > 0n) {
      boxBuilder.add_token(
        ergoLib.TokenId.from_str(this.rsnTokenId),
        ergoLib.TokenAmount.from_i64(
          ergoLib.I64.from_str(this.rsnTokenAmount.toString()),
        ),
      );
    }

    return boxBuilder.build();
  };

  setValue = (value: bigint) => {
    if (value < 0n) throw new Error('value cannot be negative');
    this.value = value;
  };

  setHeight = (height: number) => {
    if (height < 1) throw new Error('height must be positive');
    this.height = height;
  };
}
