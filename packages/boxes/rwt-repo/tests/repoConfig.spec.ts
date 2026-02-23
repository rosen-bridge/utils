import * as ergoLib from 'ergo-lib-wasm-nodejs';

import JsonBigInt from '@rosen-bridge/json-bigint';

import { RepoConfig } from '../lib';
import {
  mockCollateralErg,
  mockCollateralRsn,
  mockCommitmentRwtCount,
  mockMaxApproval,
  mockMinApproval,
  mockPercentage,
  repoConfigBox,
} from './repoConfigTestData';

describe('RepoConfig', () => {
  let repoConfig: RepoConfig;
  beforeEach(() => {
    repoConfig = new RepoConfig(
      ergoLib.ErgoBox.from_json(JsonBigInt.stringify(repoConfigBox)),
    );
  });

  describe('getCommitmentRwtCount', () => {
    /**
     * @target should return commitmentRwtCount from register 4 values of repoConfig Box
     * @scenario
     * - call getCommitmentRwtCount
     * @expected
     * - returned commitmentRwtCount and to be equal mockCommitmentRwtCount
     */
    it('should return commitmentRwtCount from register 4 values of repoConfig Box', async () => {
      const commitmentRwtCount = repoConfig.getCommitmentRwtCount();
      expect(commitmentRwtCount).toEqual(mockCommitmentRwtCount);
    });
  });

  describe('getMaxApproval', () => {
    /**
     * @target should return maxApproval from register 4 values of repoConfig Box
     * @scenario
     * - call getMaxApproval
     * @expected
     * - returned maxApproval and to be equal mockMaxApproval
     */
    it('should return maxApproval from register 4 values of repoConfig Box', async () => {
      const maxApproval = repoConfig.getMaxApproval();
      expect(maxApproval).toEqual(mockMaxApproval);
    });
  });

  describe('getMinApproval', () => {
    /**
     * @target should return minApproval from register 4 values of repoConfig Box
     * @scenario
     * - call getMinApproval
     * @expected
     * - returned minApproval and to be equal mockMinApproval
     */
    it('should return minApproval from register 4 values of repoConfig Box', async () => {
      const minApproval = repoConfig.getMinApproval();
      expect(minApproval).toEqual(mockMinApproval);
    });
  });

  describe('getPercentage', () => {
    /**
     * @target should return percentage from register 4 values of repoConfig Box
     * @scenario
     * - call getPercentage
     * @expected
     * - returned percentage and to be equal mockPercentage
     */
    it('should return percentage from register 4 values of repoConfig Box', async () => {
      const percentage = repoConfig.getPercentage();
      expect(percentage).toEqual(mockPercentage);
    });
  });

  describe('getCollateral', () => {
    /** should return required erg value and rsn amount for build Collateral box
     * @scenario
     * - call getCollateralErg
     * - call getCollateralRsm
     * @expected
     * - returned requiredErg and to be equal mockCollateralErg
     * - returned requiredRsn and to be equal mockCollateralRsn
     */
    it('should return required erg value and rsn amount for build Collateral box', async () => {
      const requiredErg = repoConfig.getCollateralErg();
      const requiredRsn = repoConfig.getCollateralRsn();
      expect(requiredErg).toEqual(mockCollateralErg);
      expect(requiredRsn).toEqual(mockCollateralRsn);
    });
  });

  describe('getMinCommitment', () => {
    beforeEach(() => {
      vi.spyOn(repoConfig, 'getMinApproval').mockReturnValue(10n);
      vi.spyOn(repoConfig, 'getMaxApproval').mockReturnValue(30n);
      vi.spyOn(repoConfig, 'getPercentage').mockReturnValue(50);
    });

    /**
     * @target should returns calculated value when formula is less than maxApproval
     * @scenario
     * - call getMinCommitment
     * @expected
     * - returned 10 + floor(50% of 20) = 20 -> 20 + 1
     */
    it('should returns calculated value when formula is less than maxApproval', () => {
      const result = repoConfig.getMinCommitment(20);
      expect(result).toBe(21n);
    });

    /**
     * @target should returns at maxApproval when formula exceeds maxApproval
     * @scenario
     * - call getMinCommitment
     * @expected
     * - returned 10 + 50 = 60 > 30 -> 30 + 1
     */
    it('should returns at maxApproval when formula exceeds maxApproval', () => {
      const result = repoConfig.getMinCommitment(100);
      expect(result).toBe(31n);
    });

    /**
     * @target should works correctly when watcherCount is zero
     * @scenario
     * - call getMinCommitment
     * @expected
     * - returned 10 + 0 = 10 -> 10 + 1
     */
    it('should works correctly when watcherCount is zero', () => {
      const result = repoConfig.getMinCommitment(0);
      expect(result).toBe(11n);
    });

    /**
     * @target should returns maxApproval + 1 when formula equals maxApproval
     * @scenario
     * - call getMinCommitment
     * @expected
     * - returned 10 + 20 = 30 -> 30 + 1
     */
    it('should returns maxApproval + 1 when formula equals maxApproval', () => {
      const result = repoConfig.getMinCommitment(40);
      expect(result).toBe(31n);
    });
  });
});
