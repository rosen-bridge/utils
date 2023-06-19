import { ErgoNodeSyncHealthCheckParam } from '../../../lib';

class TestErgoNodeSyncHealthCheckParam extends ErgoNodeSyncHealthCheckParam {
  /**
   * set mocked height difference
   * @param diff mocked height difference
   */
  setNodeHeightDifference = (diff: number) => {
    this.nodeHeightDifference = diff;
  };

  /**
   * set mocked last block time
   * @param time mocked last block time
   */
  setNodeLastBlockTime = (time: number) => {
    this.nodeLastBlockTime = time;
  };

  /**
   * set mocked peer count
   * @param peerCount mocked peer count
   */
  setNodePeerCount = (peerCount: number) => {
    this.nodePeerCount = peerCount;
  };

  /**
   * set mocked peers height difference
   * @param diff mocked peers height difference
   */
  setNodePeerHeightDifference = (diff: number) => {
    this.nodePeerHeightDifference = diff;
  };

  /**
   * @returns protected height difference
   */
  getHeightDifference = () => {
    return this.nodeHeightDifference;
  };

  /**
   * @returns protected last block time
   */
  getLastBlockTime = () => {
    return this.nodeLastBlockTime;
  };

  /**
   * @returns protected peer count
   */
  getPeerCount = () => {
    return this.nodePeerCount;
  };

  /**
   * @returns protected peer difference
   */
  getPeerDifference = () => {
    return this.nodePeerHeightDifference;
  };
}

export { TestErgoNodeSyncHealthCheckParam };
