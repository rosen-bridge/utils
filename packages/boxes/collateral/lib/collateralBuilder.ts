import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

export class CollateralBoxBuilder {
  private height?: number;

  constructor(
    private collateralErgoTree: string,
    private awcNftId: string,
    private rsnAmount: bigint,
    private rsnTokenId: string | undefined,
    private collateralRsn: bigint = 0n,
    private wid: Uint8Array,
    private value: string,
    private logger: AbstractLogger = new DummyLogger(),
  ) {}

  /**
   * Increases the locked RSN amount allocated to this watcher.
   * @param amount RSN amount to lock
   * @returns Updated CollateralBoxBuilder instance
   */
  lockRsn = (amount: bigint): CollateralBoxBuilder => {
    if (amount <= 0n) throw new Error('amount must be positive');

    this.rsnAmount += amount;
    this.logger.debug(
      `locked RSN increased by ${amount}, total=${this.rsnAmount}`,
    );
    return this;
  };

  /**
   * Decreases the locked RSN amount allocated to this watcher.
   * @param amount RSN amount to unlock
   * @returns Updated CollateralBoxBuilder instance
   */
  unlockRsn = (amount: bigint): CollateralBoxBuilder => {
    if (amount <= 0n) throw new Error('amount must be positive');

    if (this.rsnAmount < amount)
      throw new Error(
        `locked RSN [${this.rsnAmount}] < unlock amount [${amount}]`,
      );

    this.rsnAmount -= amount;
    this.logger.debug(
      `locked RSN decreased by ${amount}, total=${this.rsnAmount}`,
    );
    return this;
  };

  /**
   * Creates a CollateralBox from the properties of this CollateralBoxBuilder instance
   *
   * @return {ergoLib.ErgoBoxCandidate}
   */
  build = (): ergoLib.ErgoBoxCandidate => {
    if (this.value === undefined || this.height === undefined) {
      throw new Error(`value and height must be set before build`);
    }

    const boxBuilder = new ergoLib.ErgoBoxCandidateBuilder(
      ergoLib.BoxValue.from_i64(ergoLib.I64.from_str(this.value)),
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
        ergoLib.I64.from_str(this.rsnAmount.toString()),
      ),
    );

    boxBuilder.add_token(
      ergoLib.TokenId.from_str(this.awcNftId),
      ergoLib.TokenAmount.from_i64(ergoLib.I64.from_str('1')),
    );

    if (this.rsnTokenId) {
      boxBuilder.add_token(
        ergoLib.TokenId.from_str(this.rsnTokenId),
        ergoLib.TokenAmount.from_i64(
          ergoLib.I64.from_str(this.collateralRsn.toString()),
        ),
      );
    }

    return boxBuilder.build();
  };

  /** Sets the height of the box
   * @param {number} height
   */
  setHeight = (height: number) => {
    if (height < 1) throw new Error('height must be positive');
    this.height = height;
  };
}
