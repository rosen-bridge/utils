import { GuardDetection } from '../../lib';
import {
  ApprovePayload,
  HeartbeatPayload,
  RegisterPayload,
} from '../../lib/types/detection';

/**
 * GuardDetection class for testing
 */
class TestGuardDetection extends GuardDetection {
  getInfo = () => this.guardsInfo;

  mockedHandleApprove = (
    payload: ApprovePayload,
    sender: string,
    guardIndex: number
  ) => this.handleApproveMessage(payload, sender, guardIndex);
  mockedHandleRegister = (
    payload: RegisterPayload,
    sender: string,
    guardIndex: number
  ) => this.handleRegisterMessage(payload, sender, guardIndex);
  mockedHandleHeartbeat = (
    payload: HeartbeatPayload,
    sender: string,
    guardIndex: number
  ) => this.handleHeartbeatMessage(payload, sender, guardIndex);

  mockAddNonce = (index?: number) => this.addNonce(index);
  mockClearNonce = () => this.clearNonce();

  getMessageValidDuration = () => this.messageValidDuration;
}

export { TestGuardDetection };
