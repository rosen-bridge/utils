import { describe, expect, it } from 'vitest';

import { Dependency, ServiceStatus } from '../lib';
import { TestAbstractService } from './testAbstractService';

/**
 * a service whose start, stop and assemble each throw on the first
 * attempt and succeed on the second one
 */
class FlakyService extends TestAbstractService {
  static serviceName = 'FlakyService';

  protected dependencies: Dependency[] = [];

  startAttempts = 0;
  stopAttempts = 0;
  assembleAttempts = 0;

  assemble = (): Promise<boolean> => {
    this.assembleAttempts += 1;
    if (this.assembleAttempts === 1)
      return Promise.reject(new Error('assemble failed'));
    this.setStatus(ServiceStatus.dormant);
    return Promise.resolve(true);
  };

  start = (): Promise<boolean> => {
    this.startAttempts += 1;
    if (this.startAttempts === 1)
      return Promise.reject(new Error('start failed'));
    this.setStatus(ServiceStatus.running);
    return Promise.resolve(true);
  };

  stop = (): Promise<boolean> => {
    this.stopAttempts += 1;
    if (this.stopAttempts === 1)
      return Promise.reject(new Error('stop failed'));
    this.setStatus(ServiceStatus.dormant);
    return Promise.resolve(true);
  };
}

describe('AbstractService', () => {
  describe('startService', () => {
    /**
     * @target startService should run start again after a failed attempt
     * @scenario
     * - call startService on a dormant service whose start throws
     * - call startService again
     * @expected
     * - first call returns false
     * - second call runs start again and returns true
     * - service ends up running
     */
    it('should run start again after a failed attempt', async () => {
      const service = new FlakyService(ServiceStatus.dormant);

      await expect(service.startService()).resolves.toBe(false);
      await expect(service.startService()).resolves.toBe(true);

      expect(service.startAttempts).toBe(2);
      expect(service.getStatus()).toBe(ServiceStatus.running);
    });
  });

  describe('stopService', () => {
    /**
     * @target stopService should run stop again after a failed attempt
     * @scenario
     * - call stopService on a running service whose stop throws
     * - call stopService again
     * @expected
     * - first call returns false
     * - second call runs stop again and returns true
     * - service ends up dormant
     */
    it('should run stop again after a failed attempt', async () => {
      const service = new FlakyService(ServiceStatus.running);

      await expect(service.stopService()).resolves.toBe(false);
      await expect(service.stopService()).resolves.toBe(true);

      expect(service.stopAttempts).toBe(2);
      expect(service.getStatus()).toBe(ServiceStatus.dormant);
    });
  });

  describe('assembleService', () => {
    /**
     * @target assembleService should run assemble again after a failed attempt
     * @scenario
     * - call assembleService on a raw service whose assemble throws
     * - call assembleService again
     * @expected
     * - first call returns false
     * - second call runs assemble again and returns true
     * - service ends up dormant
     */
    it('should run assemble again after a failed attempt', async () => {
      const service = new FlakyService();

      await expect(service.assembleService()).resolves.toBe(false);
      await expect(service.assembleService()).resolves.toBe(true);

      expect(service.assembleAttempts).toBe(2);
      expect(service.getStatus()).toBe(ServiceStatus.dormant);
    });
  });
});
