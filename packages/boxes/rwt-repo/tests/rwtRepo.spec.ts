import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { RWTRepo, RWTRepoBuilder } from '../lib';
import { boxInfo1 } from './rwtRepoTestData';
import JsonBigInt from '@rosen-bridge/json-bigint';

describe('RWTRepo', () => {
  let rwtRepo: RWTRepo;
  beforeEach(() => {
    rwtRepo = new RWTRepo(
      ergoLib.ErgoBox.from_json(JsonBigInt.stringify(boxInfo1)),
    );
  });

  describe('toBuilder', () => {
    /**
     * @target should create and return an instance of RWTRepoBuilder by mapping values from the provided ErgoBox
     * @scenario
     * - create an instance of RWTRepo from a given ErgoBox
     * - call this.toBuilder()
     * - check the returned object is an instance of RWTRepoBuilder
     * - check all properties (repoErgoTree, repoNftId, rwt, rwtCount, rsn, rsnCount,
     *   awc, awcCount, chainId, watcherCount) are correctly set from the box
     * @expected
     * - returned object is an instance of RWTRepoBuilder
     * - repoErgoTree matches the ergoTree of the box
     * - repoNftId matches tokens[0].id from the box
     * - rwt matches tokens[1].id from the box
     * - rwtCount matches tokens[1].amount from the box
     * - rsn matches tokens[2].id from the box
     * - rsnCount matches tokens[2].amount from the box
     * - awc matches tokens[3].id from the box
     * - awcCount matches tokens[3].amount from the box
     * - chainId is correctly decoded from R4 register of the box
     * - watcherCount is correctly decoded from R5 register of the box
     */
    it('should create and return an instance of RWTRepoBuilder by mapping values from the provided ErgoBox', async () => {
      const builder = rwtRepo.toBuilder();

      const repoErgoTree = boxInfo1.ergoTree;
      const repoNftId = boxInfo1.assets[0].tokenId;
      const rwtId = boxInfo1.assets[1].tokenId;
      const rwtCount = BigInt(boxInfo1.assets[1].amount);
      const rsnId = boxInfo1.assets[2].tokenId;
      const rsnCount = BigInt(boxInfo1.assets[2].amount);
      const awcId = boxInfo1.assets[3].tokenId;
      const awcCount = BigInt(boxInfo1.assets[3].amount);

      const r4Const = ergoLib.Constant.decode_from_base16(
        boxInfo1.additionalRegisters.R4.serializedValue,
      );
      const chainId = Buffer.from(r4Const.to_byte_array()).toString();

      const r5Const = ergoLib.Constant.decode_from_base16(
        boxInfo1.additionalRegisters.R5.serializedValue,
      );
      const totalWatchers = Number(r5Const.to_i64().to_str());

      expect(builder).toBeInstanceOf(RWTRepoBuilder);

      expect(builder['repoErgoTree']).toEqual(repoErgoTree);
      expect(builder['repoNftId']).toEqual(repoNftId);
      expect(builder['rwt']).toEqual(rwtId);
      expect(builder['rwtCount']).toEqual(rwtCount);

      expect(builder['rsn']).toEqual(rsnId);
      expect(builder['rsnCount']).toEqual(rsnCount);

      expect(builder['awcTokenId']).toEqual(awcId);
      expect(builder['awcTokenCount']).toEqual(awcCount);

      expect(builder['chainId']).toEqual(chainId);
      expect(builder['watcherCount']).toEqual(totalWatchers);
    });
  });
});
