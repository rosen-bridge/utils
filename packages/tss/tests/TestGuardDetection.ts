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
  getCheckMessageSign = (message: Message) => {
    return this.checkMessageSign(message);
  };
  getPublicKeyToIndex = (publicKey: string) => {
    return this.publicKeyToIndex(publicKey);
  };

  getHandleRegisterMessage = async (
    payload: RegisterPayload,
    sender: string
  ) => {
    return await this.handleRegisterMessage(payload, sender);
  };

  getHandleApproveMessage = async (
    payload: ApprovePayload,
    sender: string,
    senderPeerId: string
  ) => {
    return await this.handleApproveMessage(payload, sender, senderPeerId);
  };

  getHandleHeartbeatMessage = async (
    payload: HeartbeatPayload,
    sender: string
  ) => {
    return await this.handleHeartbeatMessage(payload, sender);
  };

  getHandleReceivedMessage = async (message: string, senderPeerId: string) => {
    return await this.handleReceiveMessage(message, senderPeerId);
  };

  getSendRegisterMessage = async (index: number) => {
    return await this.sendRegisterMessage(index);
  };

  getSendHeartbeatMessage = async (index: number) => {
    return await this.sendHeartbeatMessage(index);
  };

  getCheckTimestamp = (timestamp: number) => {
    return this.checkTimestamp(timestamp);
  };

  getIsGuardActive = (guardIndex: number) => {
    return this.isGuardActive(guardIndex);
  };

  getTimeRemindToSign = () => {
    return this.timeRemindToSign();
  };
  runUpdateGuardsStatus = async () => {
    await this.updateGuardsStatus();
  };

  setGuardsInfo = (info: GuardInfo, index: number) => {
    this.guardsInfo[index] = info;
  };

  getGuardInfo = (index: number) => {
    return this.guardsInfo[index];
  };
}

export { TestGuardDetection };
