import { ActiveGuard, GuardDetection, Message } from '../lib';
import {
  ApprovePayload,
  GuardInfo,
  HeartbeatPayload,
  RegisterPayload,
  SignPayload,
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

  getSendSignMessage = async (
    index: number,
    signPayload: { payload: string; sign: string }
  ) => {
    return await this.sendSignMessage(index, signPayload);
  };

  getBroadcastSign = async (
    payload: string,
    publicKeySigns: Array<{ publicKey: string; sign: string }>
  ) => {
    return await this.broadcastSign(payload, publicKeySigns);
  };

  getRegisterAndWaitForApprove = async (
    guardsIndex: Array<number>,
    peerIds: Array<string>
  ) => {
    return this.registerAndWaitForApprove(guardsIndex, peerIds);
  };

  getHandleSignMessage = async (
    payload: SignPayload,
    senderPk: string,
    sender: string
  ) => {
    return this.handleSignMessage(payload, senderPk, sender);
  };
  getPayloadToSignMap = () => {
    return this.payloadToSignMap;
  };

  setPayloadToSignMap = (
    payload: string,
    map: {
      active: Array<string>;
      signed: Array<{ publicKey: string; sign: string }>;
    }
  ) => {
    this.payloadToSignMap.set(payload, map);
  };

  getSendRequestToSignMessage = async (
    guardIndex: number,
    requestToSignPayload: { payload: string; activeGuards: Array<ActiveGuard> }
  ) => {
    return await this.sendRequestToSignMessage(
      guardIndex,
      requestToSignPayload
    );
  };
  setGuardsInfo = (info: GuardInfo, index: number) => {
    this.guardsInfo[index] = info;
  };

  getGuardInfo = (index: number) => {
    return this.guardsInfo[index];
  };
}

export { TestGuardDetection };
