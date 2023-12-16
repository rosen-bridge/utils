import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { describe, expect, it } from 'vitest';
import * as testData from './permitTestData';
import { createPermit } from '../lib';
import { hexToUint8Array } from '../lib/utils';

describe('createPermit', () => {
  /**
   * @target should create permit box from passed arguments
   * @dependencies
   * - None
   * @scenario
   * - call createPermit
   * - check returned box to have the right properties set
   * @expected
   * - returned box should have the right properties set
   */
  it(`should create permit box from passed arguments`, async () => {
    const height = 100;
    const rwtCount = 20n;
    const value = 10_000_000_000n;
    const permitBox = createPermit(
      height,
      testData.permitParams.wid,
      testData.permitParams.rwt,
      rwtCount,
      value,
      testData.permitParams.permitAddress
    );

    expect(permitBox.value().as_i64().to_str()).toEqual(value.toString());

    expect(
      ergoLib.Address.recreate_from_ergo_tree(permitBox.ergo_tree()).to_base58(
        ergoLib.NetworkPrefix.Mainnet
      )
    ).toEqual(testData.permitParams.permitAddress);

    expect(permitBox.creation_height()).toEqual(height);

    expect(permitBox.tokens().get(0).id().to_str()).toEqual(
      testData.permitParams.rwt
    );
    expect(permitBox.tokens().get(0).amount().as_i64().to_str()).toEqual(
      rwtCount.toString()
    );

    expect(permitBox.register_value(4)?.to_coll_coll_byte()[0]).toEqual(
      hexToUint8Array(testData.permitParams.wid)
    );
  });

  /**
   * @target should create throw exception when rwtCount is not a positive
   * amount
   * @dependencies
   * - None
   * @scenario
   * - call createPermit
   * - check createPermit to throw exception
   * @expected
   * - createPermit should throw exception
   */
  it(`should create throw exception when rwtCount is not a positive amount`, async () => {
    const height = 100;
    const rwtCount = 0n;
    const value = 10_000_000_000n;

    expect(() =>
      createPermit(
        height,
        testData.permitParams.wid,
        testData.permitParams.rwt,
        rwtCount,
        value,
        testData.permitParams.permitAddress
      )
    ).toThrow('rwtCount should be greater than zero');
  });
});
