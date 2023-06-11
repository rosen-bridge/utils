import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '../AbstractHealthCheckParam';

export interface P2PNetworkHealthCheckOptions {
  defectConfirmationTimeWindowMs: number;
  connectedGuardsHealthyPercentThreshold: number;
  getConnectedGuardsPercent: () => number;
  getIsAtLeastOneRelayConnected: () => boolean;
}

export class P2PNetworkHealthCheck extends AbstractHealthCheckParam {
  private defectConfirmationTimeWindowMs!: number; // time window (in ms) after which a defect is confirmed and status is updated
  private connectedGuardsHealthyPercentThreshold!: number; // minimum percent of connected guards for a healthy status
  private getConnectedGuardsPercent!: () => number; // a callback used to get current connected guards percent
  private getIsAtLeastOneRelayConnected: () => boolean; // a callback used to get current relay connection status

  private status = HealthStatusLevel.HEALTHY; // current health status

  private lastUpdatedTime: Date | undefined; // the last time `update` was called
  private lastDefectTimestamp: number | undefined; // the last time a defect (relay disconnection or insufficient connected guards percent) was detected

  constructor({
    defectConfirmationTimeWindowMs: brokenTimeWindow,
    connectedGuardsHealthyPercentThreshold,
    getConnectedGuardsPercent,
    getIsAtLeastOneRelayConnected,
  }: P2PNetworkHealthCheckOptions) {
    super();

    this.defectConfirmationTimeWindowMs = brokenTimeWindow;
    this.connectedGuardsHealthyPercentThreshold =
      connectedGuardsHealthyPercentThreshold;
    this.getConnectedGuardsPercent = getConnectedGuardsPercent;
    this.getIsAtLeastOneRelayConnected = getIsAtLeastOneRelayConnected;
  }

  /**
   * get health check parameter id
   */
  getId = () => 'p2p network';

  /**
   * update health status for this param if needed (based on the scenario
   * described in comments)
   */
  update = () => {
    const now = new Date();
    const nowTimestamp = now.getTime();
    this.lastUpdatedTime = now;

    const connectedGuardsPercent = this.getConnectedGuardsPercent();
    const isAtLeastOneRelayConnected = this.getIsAtLeastOneRelayConnected();

    const guardsPercentCheckPassed =
      connectedGuardsPercent >= this.connectedGuardsHealthyPercentThreshold;
    const relayConnectionCheckPassed = isAtLeastOneRelayConnected;

    // if everything is ok, reset all state to normal and return
    if (guardsPercentCheckPassed && relayConnectionCheckPassed) {
      this.lastDefectTimestamp = undefined;
      this.status = HealthStatusLevel.HEALTHY;
      return;
    }

    // if there is a new defect, save its timestamp and return
    if (!this.lastDefectTimestamp) {
      this.lastDefectTimestamp = nowTimestamp;
      return;
    }

    // if there is some defect within defect confirmation time window, do nothing
    if (
      nowTimestamp <
      this.lastDefectTimestamp + this.defectConfirmationTimeWindowMs
    ) {
      return;
    }

    // if there is still some defect present after defect confirmation time window, update status to broken
    this.status = HealthStatusLevel.BROKEN;
  };

  /**
   * get health status for this param
   */
  getHealthStatus = async () => {
    return this.status;
  };

  /**
   * get health description for this param or undefined if status is healthy
   */
  getDescription = async () => {
    if (this.status === HealthStatusLevel.HEALTHY) {
      return undefined;
    }

    if (!this.getIsAtLeastOneRelayConnected()) {
      return 'No relay is connected';
    }

    return `${this.getConnectedGuardsPercent()} percent of guards are connected which is below or equal to ${
      this.connectedGuardsHealthyPercentThreshold
    } threshold`;
  };

  /**
   * get last updated time or undefined if `update` is not called yet
   */
  getLastUpdatedTime = async () => this.lastUpdatedTime;
}
