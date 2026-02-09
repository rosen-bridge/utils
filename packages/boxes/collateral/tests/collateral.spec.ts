import JsonBigInt from '@rosen-bridge/json-bigint';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

import { CollateralBox, CollateralBoxBuilder } from '../lib';
import { collateralBoxInfo } from './collateralBoxTestData';

describe('CollateralBox', () => {
  let collateralBox: CollateralBox;

  beforeEach(() => {
    collateralBox = new CollateralBox(
      ergoLib.ErgoBox.from_json(JsonBigInt.stringify(collateralBoxInfo)),
    );
  });

  describe('toBuilder', () => {
    /**
     * @target should create and return an instance of CollateralBoxBuilder by mapping values from the provided ErgoBox
     * @scenario
     * - create an instance of CollateralBox from a given ErgoBox
     * - call this.toBuilder()
     * - check the returned object is an instance of CollateralBoxBuilder
     * - check all properties (ergoTree, awcNftId, lockedRsn, rsnId, rsnAmount, wid)
     *   are correctly set from the box
     * @expected
     * - returned object is an instance of CollateralBoxBuilder
     * - ergoTree matches the ergoTree of the box
     * - awcNftId matches tokens[0].id from the box
     * - rsnId matches tokens[1].id from the box
     * - lockedRsnAmount matches tokens[1].amount from the box
     * - rsnAmount is correctly decoded from R5 register
     * - wid is correctly decoded from R4 register
     */
    it('should create and return an instance of CollateralBoxBuilder by mapping values from the provided ErgoBox', async () => {
      const builder = collateralBox.toBuilder();

      const ergoTree = collateralBoxInfo.ergoTree;
      const awcNftId = collateralBoxInfo.assets[0].tokenId;
      const rsnId = collateralBoxInfo.assets[1].tokenId;
      const rsnAmount = BigInt(collateralBoxInfo.assets[1].amount);

      const r4Const = ergoLib.Constant.decode_from_base16(
        collateralBoxInfo.additionalRegisters.R4.serializedValue,
      );
      const wid = r4Const.to_byte_array();

      const r5Const = ergoLib.Constant.decode_from_base16(
        collateralBoxInfo.additionalRegisters.R5.serializedValue,
      );
      const lockedRsn = BigInt(r5Const.to_i64().to_str());

      expect(builder).toBeInstanceOf(CollateralBoxBuilder);

      expect(builder['collateralErgoTree']).toEqual(ergoTree);
      expect(builder['awcNftId']).toEqual(awcNftId);
      expect(builder['rsnTokenId']).toEqual(rsnId);
      expect(builder['collateralRsn']).toEqual(rsnAmount);
      expect(builder['rsnAmount']).toEqual(lockedRsn);
      expect(Buffer.from(builder['wid']).toString('hex')).toEqual(
        Buffer.from(wid).toString('hex'),
      );
    });
  });
});
