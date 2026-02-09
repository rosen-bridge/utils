import * as ergoLib from 'ergo-lib-wasm-nodejs';

import { RWTRepoBuilder } from '../lib';
import { boxInfo1, boxInfo1Properties, repoNft } from './rwtRepoTestData';

describe('RWTRepoBuilder', () => {
  let rwtRepoBuilder: RWTRepoBuilder;
  beforeEach(() => {
    rwtRepoBuilder = new RWTRepoBuilder(
      boxInfo1.ergoTree,
      repoNft,
      boxInfo1.assets[3].tokenId,
      BigInt(boxInfo1.assets[3].amount),
      boxInfo1.assets[1].tokenId,
      BigInt(boxInfo1.assets[1].amount),
      boxInfo1.assets[2].tokenId,
      BigInt(boxInfo1.assets[2].amount),
      BigInt(boxInfo1.value.toString()),
      Buffer.from(boxInfo1Properties.r4).toString(),
      Number(boxInfo1Properties.r5.to_str()),
    );
  });

  describe('addNewUser', () => {
    /**
     * @target should add a new watcher and update AWC, RWT, and RSN counts accordingly
     * @scenario
     * - call this.addNewUser with a permit amount
     * @expected
     * - watcherCount should increase by 1
     * - AWCTokenCount should decrease by 1
     * - rwtCount should decrease by the given amount
     * - rsnCount should increase by the given amount
     */
    it('should add a new watcher and update AWC, RWT, and RSN counts accordingly', () => {
      const rwtBefore = rwtRepoBuilder['rwtCount'];
      const rsnBefore = rwtRepoBuilder['rsnCount'];
      const awcBefore = rwtRepoBuilder['awcTokenCount'];
      const watchersBefore = rwtRepoBuilder['watcherCount'];

      const amount = 10n;
      rwtRepoBuilder.addNewUser(amount);

      expect(rwtRepoBuilder['rwtCount']).toEqual(rwtBefore - amount);
      expect(rwtRepoBuilder['rsnCount']).toEqual(rsnBefore + amount);
      expect(rwtRepoBuilder['awcTokenCount']).toEqual(awcBefore - 1n);
      expect(rwtRepoBuilder['watcherCount']).toEqual(watchersBefore + 1);
    });
  });

  describe('removeUser', () => {
    /**
     * @target should remove a watcher and update AWC, RWT, and RSN counts accordingly
     * @scenario
     * - call this.removeUser with a permit amount
     * @expected
     * - watcherCount should decrease by 1
     * - AWCTokenCount should increase by 1
     * - rwtCount should increase by the given amount
     * - rsnCount should decrease by the given amount
     */
    it('should remove a watcher and update AWC, RWT, and RSN counts accordingly', () => {
      const rwtBefore = rwtRepoBuilder['rwtCount'];
      const rsnBefore = rwtRepoBuilder['rsnCount'];
      const awcBefore = rwtRepoBuilder['awcTokenCount'];
      const watchersBefore = rwtRepoBuilder['watcherCount'];

      const amount = 10n;
      rwtRepoBuilder.removeUser(amount);

      expect(rwtRepoBuilder['rwtCount']).toEqual(rwtBefore + amount);
      expect(rwtRepoBuilder['rsnCount']).toEqual(rsnBefore - amount);
      expect(rwtRepoBuilder['awcTokenCount']).toEqual(awcBefore + 1n);
      expect(rwtRepoBuilder['watcherCount']).toEqual(watchersBefore - 1);
    });
  });

  describe('returnPermits', () => {
    /**
     * @target should increase RWT and decrease RSN by the given amount
     * @scenario
     * - store current rwtCount and rsnCount
     * - call this.returnPermits with a specific amount
     * @expected
     * - returned value must equal current instance
     * - rwtCount should increase by the given amount
     * - rsnCount should decrease by the given amount
     */
    it('should increase RWT and decrease RSN by the given amount', () => {
      const rwtBefore = rwtRepoBuilder['rwtCount'];
      const rsnBefore = rwtRepoBuilder['rsnCount'];

      const amount = 45n;
      const returnValue = rwtRepoBuilder.returnPermits(amount);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['rwtCount']).toEqual(rwtBefore + amount);
      expect(rwtRepoBuilder['rsnCount']).toEqual(rsnBefore - amount);
    });
  });

  describe('getPermits', () => {
    /**
     * @target should decrease RWT and increase RSN by the given amount
     * @scenario
     * - store current rwtCount and rsnCount
     * - call getPermits with a specific amount
     * @expected
     * - returned value must equal current instance
     * - rwtCount should decrease by the specified amount
     * - rsnCount should increase by the specified amount
     */

    it('should decrease RWT and increase RSN by the given amount', () => {
      const rwtBefore = rwtRepoBuilder['rwtCount'];
      const rsnBefore = rwtRepoBuilder['rsnCount'];

      const amount = 56n;
      const returnValue = rwtRepoBuilder.getPermits(amount);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['rwtCount']).toEqual(rwtBefore - amount);
      expect(rwtRepoBuilder['rsnCount']).toEqual(rsnBefore + amount);
    });
  });

  describe('build', () => {
    /**
     * @target should create an rwt repo candidate Ergo box using the current instance's properties
     * @scenario
     * - set value using `setValue`
     * - set creation height using `setHeight`
     * - call `build` to create the ErgoBoxCandidate
     * @expected
     * - contract address should equal `repoErgoTree`
     * - value should equal set value
     * - creation height should equal set height
     * - R4 register should equal `chainId`
     * - R5 register should equal `watcherCount`
     * - tokens list should include:
     *     - repoNft with amount 1
     *     - RWT with amount `rwtCount`
     *     - RSN with amount `rsnCount`
     *     - AWC with amount `awcTokenCount`
     */
    it(`should create an rwt repo candidate Ergo box using the current instance's properties`, () => {
      const height = 5000;

      rwtRepoBuilder.setHeight(height);
      const r4Expected = ergoLib.Constant.from_byte_array(
        Uint8Array.from(Buffer.from(rwtRepoBuilder['chainId'])),
      );
      const r5Expected = ergoLib.Constant.from_i64(
        ergoLib.I64.from_str(rwtRepoBuilder['watcherCount'].toString()),
      );

      const candidateBox = rwtRepoBuilder.build();
      expect(candidateBox.ergo_tree().to_base16_bytes()).toEqual(
        rwtRepoBuilder['repoErgoTree'],
      );
      expect(candidateBox.value().as_i64().to_str()).toEqual(
        rwtRepoBuilder['value'].toString(),
      );
      expect(candidateBox.creation_height()).toEqual(height);

      expect(candidateBox.register_value(4)?.encode_to_base16()).toEqual(
        r4Expected.encode_to_base16(),
      );

      expect(candidateBox.register_value(5)?.encode_to_base16()).toEqual(
        r5Expected.encode_to_base16(),
      );

      const tokens = candidateBox.tokens();
      expect(tokens.get(0).id().to_str()).toEqual(rwtRepoBuilder['repoNftId']);
      expect(tokens.get(0).amount().as_i64().to_str()).toEqual('1');

      expect(tokens.get(1).id().to_str()).toEqual(rwtRepoBuilder['rwt']);
      expect(tokens.get(1).amount().as_i64().to_str()).toEqual(
        rwtRepoBuilder['rwtCount'].toString(),
      );

      expect(tokens.get(2).id().to_str()).toEqual(rwtRepoBuilder['rsn']);
      expect(tokens.get(2).amount().as_i64().to_str()).toEqual(
        rwtRepoBuilder['rsnCount'].toString(),
      );

      expect(tokens.get(3).id().to_str()).toEqual(rwtRepoBuilder['awcTokenId']);
      expect(tokens.get(3).amount().as_i64().to_str()).toEqual(
        rwtRepoBuilder['awcTokenCount'].toString(),
      );
    });
  });
});
