import { AbstractHealthCheckParam, HealthStatusChoice } from '../lib';

export class TestHealthCheckParam extends AbstractHealthCheckParam {
  protected id: string;
  protected description: string | undefined;
  protected status: HealthStatusChoice;
  public callCount = 0;
  public lastCallDate: Date | undefined;
  constructor(id: string, status: HealthStatusChoice, description?: string) {
    super();
    this.id = id;
    this.status = status;
    this.description = description;
  }
  getDescription = (): Promise<string | undefined> => {
    return Promise.resolve(this.description);
  };

  getHealthStatus = (): Promise<HealthStatusChoice> => {
    return Promise.resolve(this.status);
  };

  getId = (): string => {
    return this.id;
  };

  update = (): unknown => {
    this.callCount += 1;
    this.lastCallDate = new Date();
    return undefined;
  };
  getLastCalledTime = () => {
    return Promise.resolve(new Date());
  };
}
