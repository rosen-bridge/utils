enum HealthStatusLevel {
  HEALTHY = 'Healthy',
  UNSTABLE = 'Unstable',
  BROKEN = 'Broken',
}

abstract class AbstractHealthCheckParam {
  /**
   * get param id
   */
  abstract getId: () => string;

  /**
   * update health status for this param
   */
  abstract update: () => unknown;

  /**
   * get health status for this param
   */
  abstract getHealthStatus: () => Promise<HealthStatusLevel>;

  /**
   * get health description for this param.
   * if status is HEALTHY return undefined otherwise return description string
   */
  abstract getDescription: () => Promise<string | undefined>;

  /**
   * get last updated time
   * if not running till now return undefined
   */
  abstract getLastUpdatedTime: () => Promise<Date | undefined>;
}

export { AbstractHealthCheckParam, HealthStatusLevel };
