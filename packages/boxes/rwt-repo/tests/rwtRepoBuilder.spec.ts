import { ErgoNetworkType } from '@rosen-bridge/scanner';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import * as ergo from 'ergo-lib-wasm-nodejs';
import { Constant } from 'ergo-lib-wasm-nodejs';
import { beforeEach, describe, expect, it } from 'vitest';
import { RWTRepo, RWTRepoBuilder } from '../lib';
import { mockedErgoExplorerClientFactory } from './mocked/ErgoExplorerClient.mock';
import { rwtRepoInfoSample } from './rwtRepoTestData';

describe('RWTRepoBuilder', () => {
  let rwtRepoBuilder: RWTRepoBuilder;
  beforeEach(() => {
    const boxInfo = rwtRepoInfoSample.boxInfo;

    const r4 = Constant.decode_from_base16(
      boxInfo.additionalRegisters.R4.serializedValue
    ).to_coll_coll_byte();

    const r5 = (
      Constant.decode_from_base16(
        boxInfo.additionalRegisters.R5.serializedValue
      ).to_i64_str_array() as string[]
    ).map(BigInt);

    const r6 = (
      Constant.decode_from_base16(
        boxInfo.additionalRegisters.R6.serializedValue
      ).to_i64_str_array() as string[]
    ).map(BigInt);

    const widPermits = r4
      .slice(1)
      ?.map((wid) => Buffer.from(wid).toString('hex'))
      .map((wid, i) => {
        return { wid, rwtCount: r5[i + 1] };
      });

    rwtRepoBuilder = new RWTRepoBuilder(
      rwtRepoInfoSample.Address,
      rwtRepoInfoSample.nft,
      boxInfo.assets[1].tokenId,
      BigInt(boxInfo.assets[1].amount),
      boxInfo.assets[2].tokenId,
      BigInt(boxInfo.assets[2].amount),
      Buffer.from(r4[0]).toString(),
      r6[0],
      Number(r6[1]),
      Number(r6[2]),
      Number(r6[3]),
      r6[4],
      r6[5],
      widPermits
    );
  });

  describe('addNewUser', () => {
    /**
     * @target RWTRepo.addNewUser should add the passed wid, rwtCount arguments
     * to this.widPermits, and do the following updates:
     * this.rwtCount -= rwtCount
     * this.rsnCount += rsnCount
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.addNewUser
     * - check RWTRepoBuilder.widPermits to not have contained the new wid
     * before RWTRepoBuilder.addNewUser
     * - check RWTRepoBuilder.widPermits to contain the new wid after
     * RWTRepoBuilder.addNewUser as the last item
     * - check RWTRepoBuilder.rwtCount to have been updated correctly
     * - check RWTRepoBuilder.rsnCount to have been updated correctly
     * @expected
     * - RWTRepoBuilder.widPermits should not have contained the new wid before
     * RWTRepoBuilder.addNewUser
     * - RWTRepoBuilder.widPermits should contain the new wid after
     * RWTRepoBuilder.addNewUser as the last item
     * - RWTRepoBuilder.rwtCount should have been updated correctly
     * - RWTRepoBuilder.rsnCount should have been updated correctly
     */
    it(`should add the passed wid, rwtCount arguments to
    this.widPermits, and do the following updates:
    this.rwtCount -= rwtCount
    this.rsnCount += rsnCount`, async () => {
      const wid = '34f2a6bb';
      const rwtCount = 2n;
      const oldWidPermits = [...rwtRepoBuilder['widPermits']];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      rwtRepoBuilder.addNewUser(wid, rwtCount);

      expect(oldWidPermits.map((permit) => permit.wid).includes(wid)).toEqual(
        false
      );
      expect(
        rwtRepoBuilder['widPermits'][rwtRepoBuilder['widPermits'].length - 1]
          .wid
      ).toEqual(wid);
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount - rwtCount);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount + rwtCount);
    });

    /**
     * @target should throw exception when passed rwtCount as argument is
     * greater than available rwtCount
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.addNewUser with a rwtCount greater than
     * this.rwtCount
     * - check RWTRepoBuilder.addNewUser to throw an exception
     * @expected
     * - RWTRepoBuilder.addNewUser should throw an exception
     */
    it(`should throw exception when passed rwtCount as argument is greater than
    available rwtCount`, async () => {
      const wid = '34f2a6bb';

      expect(() =>
        rwtRepoBuilder.addNewUser(wid, rwtRepoBuilder['rwtCount'] + 1n)
      ).toThrowError();
    });

    /**
     * @target should throw exception when adding an existing wid
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.addNewUser with an existing wid
     * - check RWTRepoBuilder.addNewUser to throw an exception
     * @expected
     * - RWTRepoBuilder.addNewUser should throw an exception
     */
    it(`should throw exception when adding an existing wid`, async () => {
      expect(() =>
        rwtRepoBuilder.addNewUser(rwtRepoBuilder['widPermits'][0].wid, 1n)
      ).toThrowError();
    });
  });

  describe('removeUser', () => {
    /**
     * @target RWTRepo.removeUser should remove the item with the passed wid
     * from this.widPermits, and do the following updates:
     * this.rwtCount += rwtCount
     * this.rsnCount -= rsnCount
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.removeUser
     * - check RWTRepoBuilder.widPermits to have contained the passed wid before
     * calling RWTRepoBuilder.removeUser
     * - check RWTRepoBuilder.widPermits not to contain the passed wid after
     * RWTRepoBuilder.removeUser
     * - check RWTRepoBuilder.rwtCount to have been updated correctly
     * - check RWTRepoBuilder.rsnCount to have been updated correctly
     * - check RWTRepoBuilder.lastModifiedWid to have been updated with the
     * passed wid
     * @expected
     * - RWTRepoBuilder.widPermits should have contained the passed wid before
     * calling RWTRepoBuilder.removeUser
     * - RWTRepoBuilder.widPermits should not contain the passed wid after
     * calling RWTRepoBuilder.removeUser
     * - RWTRepoBuilder.rwtCount should have been updated correctly
     * - RWTRepoBuilder.rsnCount should have been updated correctly
     * - RWTRepoBuilder.lastModifiedWid should have been updated with the passed
     * wid
     */
    it(`RWTRepo.removeUser should remove the item with the passed wid from
    this.widPermits, and do the following updates:
    this.rwtCount += rwtCount
    this.rsnCount -= rsnCount`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;

      await rwtRepo.updateBox(false);

      const rwtRepoBuilder = rwtRepo.toBuilder();

      const widIndex = 2;
      const { wid, rwtCount } = rwtRepoBuilder['widPermits'][widIndex];
      const oldWidPermits = [...rwtRepoBuilder['widPermits']];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      rwtRepoBuilder.removeUser(wid);

      expect(oldWidPermits.map((permit) => permit.wid).includes(wid)).toEqual(
        true
      );
      expect(
        rwtRepoBuilder['widPermits'].map((permit) => permit.wid).includes(wid)
      ).toEqual(false);
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount + rwtCount);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount - rwtCount);
      expect(rwtRepoBuilder['lastModifiedWidIndex']).toEqual(widIndex);
    });

    /**
     * @target should throw exception when removing a non-existent wid
     * @dependencies
     * - None
     * @scenario
     * - create an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.removeUser with a non-existent wid
     * - check RWTRepoBuilder.removeUser to throw an exception
     * @expected
     * - RWTRepoBuilder.removeUser should throw an exception
     */
    it(`should throw exception when removing a non-existent wid`, async () => {
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
     * @target RWTRepoBuilder.setCommitmentRwtCount should set value of
     * RWTRepoBuilder.commitmentRwtCount and return its RWTRepoBuilder's
     * instance (this)
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setCommitmentRwtCount
     * - check return value of RWTRepoBuilder.setCommitmentRwtCount to be the
     * current instance of RWTRepoBuilder
     * - check RWTRepoBuilder.commitmentRwtCount to have been set to the correct
     * value
     * @expected
     * - return value of RWTRepoBuilder.setCommitmentRwtCount should be the
     * current instance of RWTRepoBuilder
     * - RWTRepoBuilder.commitmentRwtCount should have been set to the correct
     * value
     */
    it(`RWTRepoBuilder.setCommitmentRwtCount should set value of
    RWTRepoBuilder.commitmentRwtCount and return its RWTRepoBuilder's instance
    (this)`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;
      await rwtRepo.updateBox(false);
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const newCommitmentRwtCount = 123n;
      const returnValue = rwtRepoBuilder.setCommitmentRwtCount(
        newCommitmentRwtCount
      );

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['commitmentRwtCount']).toEqual(
        newCommitmentRwtCount
      );
    });
  });

  describe('setWatcherQuorumPercentage', () => {
    /**
     * @target RWTRepoBuilder.setWatcherQuorumPercentage should set value of
     * RWTRepoBuilder.quorumPercentage and return its RWTRepoBuilder's instance
     * (this)
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setWatcherQuorumPercentage
     * - check return value of RWTRepoBuilder.setWatcherQuorumPercentage to be
     * the current instance of RWTRepoBuilder
     * - check RWTRepoBuilder.quorumPercentage to have been set to the correct
     * value
     * @expected
     * - return value of RWTRepoBuilder.setWatcherQuorumPercentage should be the
     * current instance of RWTRepoBuilder
     * - RWTRepoBuilder.quorumPercentage should have been set to the correct
     * value
     */
    it(`RWTRepoBuilder.setWatcherQuorumPercentage should set value of
    RWTRepoBuilder.quorumPercentage and return its RWTRepoBuilder's instance
    (this)`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;
      await rwtRepo.updateBox(false);
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const newQuorumPercentage = 83;
      const returnValue =
        rwtRepoBuilder.setWatcherQuorumPercentage(newQuorumPercentage);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['quorumPercentage']).toEqual(newQuorumPercentage);
    });
  });

  describe('setApprovalOffset', () => {
    /**
     * @target RWTRepoBuilder.setApprovalOffset should set value of
     * RWTRepoBuilder.approvalOffset and return its RWTRepoBuilder's instance
     * (this)
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setApprovalOffset
     * - check return value of RWTRepoBuilder.setApprovalOffset to be the
     * current instance of RWTRepoBuilder
     * - check RWTRepoBuilder.approvalOffset to have been set to the correct
     * value
     * @expected
     * - return value of RWTRepoBuilder.setApprovalOffset should be the current
     * instance of RWTRepoBuilder
     * - RWTRepoBuilder.approvalOffset should have been set to the correct value
     */
    it(`RWTRepoBuilder.setApprovalOffset should set value of
    RWTRepoBuilder.approvalOffset and return its RWTRepoBuilder's instance
    (this)`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;
      await rwtRepo.updateBox(false);
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const newApprovalOffset = 5;
      const returnValue = rwtRepoBuilder.setApprovalOffset(newApprovalOffset);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['approvalOffset']).toEqual(newApprovalOffset);
    });
  });

  describe('setMaximumApproval', () => {
    /**
     * @target RWTRepoBuilder.setMaximumApproval should set value of
     * RWTRepoBuilder.maximumApproval and return its RWTRepoBuilder's instance
     * (this)
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setMaximumApproval
     * - check return value of RWTRepoBuilder.setMaximumApproval to be the
     * current instance of RWTRepoBuilder
     * - check RWTRepoBuilder.maximumApproval to have been set to the correct
     * value
     * @expected
     * - return value of RWTRepoBuilder.setMaximumApproval should be the current
     * instance of RWTRepoBuilder
     * - RWTRepoBuilder.maximumApproval should have been set to the correct
     * value
     */
    it(`RWTRepoBuilder.setMaximumApproval should set value of
    RWTRepoBuilder.maximumApproval and return its RWTRepoBuilder's instance
    (this)`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;
      await rwtRepo.updateBox(false);
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const newMaximumApproval = 14;
      const returnValue = rwtRepoBuilder.setMaximumApproval(newMaximumApproval);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['maximumApproval']).toEqual(newMaximumApproval);
    });
  });

  describe('setErgCollateral', () => {
    /**
     * @target RWTRepoBuilder.setErgCollateral should set value of
     * RWTRepoBuilder.ergCollateral and return its RWTRepoBuilder's instance
     * (this)
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setErgCollateral
     * - check return value of RWTRepoBuilder.setErgCollateral to be the current
     * instance of RWTRepoBuilder
     * - check RWTRepoBuilder.ergCollateral to have been set to the correct
     * value
     * @expected
     * - return value of RWTRepoBuilder.setErgCollateral should be the current
     * instance of RWTRepoBuilder
     * - RWTRepoBuilder.ergCollateral should have been set to the correct value
     */
    it(`RWTRepoBuilder.setErgCollateral should set value of
    RWTRepoBuilder.ergCollateral and return its RWTRepoBuilder's instance (this)`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;
      await rwtRepo.updateBox(false);
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const newErgCollateral = 23n;
      const returnValue = rwtRepoBuilder.setErgCollateral(newErgCollateral);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['ergCollateral']).toEqual(newErgCollateral);
    });
  });

  describe('setRsnCollateral', () => {
    /**
     * @target RWTRepoBuilder.setRsnCollateral should set value of
     * RWTRepoBuilder.rsnCollateral and return its RWTRepoBuilder's instance
     * (this)
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setRsnCollateral
     * - check return value of RWTRepoBuilder.setRsnCollateral to be the current
     * instance of RWTRepoBuilder
     * - check RWTRepoBuilder.rsnCollateral to have been set to the correct
     * value
     * @expected
     * - return value of RWTRepoBuilder.setRsnCollateral should be the current
     * instance of RWTRepoBuilder
     * - RWTRepoBuilder.rsnCollateral should have been set to the correct value
     */
    it(`RWTRepoBuilder.setRsnCollateral should set value of
    RWTRepoBuilder.rsnCollateral and return its RWTRepoBuilder's instance (this)`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;
      await rwtRepo.updateBox(false);
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const newRsnCollateral = 34n;
      const returnValue = rwtRepoBuilder.setRsnCollateral(newRsnCollateral);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['rsnCollateral']).toEqual(newRsnCollateral);
    });
  });

  describe('decrementPermits', () => {
    /**
     * @target RWTRepoBuilder.decrementPermits should decrement rwtCount for a
     * specific wid in RWTRepoBuilder.widPermits by the specified amount. Also
     * should store the passed wid in RWTRepoBuilder.lastModifiedWid, return the
     * current RWTRepoBuilder (this), and do the following updates:
     * RWTRepoBuilder.rwtCount += rwtCount
     * RWTRepoBuilder.rsnCount -= rwtCount
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.decrementPermits
     * - check return value of RWTRepoBuilder.decrementPermits to be the current
     * instance of RWTRepoBuilder
     * - check RWTRepoBuilder.widPermits to have been updated correctly
     * - check RWTRepoBuilder.rwtCount to have been updated correctly
     * - check RWTRepoBuilder.rsnCount to have been updated correctly
     * - check RWTRepoBuilder.lastModifiedWid to have been updated with the
     * passed wid
     * @expected
     * - return value of RWTRepoBuilder.decrementPermits should be the current
     * instance of RWTRepoBuilder
     * - RWTRepoBuilder.widPermits should have been decremented accordingly
     * - RWTRepoBuilder.rwtCount should have been decremented accordingly
     * - RWTRepoBuilder.rsnCount should have been incremented accordingly
     * - RWTRepoBuilder.lastModifiedWid should have been updated with the passed
     * wid
     */
    it(`RWTRepoBuilder.decrementPermits should decrements rwtCount for a
    specific wid in RWTRepoBuilder.widPermits by the specified amount. Also
    should store the passed wid in RWTRepoBuilder.lastModifiedWid, return the
    current RWTRepoBuilder (this), and do the following updates:
    RWTRepoBuilder.rwtCount += rwtCount
    RWTRepoBuilder.rsnCount -= rwtCount`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;
      await rwtRepo.updateBox(false);
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const widIndex = 2;
      const { wid, rwtCount: widOldRwtCount } =
        rwtRepoBuilder['widPermits'][widIndex];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      const decrement = 45n;
      const returnValue = rwtRepoBuilder.decrementPermits(wid, decrement);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['widPermits'][widIndex].rwtCount).toEqual(
        widOldRwtCount - decrement
      );
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount + decrement);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount - decrement);
      expect(rwtRepoBuilder['lastModifiedWidIndex']).toEqual(widIndex);
    });
  });

  describe('incrementPermits', () => {
    /**
     * @target RWTRepoBuilder.incrementPermits should increment rwtCount for a
     * specific wid in RWTRepoBuilder.widPermits by the specified amount. Also
     * should store the passed wid in RWTRepoBuilder.lastModifiedWid, return the
     * current RWTRepoBuilder (this), and do the following updates:
     * RWTRepoBuilder.rwtCount -= rwtCount
     * RWTRepoBuilder.rsnCount += rwtCount
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.incrementPermits
     * - check return value of RWTRepoBuilder.incrementPermits to be the current
     * instance of RWTRepoBuilder
     * - check RWTRepoBuilder.widPermits to have been updated correctly
     * - check RWTRepoBuilder.rwtCount to have been updated correctly
     * - check RWTRepoBuilder.rsnCount to have been updated correctly
     * - check RWTRepoBuilder.lastModifiedWid to have been updated with the
     * passed wid
     * @expected
     * - return value of RWTRepoBuilder.incrementPermits should be the current
     * instance of RWTRepoBuilder
     * - RWTRepoBuilder.widPermits should have been incremented accordingly
     * - RWTRepoBuilder.rwtCount should have been incremented accordingly
     * - RWTRepoBuilder.rsnCount should have been decremented accordingly
     * - RWTRepoBuilder.lastModifiedWid should have been updated with the passed
     * wid
     */
    it(`RWTRepoBuilder.incrementPermits should increment rwtCount for a
    specific wid in RWTRepoBuilder.widPermits by the specified amount. Also
    should store the passed wid in RWTRepoBuilder.lastModifiedWid, return the
    current RWTRepoBuilder (this), and do the following updates:
    RWTRepoBuilder.rwtCount -= rwtCount
    RWTRepoBuilder.rsnCount += rwtCount`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '',
        ErgoNetworkType.Explorer,
        ''
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;
      await rwtRepo.updateBox(false);
      const rwtRepoBuilder = rwtRepo.toBuilder();

      const widIndex = 3;
      const { wid, rwtCount: widOldRwtCount } =
        rwtRepoBuilder['widPermits'][widIndex];
      const oldRwtCount = rwtRepoBuilder['rwtCount'];
      const oldRsnCount = rwtRepoBuilder['rsnCount'];

      const increment = 56n;
      const returnValue = rwtRepoBuilder.incrementPermits(wid, increment);

      expect(returnValue).toBe(rwtRepoBuilder);
      expect(rwtRepoBuilder['widPermits'][widIndex].rwtCount).toEqual(
        widOldRwtCount + increment
      );
      expect(rwtRepoBuilder['rwtCount']).toEqual(oldRwtCount - increment);
      expect(rwtRepoBuilder['rsnCount']).toEqual(oldRsnCount + increment);
      expect(rwtRepoBuilder['lastModifiedWidIndex']).toEqual(widIndex);
    });
  });

  describe('build', () => {
    /**
     * @target RWTRepoBuilder.build should create a rwt repo candidate Ergo box
     * based on data stored in its properties.
     * @dependencies
     * - MockedErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo with specific repoAddress and repoNft
     * - mock RWTRepo.explorerClient to return a client that returns predefined
     * box info for the repoAddress and repoNft
     * - call RWTRepo.updateBox to update RWTRepo.box
     * - call RWTRepo.toBuilder to return an instance of RWTRepoBuilder
     * - call RWTRepoBuilder.setValue to set box Erg value
     * - call RWTRepoBuilder.setHeight to set box creation height
     * - call RWTRepoBuilder.build to get an ErgoBoxCandidate instance
     * - check returned ErgoBoxCandidate to have correct address, value and
     * height set
     * - check returned ErgoBoxCandidate to have correct valued for R4, R5, R6
     * and R7 registers set
     * - check returned ErgoBoxCandidate to have correct tokenId and values set
     * @expected
     * - returned ErgoBoxCandidate should have correct address, value and height
     * set
     * - returned ErgoBoxCandidate should have correct valued for R4, R5, R6 and
     * R7 registers set
     * - check returned ErgoBoxCandidate to have correct tokenId and values set
     */
    it(`RWTRepoBuilder.build should create a rwt repo candidate Ergo box based
    on data stored in its properties.`, async () => {
      const rwtRepo = new RWTRepo(
        rwtRepoInfoSample.Address,
        rwtRepoInfoSample.nft,
        '3825b2b4acaaaba626440113153246c65ddb2e9df406c4a56418b5842c9f839a',
        ErgoNetworkType.Explorer,
        ''
      );

      rwtRepo['explorerClient'] = mockedErgoExplorerClientFactory(
        ''
      ) as unknown as ReturnType<typeof ergoExplorerClientFactory>;
      await rwtRepo.updateBox(false);

      const rwtRepoBuilder = rwtRepo.toBuilder();
      const ergValue = 7000000n;
      const height = 5000;
      const lastModifiedWidIndex = 2;
      rwtRepoBuilder['lastModifiedWidIndex'] = lastModifiedWidIndex;
      rwtRepoBuilder.setValue(ergValue);
      rwtRepoBuilder.setHeight(height);
      const candidateBox = rwtRepoBuilder.build();

      const r4Serialized =
        rwtRepoInfoSample.boxInfo.additionalRegisters.R4.serializedValue;

      const r5Serialized =
        rwtRepoInfoSample.boxInfo.additionalRegisters.R5.serializedValue;

      const r6Serialized =
        rwtRepoInfoSample.boxInfo.additionalRegisters.R6.serializedValue;

      expect(
        ergo.Address.recreate_from_ergo_tree(
          candidateBox.ergo_tree()
        ).to_base58(ergo.NetworkPrefix.Mainnet)
      ).toEqual(rwtRepoInfoSample.Address);
      expect(candidateBox.value().as_i64().to_str()).toEqual(
        ergValue.toString()
      );
      expect(candidateBox.creation_height()).toEqual(height);

      expect(candidateBox.register_value(4)?.encode_to_base16()).toEqual(
        r4Serialized
      );
      expect(candidateBox.register_value(5)?.encode_to_base16()).toEqual(
        r5Serialized
      );
      expect(candidateBox.register_value(6)?.encode_to_base16()).toEqual(
        r6Serialized
      );
      expect(candidateBox.register_value(7)?.to_js()).toEqual(
        lastModifiedWidIndex
      );

      expect(candidateBox.tokens().get(0).id().to_str()).toEqual(
        rwtRepoInfoSample.nft
      );
      expect(candidateBox.tokens().get(0).amount().as_i64().to_str()).toEqual(
        '1'
      );

      expect(candidateBox.tokens().get(1).id().to_str()).toEqual(
        rwtRepoInfoSample.boxInfo.assets[1].tokenId
      );
      expect(candidateBox.tokens().get(1).amount().as_i64().to_str()).toEqual(
        rwtRepoInfoSample.boxInfo.assets[1].amount.toString()
      );

      expect(candidateBox.tokens().get(2).id().to_str()).toEqual(
        rwtRepoInfoSample.boxInfo.assets[2].tokenId
      );
      expect(candidateBox.tokens().get(2).amount().as_i64().to_str()).toEqual(
        rwtRepoInfoSample.boxInfo.assets[2].amount.toString()
      );
    });
  });
});
