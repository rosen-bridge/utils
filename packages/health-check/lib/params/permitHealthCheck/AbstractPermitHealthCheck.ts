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
  protected reportsCount: bigint;
  protected updateTimeStamp: Date;
  protected rwtPerCommitment: number;

  constructor(
    RWT: string,
    permitAddress: string,
    WID: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    rwtPerCommitment: number
  ) {
    super();
    this.RWT = RWT;
    this.permitAddress = permitAddress;
    this.WID = WID;
    this.warnThreshold = warnThreshold;
    this.criticalThreshold = criticalThreshold;
    this.rwtPerCommitment = rwtPerCommitment;
  }

  /**
   * generates a unique id with WID
   * @returns parameter id
   */
  getId = (): string => {
    return `Available Reporting Permits`;
  };

  /**
   * if RWT count in permits is less than the thresholds returns the required notification
   * @returns parameter health description
   */
  getDescription = async (): Promise<string | undefined> => {
    if (this.reportsCount <= this.criticalThreshold)
      return (
        `Insufficient or critical amount of permit tokens.\n` +
        `Service may stop working soon. [${this.reportsCount}] report permits is left.` +
        ` Please lock more RSN to get more report permits.`
      );
    else if (this.reportsCount <= this.warnThreshold)
      return (
        `Service may stop working soon. Available report permits [${this.reportsCount}] are less than ` +
        `the recommended reports [${this.warnThreshold}]. Please lock more RSN to get more report permits.`
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
    if (this.reportsCount <= this.criticalThreshold)
      return HealthStatusLevel.BROKEN;
    else if (this.reportsCount <= this.warnThreshold)
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
  };

  /**
   * Updates the threshold to adapt to config changes
   * @param criticalThreshold
   * @param warnThreshold
   */
  updateThresholds = async (
    warnThreshold: bigint,
    criticalThreshold: bigint
  ) => {
    this.criticalThreshold = criticalThreshold;
    this.warnThreshold = warnThreshold;
  };
}

export { AbstractPermitHealthCheckParam };
