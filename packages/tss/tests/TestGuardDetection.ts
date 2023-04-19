import { GuardDetection, Message } from '../lib';
import {
  ApprovePayload,
  GuardInfo,
  HeartbeatPayload,
  RegisterPayload,
} from '../lib/types';

/**
 * GuardDetection class for testing
 */
class TestGuardDetection extends GuardDetection {
  getCheckMessageSign(message: Message) {
    return this.checkMessageSign(message);
  }
  getPublicKeyToIndex(publicKey: string) {
    return this.publicKeyToIndex(publicKey);
  }

  async getHandleRegisterMessage(payload: RegisterPayload, sender: string) {
    return await this.handleRegisterMessage(payload, sender);
  }

  async getHandleApproveMessage(
    payload: ApprovePayload,
    sender: string,
    senderPeerId: string
  ) {
    return await this.handleApproveMessage(payload, sender, senderPeerId);
  }

  async getHandleHeartbeatMessage(payload: HeartbeatPayload, sender: string) {
    return await this.handleHeartbeatMessage(payload, sender);
  }

  async getHandleReceivedMessage(message: string, senderPeerId: string) {
    return await this.handleReceiveMessage(message, senderPeerId);
  }

  async getSendRegisterMessage(index: number) {
    return await this.sendRegisterMessage(index);
  }

  async getSendHeartbeatMessage(index: number) {
    return await this.sendHeartbeatMessage(index);
  }

  getCheckTimestamp(timestamp: number) {
    return this.checkTimestamp(timestamp);
  }

  getIsGuardActive(guardIndex: number) {
    return this.isGuardActive(guardIndex);
  }
  async runUpdateGuardsStatus() {
    await this.updateGuardsStatus();
  }

  setGuardsInfo(info: GuardInfo, index: number) {
    this.guardsInfo[index] = info;
  }

  getGuardInfo(index: number) {
    return this.guardsInfo[index];
  }
}

export { TestGuardDetection };
