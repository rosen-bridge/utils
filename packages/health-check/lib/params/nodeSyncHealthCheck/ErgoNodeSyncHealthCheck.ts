import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '../AbstractHealthCheckParam';

class ErgoNodeSyncHealthCheckParam extends AbstractHealthCheckParam {
  protected maxHeightDifference: number; // maximum difference between header height and full height
  protected maxBlockTime: number; // maximum time to see  a new block in minutes
  protected minPeerCount: number; // minimum recommended peers
  protected maxPeerHeightDifference: number; // maximum difference between peers and our node
  protected updateTimeStamp: Date;
  protected nodeApi;
  protected nodeHeightDifference: number;
  protected nodeLastBlockTime: number;
  protected nodePeerCount: number;
  protected nodePeerHeightDifference: number;

  constructor(
    maxHeightDifference: number,
    maxBlockTimeInMinute: number,
    minPeerCount: number,
    minPeerHeightDiff: number,
    nodeUrl: string
  ) {
    super();
    this.maxHeightDifference = maxHeightDifference;
    this.maxBlockTime = maxBlockTimeInMinute;
    this.minPeerCount = minPeerCount;
    this.maxPeerHeightDifference = minPeerHeightDiff;
    this.nodeApi = ergoNodeClientFactory(nodeUrl);
  }

  /**
   * generates a unique id for node sync
   * @returns parameter id
   */
  getId = (): string => {
    return `Ergo Node Sync Check`;
  };

  /**
   * adds required notifications based on each condition
   * @returns parameter health description
   */
  getDescription = async (): Promise<string | undefined> => {
    let notification;
    const healthStatus = await this.getHealthStatus();
    if (healthStatus === HealthStatusLevel.UNSTABLE) {
      notification = `Service is in unstable situation since the ergo node is out of sync.\n`;
    } else if (healthStatus === HealthStatusLevel.BROKEN) {
      notification = `Service has stopped working correctly since the ergo node is out of sync.\n`;
    }
    if (this.nodeHeightDifference > this.maxHeightDifference) {
      notification =
        notification +
        `[${this.nodeHeightDifference}] block headers are scanned but the full blocks are not scanned yet.\n`;
    }
    if (this.nodeLastBlockTime > this.maxBlockTime) {
      let time;
      if (this.nodeLastBlockTime >= 60) {
        time = `[${Math.floor(this.nodeLastBlockTime / 60)} hour and [${
          this.nodeLastBlockTime % 60
        }] minutes`;
      } else time = `[${Math.floor(this.nodeLastBlockTime)}] minutes`;
      notification =
        notification +
        `The last block is scanned ${time} ago which seems to be too long.\n`;
    }
    if (this.nodePeerCount < this.minPeerCount) {
      notification =
        notification +
        `The node is connected to [${this.nodePeerCount}] peers, while the recommended stable peers should be more than [${this.minPeerCount}].\n`;
    }
    if (this.nodePeerHeightDifference > this.maxPeerHeightDifference) {
      notification =
        notification +
        `The connected peers are [${this.nodePeerHeightDifference}] block ahead of our node.\n`;
    }
    return notification;
  };

  /**
   * Updates the node sync health status and the update timestamp
   */
  update = async () => {
    const nodeInfo = await this.nodeApi.info.getNodeInfo();
    if (!nodeInfo.headersHeight || !nodeInfo.fullHeight) {
      throw new Error(
        "Node info api response format is not correct, header height or full height doesn't exist"
      );
    }
    this.nodeHeightDifference = Number(
      nodeInfo.headersHeight - nodeInfo.fullHeight
    );
    this.nodeLastBlockTime =
      (Date.now() -
        Number((await this.nodeApi.blocks.getLastHeaders(1n))[0].timestamp)) /
      60000; // Convert millisecond to minute
    this.nodePeerCount = (await this.nodeApi.peers.getConnectedPeers()).length;
    const maxPeerHeight = (await this.nodeApi.peers.getPeersSyncInfo()).reduce(
      (max, info) => {
        return Math.max(Number(info.height), max);
      },
      0
    );
    this.nodePeerHeightDifference = maxPeerHeight - Number(nodeInfo.fullHeight);
    this.updateTimeStamp = new Date();
  };

  /**
   * @returns last update time
   */
  getLastUpdatedTime = async (): Promise<Date | undefined> => {
    return this.updateTimeStamp;
  };

  /**
   * Service is unstable if each of the conditions is true,
   * and is out of sync (Broken) if at least 3 conditions happened
   * @returns node sync health status
   */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    const nodeCondition =
      Number(this.nodeHeightDifference > this.maxHeightDifference) +
      Number(this.nodeLastBlockTime > this.maxBlockTime) +
      Number(this.nodePeerCount < this.minPeerCount) +
      Number(this.nodePeerHeightDifference > this.maxPeerHeightDifference);
    if (nodeCondition >= 3) return HealthStatusLevel.BROKEN;
    else if (nodeCondition >= 1) return HealthStatusLevel.UNSTABLE;
    else return HealthStatusLevel.HEALTHY;
  };
}

export { ErgoNodeSyncHealthCheckParam };
