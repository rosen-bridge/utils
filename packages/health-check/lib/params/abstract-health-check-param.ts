enum HealthStatusChoice {
  HEALTHY = 'Healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded',
}

abstract class AbstractHealthCheckParam {
  /**
   * get parameter id
   */
  abstract getId: () => string;

  /**
   * update health status for this parameter
   */
  abstract update: () => unknown;

  /**
   * get health status for this parameter
   */
  abstract getHealthStatus: () => Promise<HealthStatusChoice>;

  /**
   * get health description for this parameter.
   * if status is HEALTHY return undefined otherwise return description string
   */
  abstract getDescription: () => Promise<string | undefined>;

  /**
   * get last updated time
   * if not running till now return return undefined
   */
  abstract getLastCalledTime: () => Promise<Date | undefined>;
}

export { AbstractHealthCheckParam, HealthStatusChoice };
