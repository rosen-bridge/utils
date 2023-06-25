import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '../AbstractHealthCheckParam';

abstract class AbstractPermitHealthCheckParam extends AbstractHealthCheckParam {
  protected RWT: string;
  protected permitAddress: string;
  protected WID: string;
  protected warnThreshold: bigint;
  protected criticalThreshold: bigint;
  protected RWTCount: bigint;
  protected updateTimeStamp: Date;

  constructor(
    RWT: string,
    permitAddress: string,
    WID: string,
    warnThreshold: bigint,
    criticalThreshold: bigint
  ) {
    super();
    this.RWT = RWT;
    this.permitAddress = permitAddress;
    this.WID = WID;
    this.warnThreshold = warnThreshold;
    this.criticalThreshold = criticalThreshold;
  }

  /**
   * generates a unique id with WID
   * @returns parameter id
   */
  getId = (): string => {
    return `Permit Check`;
  };

  /**
   * if RWT count in permits is less than the thresholds returns the required notification
   * @returns parameter health description
   */
  getDescription = async (): Promise<string | undefined> => {
    if (this.RWTCount <= this.criticalThreshold)
      return (
        `Service has stopped working due insufficient available permits [${this.RWTCount}].\n` +
        `Permits should be more than [${this.criticalThreshold}] to work properly, please lock more RSN to get more permits.\n`
      );
    else if (this.RWTCount <= this.warnThreshold)
      return (
        `Service may stop working soon. Available permits [${this.RWTCount}] are less than ` +
        `the recommended amount [${this.warnThreshold}]. Please lock more RSN to get more permits.\n`
      );
    return undefined;
  };

  /**
   * Updates the asset health status and the update timestamp
   */
  abstract update: () => unknown;

  /**
   * @returns last update time
   */
  getLastUpdatedTime = async (): Promise<Date | undefined> => {
    return this.updateTimeStamp;
  };

  /**
   * @returns asset health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    if (this.RWTCount <= this.criticalThreshold)
      return HealthStatusLevel.BROKEN;
    else if (this.RWTCount <= this.warnThreshold)
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
  };
}

export { AbstractPermitHealthCheckParam };
