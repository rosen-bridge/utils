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
      boxInfo1.assets[1].tokenId,
      BigInt(boxInfo1.assets[1].amount),
      boxInfo1.assets[2].tokenId,
      BigInt(boxInfo1.assets[2].amount),
      Buffer.from(boxInfo1Properties.r4[0]).toString(),
      boxInfo1Properties.widPermits,
    );
  });

  describe('addNewUser', () => {
    /**
     * @target should add a new user using passed watcher id and rwt token count
     * @dependencies
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call this.addNewUser
     * - check this.widPermits not to contain the new watcher id before calling
     *   this.addNewUser
     * - check this.widPermits to contain the new watcher id as the last item
     * - check this.rwtCount to have been updated correctly
     * - check this.rsnCount to have been updated correctly
     * @expected
     * - this.widPermits should not contain the new watcher id before calling
     *   this.addNewUser
     * - this.widPermits should contain the new watcher id as the last item
     * - this.rwtCount should have been updated correctly
     * - this.rsnCount should have been updated correctly
     */
    it(`should add a new user using passed watcher id and rwt token count`, async () => {
      const wid = '34f2a6bb';
      const rwtCount = 2n;
      const oldWidPermits = [...rwtRepoBuilder['widPermits']];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      rwtRepoBuilder.addNewUser(wid, rwtCount);

      expect(oldWidPermits.map((permit) => permit.wid).includes(wid)).toEqual(
        false,
      );
      expect(
        rwtRepoBuilder['widPermits'][rwtRepoBuilder['widPermits'].length - 1]
          .wid,
      ).toEqual(wid);
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount - rwtCount);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount + rwtCount);
    });

    /**
     * @target should throw exception when passed rwtCount is greater than
     * available rwtCount
     * @dependencies
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call this.addNewUser with a value greater than this.rwtCount
     * - check this.addNewUser to throw an exception
     * @expected
     * - this.addNewUser should throw an exception
     */
    it(`should throw exception when passed rwtCount is greater than available
    rwtCount`, async () => {
      const wid = '34f2a6bb';

      expect(() =>
        rwtRepoBuilder.addNewUser(wid, rwtRepoBuilder['rwtCount'] + 1n),
      ).toThrowError();
    });

    /**
     * @target should throw exception when adding an existing watcher id
     * @dependencies
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call this.addNewUser with an existing watcher id
     * - check this.addNewUser to throw an exception
     * @expected
     * - this.addNewUser should throw an exception
     */
    it(`should throw exception when adding an existing watcher id`, async () => {
      expect(() =>
        rwtRepoBuilder.addNewUser(rwtRepoBuilder['widPermits'][0].wid, 1n),
      ).toThrowError();
    });
  });

  describe('removeUser', () => {
    /**
     * @target should remove the user corresponding to passed watcher id
     * @dependencies
     * @scenario
     * - call this.removeUser
     * - check this.widPermits to have contained the passed wid before calling
     *   this.removeUser
     * - check this.widPermits not to contain the passed wid after calling
     *   this.removeUser
     * - check this.rwtCount to have been updated correctly
     * - check this.rsnCount to have been updated correctly
     * - check this.lastModifiedWid to have been updated with the passed wid
     * @expected
     * - this.widPermits have contained the passed wid before calling
     *   this.removeUser
     * - this.widPermits should not contain the passed wid after calling
     *   this.removeUser
     * - this.rwtCount should have been updated correctly
     * - this.rsnCount should have been updated correctly
     * - this.lastModifiedWid should have been updated with the passed wid
     */
    it(`should remove the user corresponding to passed watcher id`, async () => {
      const widIndex = 2;
      const { wid, rwtCount } = rwtRepoBuilder['widPermits'][widIndex];
      const oldWidPermits = [...rwtRepoBuilder['widPermits']];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      rwtRepoBuilder.removeUser(wid);

      expect(oldWidPermits.map((permit) => permit.wid).includes(wid)).toEqual(
        true,
      );
      expect(
        rwtRepoBuilder['widPermits'].map((permit) => permit.wid).includes(wid),
      ).toEqual(false);
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount + rwtCount);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount - rwtCount);
      expect(rwtRepoBuilder['lastModifiedWidIndex']).toEqual(widIndex);
    });

    /**
     * @target should throw exception when removing a non-existent watcher id
     * @dependencies
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call this.removeUser with a non-existent wid
     * - check this.removeUser to throw an exception
     * - check this.widPermits to be unchanged
     * - check this.rwtCount to be unchanged
     * - check this.rsnCount to be unchanged
     * @expected
     * - this.removeUser should throw an exception
     * - this.widPermits should be unchanged
     * - this.rwtCount should be unchanged
     * - this.rsnCount should be unchanged
     */
    it(`should throw exception when removing a non-existent watcher id`, async () => {
      const oldWidPermits = [...rwtRepoBuilder['widPermits']];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      expect(() => rwtRepoBuilder.removeUser('abcd')).toThrowError();
      expect(rwtRepoBuilder['widPermits']).toEqual(oldWidPermits);
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount);
    });
  });

  describe('setCommitmentRwtCount', () => {
    /**
     * @target should set value of this.commitmentRwtCount and return this
     * @dependencies
     * @scenario
     * - call this.setCommitmentRwtCount
     * - check return value of this.setCommitmentRwtCount to be the current
     *   instance of RWTRepoBuilder
     * - check this.commitmentRwtCount to have been set correctly
     * @expected
     * - return value of RWTRepoBuilder.setCommitmentRwtCount should be the
     *   current instance of RWTRepoBuilder
     * - this.commitmentRwtCount should have been set correctly
     */
    it(`should set value of this.commitmentRwtCount and return this`, async () => {
      const newCommitmentRwtCount = 123n;
      const returnValue = rwtRepoBuilder.setCommitmentRwtCount(
        newCommitmentRwtCount,
      );

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['commitmentRwtCount']).toEqual(
        newCommitmentRwtCount,
      );
    });
  });

  describe('decrementPermits', () => {
    /**
     * @target should decrement rwtCount by passed amount for a specific watcher
     * id and return this
     * @dependencies
     * @scenario
     * - call this.decrementPermits
     * - check return value of this.decrementPermits to be the current instance
     *   of RWTRepoBuilder
     * - check this.widPermits to have been updated correctly
     * - check this.rwtCount to have been updated correctly
     * - check this.rsnCount to have been updated correctly
     * - check this.lastModifiedWid to have been updated with the passed wid
     * @expected
     * - return value of this.decrementPermits should be the current instance of
     *   RWTRepoBuilder
     * - this.widPermits should have been decremented correctly
     * - this.rwtCount should have been decremented correctly
     * - this.rsnCount should have been incremented correctly
     * - this.lastModifiedWid should have been updated with the passed wid
     */
    it(`should decrement rwtCount by passed amount for a specific watcher id and
    return this`, async () => {
      const widIndex = 2;
      const { wid, rwtCount: widOldRwtCount } =
        rwtRepoBuilder['widPermits'][widIndex];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      const decrement = 45n;
      const returnValue = rwtRepoBuilder.decrementPermits(wid, decrement);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['widPermits'][widIndex].rwtCount).toEqual(
        widOldRwtCount - decrement,
      );
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount + decrement);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount - decrement);
      expect(rwtRepoBuilder['lastModifiedWidIndex']).toEqual(widIndex);
    });
  });

  describe('incrementPermits', () => {
    /**
     * @target should increment rwtCount by passed amount for a specific watcher
     * id and return this
     * @dependencies
     * @scenario
     * - call this.incrementPermits
     * - check return value of this.incrementPermits to be the current instance
     *   of RWTRepoBuilder
     * - check this.widPermits to have been updated correctly
     * - check this.rwtCount to have been updated correctly
     * - check this.rsnCount to have been updated correctly
     * - check this.lastModifiedWid to have been updated with the passed wid
     * @expected
     * - return value of this.incrementPermits should be the current instance of
     *   RWTRepoBuilder
     * - this.widPermits should have been incremented correctly
     * - this.rwtCount should have been incremented correctly
     * - this.rsnCount should have been decremented correctly
     * - this.lastModifiedWid should have been updated with the passed wid
     */
    it(`should increment rwtCount by passed amount for a specific watcher id and
    return this`, async () => {
      const widIndex = 3;
      const { wid, rwtCount: widOldRwtCount } =
        rwtRepoBuilder['widPermits'][widIndex];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      const increment = 56n;
      const returnValue = rwtRepoBuilder.incrementPermits(wid, increment);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['widPermits'][widIndex].rwtCount).toEqual(
        widOldRwtCount + increment,
      );
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount - increment);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount + increment);
      expect(rwtRepoBuilder['lastModifiedWidIndex']).toEqual(widIndex);
    });
  });

  describe('build', () => {
    /**
     * @target should create an rwt repo candidate Ergo box using current
     * instance's properties.
     * @dependencies
     * @scenario
     * - call this.setValue to set box Erg value
     * - call this.setHeight to set box creation height
     * - call this.build to get an ErgoBoxCandidate instance
     * - check returned box to have correct address, value and height set
     * - check returned box to have correct values for R4, R5, R6 and R7
     *   registers set
     * - check returned box to have correct tokenId and values set
     * @expected
     * - returned box should have correct address, value and height set
     * - returned box should have correct values for R4, R5, R6 and R7 registers
     *   set
     * - check returned box to have correct tokenId and values set
     */
    it(`should create an rwt repo candidate Ergo box using current instance's
    properties.`, async () => {
      const ergValue = 7000000n;
      const height = 5000;
      const lastModifiedWidIndex = 2;
      rwtRepoBuilder['lastModifiedWidIndex'] = lastModifiedWidIndex;
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
      expect(candidateBox.tokens().get(1).amount().as_i64().to_str()).toEqual(
        boxInfo1.assets[1].amount.toString(),
      );

      expect(candidateBox.tokens().get(2).id().to_str()).toEqual(
        boxInfo1.assets[2].tokenId,
      );
      expect(candidateBox.tokens().get(2).amount().as_i64().to_str()).toEqual(
        boxInfo1.assets[2].amount.toString(),
      );
    });
  });
});
