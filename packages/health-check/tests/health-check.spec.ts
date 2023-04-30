import { HealthStatusChoice } from '../lib';
import { TestHealthCheckParam } from './TestHealthCheckParam';
import { TestHealthCheck } from './TestHealthCheck';

describe('HealthCheck', () => {
  describe('register', () => {
    /**
     * @target: HealthCheck.register should register new param
     * @dependencies:
     * @scenario:
     * - create new instance of HealthCheck
     * - register a custom param on it
     * @expected:
     * - params length of class must be 1
     * - param first element must be created param
     */
    it('should register new param', () => {
      const healthCheck = new TestHealthCheck();
      const param = new TestHealthCheckParam('', HealthStatusChoice.HEALTHY);
      healthCheck.register(param);
      expect(healthCheck.getParams().length).toEqual(1);
      expect(healthCheck.getParams()[0]).toBe(param);
    });
  });

  describe('unregister', () => {
    /**
     * @target: HealthCheck.unregister should unregister an already registered param
     * @dependencies:
     * @scenario:
     * - create new instance of HealthCheck
     * - create two params
     * - register params on healthCheck
     * - unregister second param id from healthCheck
     * @expected:
     * - param length of class must be 1
     * - first element in params must be same as first param
     */
    it('should unregister an already registered param', () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam(
        'id1',
        HealthStatusChoice.HEALTHY
      );
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusChoice.HEALTHY
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      healthCheck.unregister('id2');
      expect(healthCheck.getParams().length).toEqual(1);
      expect(healthCheck.getParams()[0]).toBe(param1);
    });

    /**
     * @target: HealthCheck.unregister should do nothing if no param with expected id registered
     * @dependencies:
     * @scenario:
     * - create new instance of HealthCheck
     * - create two params
     * - register params on healthCheck
     * - unregister an invalid id from healthCheck
     * @expected:
     * - params list length must be 2
     * - both params in list must be registered params
     */
    it('should do nothing if no param with expected id registered', () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam(
        'id1',
        HealthStatusChoice.HEALTHY
      );
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusChoice.HEALTHY
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      healthCheck.unregister('id3');
      expect(healthCheck.getParams().length).toEqual(2);
      expect(healthCheck.getParams()[0]).toBe(param1);
      expect(healthCheck.getParams()[1]).toBe(param2);
    });
  });

  describe('update', () => {
    /**
     * @target: HealthCheck.update should update all params update function
     * @dependencies:
     * @scenario:
     * - create new instance of HealthCheck
     * - create two params
     * - register params on healthCheck
     * - call update
     * @expected:
     * - update of each param must be called
     */
    it('should update all params update function', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam(
        'id1',
        HealthStatusChoice.HEALTHY
      );
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusChoice.HEALTHY
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      await healthCheck.update();
      expect(param1.callCount).toEqual(1);
      expect(param2.callCount).toEqual(1);
    });
  });

  describe('refresh', () => {
    /**
     * @target: HealthCheck.refresh should update param with expected id when calling refresh
     * @dependencies:
     * @scenario:
     * - create new instance of HealthCheck
     * - create two params
     * - register params on healthCheck
     * - call refresh with param1 id
     * @expected:
     * - param1 update function must be called
     * - param2 update must no be called
     */
    it('should update param with expected id when calling refresh', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam(
        'id1',
        HealthStatusChoice.HEALTHY
      );
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusChoice.HEALTHY
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      await healthCheck.refresh(param1.getId());
      expect(param1.callCount).toEqual(1);
      expect(param2.callCount).toEqual(0);
    });
  });

  describe('getOverallHealthStatus', () => {
    /**
     * @target: HealthCheck.getOverallHealthStatus should return HEALTHY when all params are in healthy status
     * @dependencies:
     * @scenario:
     * - create new instance of HealthCheck
     * - create two params with HEALTHY status
     * - register params on healthCheck
     * - call getOverallHealthStatus
     * @expected:
     * - returned status must be healthy
     */
    it('should return HEALTHY when all params are in healthy status', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam(
        'id1',
        HealthStatusChoice.HEALTHY
      );
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusChoice.HEALTHY
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      const result = await healthCheck.getOverallHealthStatus();
      expect(result.status).toEqual(HealthStatusChoice.HEALTHY);
    });

    /**
     * @target: HealthCheck.getOverallHealthStatus should return UNHEALTHY with first unhealthy param description when one or more UNHEALTHY param and no DEGRADED param available
     * @dependencies:
     * @scenario:
     * - create new instance of HealthCheck
     * - create two params with UNHEALTHY status and one param with HEALTHY status
     * - register params on healthCheck
     * - call getOverallHealthStatus
     * @expected:
     * - returned status must be UNHEALTHY with description of first UNHEALTHY param
     */
    it('should return UNHEALTHY with first unhealthy param description when one or more UNHEALTHY param and no DEGRADED param available', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam(
        'id1',
        HealthStatusChoice.HEALTHY
      );
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusChoice.UNHEALTHY,
        'description 1'
      );
      const param3 = new TestHealthCheckParam(
        'id3',
        HealthStatusChoice.UNHEALTHY,
        'description 2'
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      healthCheck.register(param3);
      const result = await healthCheck.getOverallHealthStatus();
      expect(result.status).toEqual(HealthStatusChoice.UNHEALTHY);
      expect(result.description).toEqual('description 1');
    });

    /**
     * @target: HealthCheck.getOverallHealthStatus should return DEGRADED with first DEGRADED param description when one or more DEGRADED param
     * @dependencies:
     * @scenario:
     * - create new instance of HealthCheck
     * - create two params with DEGRADED status and one param with UNHEALTHY status and one param with HEALTHY status
     * - register params on healthCheck
     * - call getOverallHealthStatus
     * @expected:
     * - returned status must be DEGRADED with description of first DEGRADED param
     */
    it('should return DEGRADED with first DEGRADED param description when one or more DEGRADED param', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam(
        'id1',
        HealthStatusChoice.HEALTHY
      );
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusChoice.UNHEALTHY,
        'description 1'
      );
      const param3 = new TestHealthCheckParam(
        'id3',
        HealthStatusChoice.DEGRADED,
        'description 2'
      );
      const param4 = new TestHealthCheckParam(
        'id3',
        HealthStatusChoice.DEGRADED,
        'description 3'
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      healthCheck.register(param3);
      healthCheck.register(param4);
      const result = await healthCheck.getOverallHealthStatus();
      expect(result.status).toEqual(HealthStatusChoice.DEGRADED);
      expect(result.description).toEqual('description 2');
    });
  });

  describe('getHealthStatusOneParam', () => {
    /**
     * @target: HealthCheck.getHealthStatusOneParam should return detail status of selected param
     * @dependencies:
     * @scenario:
     * - create new instance of HealthCheck
     * - create on params with DEGRADED status and one param with UNHEALTHY status and one param with HEALTHY status
     * - register params on healthCheck
     * - call getHealthStatusOneParam with HEALTHY status param
     * @expected:
     * - result must not be undefined
     * - returned status must be HEALTHY
     */
    it('should return detail status of selected param', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam(
        'id1',
        HealthStatusChoice.HEALTHY
      );
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusChoice.UNHEALTHY,
        'description 2'
      );
      const param3 = new TestHealthCheckParam(
        'id3',
        HealthStatusChoice.DEGRADED,
        'description 3'
      );
      healthCheck.register(param3);
      healthCheck.register(param2);
      healthCheck.register(param1);
      const result = await healthCheck.getHealthStatusOneParam('id1');
      if (result !== undefined) {
        expect(result.status).toEqual(HealthStatusChoice.HEALTHY);
      }
      expect(result).toBeDefined();
    });

    /**
     * @target: HealthCheck.getHealthStatusOneParam should return undefined when param is not registered
     * @dependencies:
     * @scenario:
     * - create new instance of HealthCheck
     * - create on params with UNHEALTHY status and one param with HEALTHY status
     * - register params on healthCheck
     * - call getHealthStatusOneParam with random id(not registered
     * @expected:
     * - result must be undefined
     */
    it('should return undefined when param is not registered', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam(
        'id1',
        HealthStatusChoice.HEALTHY
      );
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusChoice.UNHEALTHY,
        'description 2'
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      const result = await healthCheck.getHealthStatusOneParam('id3');
      expect(result).toBeUndefined();
    });
  });

  describe('getHealthStatus', () => {
    /**
     * @target: HealthCheck.getHealthStatus
     * @dependencies:
     * @scenario:
     * - create new instance of HealthCheck
     * - create on params with DEGRADED status and one param with UNHEALTHY status and one param with HEALTHY status
     * - register params on healthCheck
     * - call getHealthStatus
     * @expected:
     * - result list must be 3
     * - for each registered param:
     * --- one result must be in output list
     * --- selected result must have same status as param status
     * --- selected result must have same description as param description
     */
    it('should return a list contain all parameters health status with description', async () => {
      const healthCheck = new TestHealthCheck();
      const param1 = new TestHealthCheckParam(
        'id1',
        HealthStatusChoice.HEALTHY
      );
      const param2 = new TestHealthCheckParam(
        'id2',
        HealthStatusChoice.UNHEALTHY,
        'description 2'
      );
      const param3 = new TestHealthCheckParam(
        'id3',
        HealthStatusChoice.DEGRADED,
        'description 3'
      );
      healthCheck.register(param1);
      healthCheck.register(param2);
      healthCheck.register(param3);
      const result = await healthCheck.getHealthStatus();
      expect(result.length).toEqual(3);
      const params = [param1, param2, param3];
      for (const param of params) {
        const resultRow = result.filter((item) => item.id === param.getId());
        expect(resultRow.length).toEqual(1);
        expect(resultRow[0].status).toEqual(await param.getHealthStatus());
        expect(resultRow[0].description).toEqual(await param.getDescription());
      }
    });
  });
});
