import { AbstractHealthCheckParam, HealthStatusLevel } from '../lib';

export class TestHealthCheckParam extends AbstractHealthCheckParam {
  protected id: string;
  protected description: string | undefined;
  protected status: HealthStatusLevel;
  public callsCount = 0;
  constructor(id: string, status: HealthStatusLevel, description?: string) {
    super();
    this.id = id;
    this.status = status;
    this.description = description;
  }
  getDescription = (): Promise<string | undefined> => {
    return Promise.resolve(this.description);
  };

  getHealthStatus = (): Promise<HealthStatusLevel> => {
    return Promise.resolve(this.status);
  };

  getId = (): string => {
    return this.id;
  };

  update = (): unknown => {
    this.callsCount += 1;
    return undefined;
  };
  getLastUpdatedTime = () => {
    return Promise.resolve(new Date());
  };
}
