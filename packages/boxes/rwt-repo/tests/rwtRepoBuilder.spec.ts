import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { RWTRepoBuilder } from '../lib';
import {
  boxInfo1,
  boxInfo1Properties,
  repoAddress,
  repoNft,
} from './rwtRepoTestData';

describe('RWTRepoBuilder', () => {
  let rwtRepoBuilder: RWTRepoBuilder;
  beforeEach(() => {
    rwtRepoBuilder = new RWTRepoBuilder(
      repoAddress,
      repoNft,
      boxInfo1.assets[3].tokenId,
      BigInt(boxInfo1.assets[3].amount),
      boxInfo1.assets[1].tokenId,
      BigInt(boxInfo1.assets[1].amount),
      boxInfo1.assets[2].tokenId,
      BigInt(boxInfo1.assets[2].amount),

      Buffer.from(boxInfo1Properties.r4).toString(),
      Number(boxInfo1Properties.r5.to_str()),
    );
  });

  describe('addNewUser', () => {
    /**
     * @target should increase watcher count and decrease AWCTokenCount, and set base of amount of
     * permits, rsn for the new user.
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call this.addNewUser(amount)
     * - ensure watcherCount increases by 1
     * - ensure AWCTokenCount decreases by 1n
     * - call this.incrementPermits with amount for complete Initial permit transaction
     * @expected
     * - watcherCount should be oldWatcherCount + 1
     * - AWCTokenCount should be oldAWCTokenCount - 1n
     * - rwtCount should be oldRwtCount - amount
     * - rsnCount should be oldRsnCount + amount
     */
    it(`should increase watcher count and decrease AWCTokenCount, and set base of amount of permits, rsn for the new user`, async () => {
      rwtRepoBuilder.addNewUser(10n);
      expect(rwtRepoBuilder['AWCTokenCount']).toEqual(
        BigInt(boxInfo1.assets[3].amount) - 1n,
      );
      expect(rwtRepoBuilder['rwtCount']).toEqual(
        BigInt(boxInfo1.assets[1].amount) - 10n,
      );
      expect(rwtRepoBuilder['rsnCount']).toEqual(
        BigInt(boxInfo1.assets[2].amount) + 10n,
      );
      expect(rwtRepoBuilder['watcherCount']).toEqual(
        Number(boxInfo1Properties.r5.to_str()) + 1,
      );
    });
  });

  describe('removeUser', () => {
    /**
     * @target should decrease watcher count and increase AWC token count and set
     * base of amount of permits, rsn for the removed user.
     * @dependencies
     * @scenario
     * - call this.removeUser
     * - ensure watcherCount decreases by 1
     * - ensure AWCTokenCount increases by 1n
     * - call this.decrementPermits with amount for complete remove permit transaction
     * @expected
     * - watcherCount should be oldWatcherCount - 1
     * - AWCTokenCount should be oldAWCTokenCount + 1n
     * - rwtCount should be oldRwtCount + amount
     * - rsnCount should be oldRsnCount - amount
     */

    it(`should decrease watcher count and increase AWC token count and set base of amount of permits, rsn for the removed user.`, async () => {
      rwtRepoBuilder.removeUser(10n);
      expect(rwtRepoBuilder['AWCTokenCount']).toEqual(
        BigInt(boxInfo1.assets[3].amount) + 1n,
      );
      expect(rwtRepoBuilder['rwtCount']).toEqual(
        BigInt(boxInfo1.assets[1].amount) + 10n,
      );
      expect(rwtRepoBuilder['rsnCount']).toEqual(
        BigInt(boxInfo1.assets[2].amount) - 10n,
      );
      expect(rwtRepoBuilder['watcherCount']).toEqual(
        Number(boxInfo1Properties.r5.to_str()) - 1,
      );
    });
  });

  describe('decrementPermits', () => {
    /**
     * @target should decrease total RWT permits and increase RSN count
     * @dependencies
     * @scenario
     * - store current rwtCount and rsnCount
     * - call this.decrementPermits with an amount
     * - ensure rwtCount increases by amount
     * - ensure rsnCount decreases by amount
     * @expected
     * - returned value must equal current instance
     * - rwtCount should be oldRwtCount + amount
     * - rsnCount should be oldRsnCount - amount
     */

    it(`should decrease total RWT permits and increase RSN count`, async () => {
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];
      const decrement = 45n;
      const returnValue = rwtRepoBuilder.decrementPermits(decrement);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount + decrement);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount - decrement);
    });
  });

  describe('incrementPermits', () => {
    /**
     * @target should increase RSN count and decrease RWT permits
     * @dependencies
     * @scenario
     * - store current rwtCount and rsnCount
     * - call this.incrementPermits with an amount
     * - ensure rwtCount decreases by amount
     * - ensure rsnCount increases by amount
     * - ensure returned value is the same instance
     * @expected
     * - returned value must equal current instance
     * - rwtCount should be oldRwtCount - amount
     * - rsnCount should be oldRsnCount + amount
     */
    it(`should increase RSN count and decrease RWT permits`, async () => {
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];
      const increment = 56n;
      const returnValue = rwtRepoBuilder.incrementPermits(increment);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount - increment);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount + increment);
    });
  });

  describe('build', () => {
    /**
     * @target should create an rwt repo candidate Ergo box using current instance's
     * properties.
     * @dependencies
     * @scenario
     * - set erg value using this.setValue
     * - set creation height using this.setHeight
     * - call this.build
     * - ensure output box has correct:
     *     - address
     *     - erg value
     *     - creation height
     *     - R4 and R5 registers
     *     - repo NFT, RWT, RSN, AWC token ids and amounts
     * @expected
     * - returned ErgoBoxCandidate should contain:
     *     - repoAddress as contract address
     *     - correct erg value and height
     *     - R4 = chainId
     *     - R5 = watcherCount
     *     - token list = [repoNft(1), rwt(rwtCount), rsn(rsnCount), AWC(AWCTokenCount)]
     */
    it(`should create an rwt repo candidate Ergo box using current instance's
    properties.`, async () => {
      const ergValue = 7000000n;
      const height = 5000;
      rwtRepoBuilder.setValue(ergValue);
      rwtRepoBuilder.setHeight(height);
      const candidateBox = rwtRepoBuilder.build();

      const r4Serialized = boxInfo1.additionalRegisters.R4.serializedValue;

      const r5Serialized = boxInfo1.additionalRegisters.R5.serializedValue;

      expect(
        ergoLib.Address.recreate_from_ergo_tree(
          candidateBox.ergo_tree(),
        ).to_base58(ergoLib.NetworkPrefix.Mainnet),
      ).toEqual(repoAddress);
      expect(candidateBox.value().as_i64().to_str()).toEqual(
        ergValue.toString(),
      );
      expect(candidateBox.creation_height()).toEqual(height);

      expect(candidateBox.register_value(4)?.encode_to_base16()).toEqual(
        r4Serialized,
      );
      expect(candidateBox.register_value(5)?.encode_to_base16()).toEqual(
        r5Serialized,
      );

      expect(candidateBox.tokens().get(0).id().to_str()).toEqual(repoNft);
      expect(candidateBox.tokens().get(0).amount().as_i64().to_str()).toEqual(
        '1',
      );

      expect(candidateBox.tokens().get(1).id().to_str()).toEqual(
        boxInfo1.assets[1].tokenId,
      );
    });
  });
});
