import { DummyLogger } from '@rosen-bridge/logger-interface';
import { HealthStatusLevel } from '../../lib';
import TestLogLevelHealthCheck from './TestLogLevelHealthCheck';

describe('LogLevelHealthCheck', () => {
  let logger: DummyLogger;
  let logLevelHealthCheck: TestLogLevelHealthCheck;

  beforeEach(() => {
    logger = new DummyLogger();
    logLevelHealthCheck = new TestLogLevelHealthCheck(
      logger,
      HealthStatusLevel.UNSTABLE,
      3,
      1000,
      'error'
    );
  });

  describe('constructor', () => {
    /**
     * @target LogLevelHealthCheck.constructor should wrap all logger functions
     * @dependency
     * @scenario
     * - create new instance of logger and logLevelHealthCheck
     * @expected
     * - all functions must be wrapped
     */
    it('should wrap all logger functions', () => {
      const originalDebug = logger.debug;
      const originalInfo = logger.info;
      const originalWarn = logger.warn;
      const originalError = logger.error;

      logLevelHealthCheck = new TestLogLevelHealthCheck(
        logger,
        HealthStatusLevel.UNSTABLE,
        3,
        1000,
        'error'
      );

      expect(logger.debug).not.toBe(originalDebug);
      expect(logger.info).not.toBe(originalInfo);
      expect(logger.warn).not.toBe(originalWarn);
      expect(logger.error).not.toBe(originalError);
    });

    /**
     * @target LogLevelHealthCheck should add time for expected logging level
     * @dependency
     * @scenario
     * - log error three times
     * @expected
     * - times length must be 3
     * - last log message must be equal to latest error log
     */
    it('should add time for expected logging level', () => {
      logger.error('Test error 1');
      logger.error('Test error 2');
      logger.error('Test error 3');

      expect(logLevelHealthCheck.getTimes().length).toEqual(3);
      expect(logLevelHealthCheck.getLastMessage()).toEqual('Test error 3');
    });

    /**
     * @target LogLevelHealthCheck should not add time for other logging level
     * @dependency
     * @scenario
     * - log info, debug and warning
     * @expected
     * - times length must be 0
     * - last log message must be empty
     */
    it('should not add time for other logging level', () => {
      logger.debug('Test error 1');
      logger.info('Test error 2');
      logger.warn('Test error 3');

      expect(logLevelHealthCheck.getTimes().length).toEqual(0);
      expect(logLevelHealthCheck.getLastMessage()).toBeUndefined();
    });
  });

  describe('update', () => {
    /**
     * @target LogLevelHealthCheck.update should update lastUpdatedTime
     * @dependency
     * @scenario
     * - call update function
     * - get initial lastUpdateTime
     * - call update function
     * - get new lastUpdateTime
     * @expected
     * - two lastUpdateTime must not be equal
     */
    it('should update lastUpdatedTime', () => {
      logLevelHealthCheck.update();
      const initialLastUpdatedTime = logLevelHealthCheck.getLastUpdatedTime();
      logLevelHealthCheck.update();
      const updatedLastUpdatedTime = logLevelHealthCheck.getLastUpdatedTime();

      expect(updatedLastUpdatedTime).not.toBe(initialLastUpdatedTime);
    });

    /**
     * @target LogLevelHealthCheck.update should remove old times
     * @dependency
     * @scenario
     * - mock Date.now
     * - insert three time before Date.now() - 1000
     * - insert two time after Date.now() - 1000
     * - call update function
     * - clean Date.now mock
     * @expected
     * - times list length must be 2
     * - times must contain bow times after Date.now() - 1000
     */
    it('should remove old times', () => {
      const currentTime = 1621411200000; // May 19, 2021 12:00:00 AM UTC
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);

      const oldTime1 = currentTime - 2000;
      const oldTime2 = currentTime - 1500;
      const oldTime3 = currentTime - 1000;
      const recentTime1 = currentTime - 500;
      const recentTime2 = currentTime;

      logLevelHealthCheck
        .getTimes()
        .push(oldTime1, oldTime2, oldTime3, recentTime1, recentTime2);
      logLevelHealthCheck.update();
      expect(logLevelHealthCheck.getTimes().length).toEqual(2);
      expect(logLevelHealthCheck.getTimes()).toContain(recentTime1);
      expect(logLevelHealthCheck.getTimes()).toContain(recentTime2);

      jest.spyOn(Date, 'now').mockRestore();
    });
  });

  describe('getDescription', () => {
    /**
     * @target LogLevelHealthCheck.getDescription should return last logged error as description
     * @dependency
     * @scenario
     * - log error messages 4 times
     * - call getDescription function
     * @expected
     * - return last logged message
     */
    it('should return last logged error as description', async () => {
      logger.error('Test error 1');
      logger.error('Test error 2');
      logger.error('Test error 3');
      logger.error('Test error 4');

      const description = await logLevelHealthCheck.getDescription();
      expect(description).toEqual(
        'There are 4 error log(s). Last one is "Test error 4"'
      );
    });

    /**
     * @target LogLevelHealthCheck.getDescription should return empty when times length is shorter than expected
     * @dependency
     * @scenario
     * - log error messages 2 times
     * - call getDescription function
     * @expected
     * - return empty string
     */
    it('should return empty when times length is shorter than expected', async () => {
      logger.error('Test error 1');
      logger.error('Test error 2');

      const description = await logLevelHealthCheck.getDescription();
      expect(description).toEqual('');
    });
  });

  describe('getHealthStatus', () => {
    /**
     * @target LogLevelHealthCheck.getHealthStatus should return provided level status when more than threshold error logs
     * @dependency
     * @scenario
     * - log error messages 4 times
     * - call getHealthStatus function
     * @expected
     * - return UNSTABLE
     */
    it('should return provided level status when more than threshold error logs', async () => {
      logger.error('Test error 1');
      logger.error('Test error 2');
      logger.error('Test error 3');
      logger.error('Test error 4');

      const healthStatus = await logLevelHealthCheck.getHealthStatus();
      expect(healthStatus).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target LogLevelHealthCheck.getHealthStatus should return HEALTHY status when error logs count less than threshold
     * @dependency
     * @scenario
     * - log error messages 2 times
     * - call getHealthStatus function
     * @expected
     * - return HEALTHY
     */
    it('should return HEALTHY status when error logs count less than threshold', async () => {
      logger.error('Test error 1');
      logger.error('Test error 2');

      const healthStatus = await logLevelHealthCheck.getHealthStatus();
      expect(healthStatus).toEqual(HealthStatusLevel.HEALTHY);
    });
  });
});
