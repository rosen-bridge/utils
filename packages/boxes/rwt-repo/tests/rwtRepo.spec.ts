import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { Constant } from 'ergo-lib-wasm-nodejs';
import { beforeEach, describe, expect, it } from 'vitest';
import { RWTRepo, RWTRepoBuilder } from '../lib';
import { repoAddress, repoNft, boxInfo1, boxInfo2 } from './rwtRepoTestData';
import JsonBigInt from '@rosen-bridge/json-bigint';

describe('RWTRepo', () => {
  let rwtRepoWithExplorer: any;
  beforeEach(() => {
    rwtRepoWithExplorer = new RWTRepo(
      ergoLib.ErgoBox.from_json(JsonBigInt.stringify(boxInfo1)),
      repoAddress,
      repoNft,
      '',
    );
  });

  describe('getErgCollateral', () => {
    /**
     * @target should return a bigint with the value stored in R6[4] of this.box
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - check this.getErgCollateral() to return the correct value
     * @expected
     * - this.getErgCollateral() should return the correct value
     */
    it(`should return a bigint with the value stored in R6[4] of this.box`, async () => {
      expect(rwtRepoWithExplorer.getErgCollateral()).toEqual(
        JsonBigInt.parse(boxInfo1.additionalRegisters.R6.renderedValue)[4],
      );
    });
  });

  describe('getRsnCollateral', () => {
    /**
     * @target should return a bigint with the value stored in R6[5] of this.box
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - check this.getRsnCollateral() to return the correct value
     * @expected
     * - this.getRsnCollateral() should return the correct value
     */
    it(`should return a bigint with the value stored in R6[5] of this.box`, async () => {
      expect(rwtRepoWithExplorer.getRsnCollateral()).toEqual(
        JsonBigInt.parse(boxInfo1.additionalRegisters.R6.renderedValue)[5],
      );
    });
  });

  describe('getRequiredCommitmentCount', () => {
    /**
     * @target should return (R6[1] * (len(R4) - 1) / 100 + R6[2]), when it is
     * less than R6[3]
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - check this.getRequiredCommitmentCount() to return the correct value
     * @expected
     * - this.getRequiredCommitmentCount() should return the correct value
     */
    it(`should return (R6[1] * (len(R4) - 1) / 100 + R6[2]), when it is less
    than R6[3]`, async () => {
      const boxInfo = boxInfo2;
      const rwtRepo = new RWTRepo(
        ergoLib.ErgoBox.from_json(JsonBigInt.stringify(boxInfo2)),
        repoAddress,
        repoNft,
        '',
      );

      const r6 = Constant.decode_from_base16(boxInfo.additionalRegisters.R6)
        .to_i64_str_array()
        .map(BigInt);
      const r4 = Constant.decode_from_base16(
        boxInfo.additionalRegisters.R4,
      ).to_coll_coll_byte();

      expect(rwtRepo.getRequiredCommitmentCount()).toEqual(
        (r6[1] * BigInt(r4.length - 1)) / 100n + r6[2],
      );
    });

    /**
     * @target RWTRepo.getRequiredCommitmentCount should return R6[3], when
     * R6[3] is less than (R6[1] * (len(R4) - 1) / 100 + R6[2])
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - check this.getRequiredCommitmentCount() to return the correct value
     * @expected
     * - this.getRequiredCommitmentCount() should return the correct value
     */
    it(`RWTRepo.getRequiredCommitmentCount should return R6[3], when R6[3] is
    less than (R6[1] * (len(R4) - 1) / 100 + R6[2])`, async () => {
      const boxInfo = boxInfo1;
      const r6 = Constant.decode_from_base16(
        boxInfo.additionalRegisters.R6.serializedValue,
      )
        .to_i64_str_array()
        .map(BigInt);

      expect(rwtRepoWithExplorer.getRequiredCommitmentCount()).toEqual(r6[3]);
    });
  });

  describe('getCommitmentRwtCount', () => {
    /**
     * @target should return a bigint with the value stored in R6[0] of this.box
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock RWTRepo.explorerClient
     * - check this.getCommitmentRwtCount() to return the correct value
     * @expected
     * - this.getCommitmentRwtCount() should return the correct value
     */
    it(`should return a bigint with the value stored in R6[0] of this.box`, async () => {
      const r6 = Constant.decode_from_base16(
        boxInfo1.additionalRegisters.R6.serializedValue,
      )
        .to_i64_str_array()
        .map(BigInt);

      expect(rwtRepoWithExplorer.getCommitmentRwtCount()).toEqual(r6.at(0));
    });
  });

  describe('getWidIndex', () => {
    /**
     * @target should return index of watcher id in R4 register of this.box
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - check this.getWidIndex() to return the correct index
     * @expected
     * - RWTRepo.getWidIndex() should return the correct index
     */
    it(`should return index of watcher id in R4 register of this.box`, async () => {
      const r4_2 = Constant.decode_from_base16(
        boxInfo1.additionalRegisters.R4.serializedValue,
      ).to_coll_coll_byte()[2];

      expect(
        rwtRepoWithExplorer.getWidIndex(Buffer.from(r4_2).toString('hex')),
      ).toEqual(2);
    });

    /**
     * @target should return -1 if watcher id is not present in R4 register of
     * this.box
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - check this.getWidIndex() to return -1 for a non-existent watcher id
     * @expected
     * - this.getWidIndex() should return -1 for a non-existent watcher id
     */
    it(`should return -1 if watcher id is not present in R4 register of this.box`, async () => {
      expect(rwtRepoWithExplorer.getWidIndex('ff4a5b')).toEqual(-1);
    });
  });

  describe('getPermitCount', () => {
    /**
     * @target should return permitCount for a watcher id
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - check this.getPermitCount() to return correct value for permitCount
     * @expected
     * - RWTRepo.getPermitCount() should return correct value for permitCount
     */
    it(`should return permitCount for a watcher id`, async () => {
      const r4_2 = Constant.decode_from_base16(
        boxInfo1.additionalRegisters.R4.serializedValue,
      ).to_coll_coll_byte()[2];

      const r5 = (
        Constant.decode_from_base16(
          boxInfo1.additionalRegisters.R5.serializedValue,
        ).to_i64_str_array() as string[]
      ).map(BigInt);

      expect(
        rwtRepoWithExplorer.getPermitCount(Buffer.from(r4_2).toString('hex')),
      ).toEqual(r5[2]);
    });

    /**
     * @target should return 0 for nonexistent watcher id
     * @dependencies
     * - ErgoExplorerClientFactory
     * @scenario
     * - create an instance of RWTRepo
     * - mock this.explorerClient
     * - check this.getPermitCount() to return 0 for a missing watcher id
     * @expected
     * - this.getPermitCount() should return 0 for a missing watcher id
     */
    it(`should return 0 for nonexistent watcher id`, async () => {
      expect(rwtRepoWithExplorer.getPermitCount('ff4a5b')).toEqual(0n);
    });
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
     * - check this.toBuilder() to return an instance of RWTRepoBuilder
     * - check this.toBuilder() to have created the RWTRepoBuilder instance with
     *   correct properties
     * @expected
     * - check this.toBuilder() should return an instance of RWTRepoBuilder
     * - check RWTRepo.toBuilder() should have created the RWTRepoBuilder
     *   instance with correct properties
     */
    it(`should create and return an instance of RWTRepoBuilder using this
    instance's properties`, async () => {
      const rwtRepoBuilder = rwtRepoWithExplorer.toBuilder();

      const r4 = Constant.decode_from_base16(
        boxInfo1.additionalRegisters.R4.serializedValue,
      ).to_coll_coll_byte();

      const r5 = (
        Constant.decode_from_base16(
          boxInfo1.additionalRegisters.R5.serializedValue,
        ).to_i64_str_array() as string[]
      ).map(BigInt);

      const r6 = (
        Constant.decode_from_base16(
          boxInfo1.additionalRegisters.R6.serializedValue,
        ).to_i64_str_array() as string[]
      ).map(BigInt);

      const widPermits = r4
        .slice(1)
        ?.map((wid) => Buffer.from(wid).toString('hex'))
        .map((wid, i) => {
          return { wid, rwtCount: r5[i + 1] };
        });

      const rwtCount = BigInt(boxInfo1.assets[1].amount);
      const rsnToken = boxInfo1.assets[2];

      expect(rwtRepoBuilder).toBeInstanceOf(RWTRepoBuilder);
      expect(rwtRepoBuilder['repoAddress']).toEqual(
        rwtRepoWithExplorer['repoAddress'],
      );
      expect(rwtRepoBuilder['repoNft']).toEqual(rwtRepoWithExplorer['repoNft']);
      expect(rwtRepoBuilder['rwt']).toEqual(rwtRepoWithExplorer['rwt']);
      expect(rwtRepoBuilder['rwtCount']).toEqual(rwtCount);
      expect(rwtRepoBuilder['rsn']).toEqual(rsnToken.tokenId);
      expect(rwtRepoBuilder['rsnCount']).toEqual(BigInt(rsnToken.amount));
      expect(rwtRepoBuilder['chainId']).toEqual(Buffer.from(r4[0]).toString());
      expect(rwtRepoBuilder['commitmentRwtCount']).toEqual(
        rwtRepoWithExplorer.getCommitmentRwtCount(),
      );
      expect(rwtRepoBuilder['quorumPercentage']).toEqual(Number(r6.at(1)));
      expect(rwtRepoBuilder['approvalOffset']).toEqual(Number(r6.at(2)));
      expect(rwtRepoBuilder['maximumApproval']).toEqual(Number(r6.at(3)));
      expect(rwtRepoBuilder['ergCollateral']).toEqual(
        rwtRepoWithExplorer.getErgCollateral(),
      );
      expect(rwtRepoBuilder['rsnCollateral']).toEqual(
        rwtRepoWithExplorer.getRsnCollateral(),
      );
      expect(rwtRepoBuilder['widPermits']).toEqual(widPermits);
    });
  });
});
