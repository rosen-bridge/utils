import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '../AbstractHealthCheckParam';

abstract class AbstractWidHealthCheckParam extends AbstractHealthCheckParam {
  protected rwtRepoAddress: string;
  protected rwtRepoNft: string;
  protected address: string;
  protected widExists: boolean;
  protected updateTimeStamp: Date;

  constructor(rwtRepoAddress: string, rwtRepoNft: string, address: string) {
    super();
    this.rwtRepoAddress = rwtRepoAddress;
    this.address = address;
    this.rwtRepoNft = rwtRepoNft;
  }

  /**
   * generates a unique id
   * @returns parameter id
   */
  getId = (): string => {
    return `Wid Check`;
  };

  /**
   * if WID doesn't exist fot this address, returns the required notification.
   * @returns parameter health description
   */
  getDescription = async (): Promise<string | undefined> => {
    if (!this.widExists)
      return (
        `Service has stopped working since there is no available WID for this address [${this.address}].\n` +
        `You should lock RSN to get permit and WID`
      );
    return undefined;
  };

  /**
   * Updates the wid health status and the update timestamp
   */
  abstract update: () => unknown;

  /**
   * @returns last update time
   */
  getLastUpdatedTime = async (): Promise<Date | undefined> => {
    return this.updateTimeStamp;
  };

  /**
   * @returns wid health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    if (!this.widExists) return HealthStatusLevel.BROKEN;
    return HealthStatusLevel.HEALTHY;
  };
}

export { AbstractWidHealthCheckParam };
