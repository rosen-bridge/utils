enum HealthStatusChoice {
  HEALTHY = 'Healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded',
}

abstract class AbstractHealthCheckParam {
  abstract getId: () => string;
  abstract update: () => unknown;
  abstract getHealthStatus: () => Promise<HealthStatusChoice>;
  abstract getDescription: () => Promise<string | undefined>;
  abstract getLastCalledTime: () => Promise<Date>;
}

export { AbstractHealthCheckParam, HealthStatusChoice };
