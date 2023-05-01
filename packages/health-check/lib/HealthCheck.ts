import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from './params/AbstractHealthCheckParam';

interface HealthStatus {
  id: string;
  status: HealthStatusLevel;
  description?: string;
  lastCheck?: Date;
}

interface OverallHealthStatus {
  status: HealthStatusLevel;
  description?: string;
}

class HealthCheck {
  protected params: Array<AbstractHealthCheckParam> = [];

  /**
   * register new param on healthCheck
   * @param param
   */
  register = (param: AbstractHealthCheckParam) => {
    this.params.push(param);
  };

  /**
   * unregister param from healthCheck
   * @param paramId
   */
  unregister = (paramId: string) => {
    this.params = this.params.filter((param) => param.getId() !== paramId);
  };

  /**
   * check all params health status
   */
  update = async () => {
    return Promise.all(this.params.map((item) => item.update()));
  };

  /**
   * check health status for one param
   * @param paramId
   */
  updateParam = async (paramId: string) => {
    for (const param of this.params.filter(
      (item) => item.getId() === paramId
    )) {
      await param.update();
    }
  };

  /**
   * get overall health status for system
   */
  getOverallHealthStatus = async (): Promise<OverallHealthStatus> => {
    let description: string | undefined = undefined;
    for (const param of this.params) {
      const status = await param.getHealthStatus();

      if (status === HealthStatusLevel.BROKEN) {
        return { status: status, description: await param.getDescription() };
      }
      if (status !== HealthStatusLevel.HEALTHY && description === undefined) {
        description = await param.getDescription();
      }
    }
    return {
      status:
        description === undefined
          ? HealthStatusLevel.HEALTHY
          : HealthStatusLevel.UNSTABLE,
      description,
    };
  };

  /**
   * check health status for on param
   * @param paramId
   */
  getHealthStatusFor = async (
    paramId: string
  ): Promise<HealthStatus | undefined> => {
    const params = this.params.filter((param) => param.getId() === paramId);
    if (params.length > 0) {
      const param = params[0];
      return {
        id: param.getId(),
        status: await param.getHealthStatus(),
        description: await param.getDescription(),
        lastCheck: await param.getLastUpdatedTime(),
      };
    }
    return undefined;
  };

  /**
   * get detailed health status for system
   */
  getHealthStatus = async (): Promise<Array<HealthStatus>> => {
    const res: Array<HealthStatus> = [];
    for (const param of this.params) {
      const status = await param.getHealthStatus();
      const description =
        status === HealthStatusLevel.HEALTHY
          ? undefined
          : await param.getDescription();
      const lastCheck = await param.getLastUpdatedTime();
      res.push({ status, description, lastCheck, id: param.getId() });
    }
    return res;
  };
}

export { HealthCheck, HealthStatus };
