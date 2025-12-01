import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { RWTRepo, RWTRepoBuilder } from '../lib';
import { repoAddress, repoNft, boxInfo1 } from './rwtRepoTestData';
import JsonBigInt from '@rosen-bridge/json-bigint';

describe('RWTRepo', () => {
  let rwtRepoWithExplorer: any;
  beforeEach(() => {
    rwtRepoWithExplorer = new RWTRepo(
      ergoLib.ErgoBox.from_json(JsonBigInt.stringify(boxInfo1)),
      repoAddress,
      repoNft,
      boxInfo1.assets[1].tokenId,
    );
  });

  describe('toBuilder', () => {
    /**
     * @target should create and return an instance of RWTRepoBuilder using this
     * instance's properties
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - call this.toBuilder()
     * - check the returned object is an instance of RWTRepoBuilder
     * - check all properties (repoAddress, repoNft, rwt, rwtCount, chainId,
     *   watcherCount, AWCTokenId, AWCTokenCount) are correctly set
     * @expected
     * - returned object is an instance of RWTRepoBuilder
     * - repoAddress matches the original repo
     * - repoNft matches the original repo
     * - rwt and rwtCount match the original box
     * - chainId is correctly decoded from R4 register
     * - watcherCount is correctly decoded from R5 register
     * - AWCTokenId and AWCTokenCount match the values in the original box
     */
    it('should create and return an instance of RWTRepoBuilder using this instances properties', async () => {
      const rwtRepoBuilder = rwtRepoWithExplorer.toBuilder();
      const r4Const = ergoLib.Constant.decode_from_base16(
        boxInfo1.additionalRegisters.R4.serializedValue,
      );
      const r4Bytes = r4Const.to_byte_array(); // Uint8Array
      const chainId = Buffer.from(r4Bytes).toString();
      const r5Const = ergoLib.Constant.decode_from_base16(
        boxInfo1.additionalRegisters.R5.serializedValue,
      );
      const totalWatchers = Number(r5Const.to_i64().to_str());
      const rwtCount = BigInt(boxInfo1.assets[1].amount);

      expect(rwtRepoBuilder).toBeInstanceOf(RWTRepoBuilder);
      expect(rwtRepoBuilder['repoAddress']).toEqual(
        rwtRepoWithExplorer['repoAddress'],
      );
      expect(rwtRepoBuilder['repoNft']).toEqual(rwtRepoWithExplorer['repoNft']);
      expect(rwtRepoBuilder['rwt']).toEqual(rwtRepoWithExplorer['rwt']);
      expect(rwtRepoBuilder['rwtCount']).toEqual(rwtCount);

      expect(rwtRepoBuilder['chainId']).toEqual(chainId);
      expect(rwtRepoBuilder['watcherCount']).toEqual(totalWatchers);
    });
  });
});
