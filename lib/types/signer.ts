import { EncryptionHandler } from '../abstract';
import { AbstractLogger } from '@rosen-bridge/logger-interface';
import { GuardDetection } from '../detection/GuardDetection';
import { ActiveGuard } from './abstract';

export interface SignerConfig {
  logger?: AbstractLogger;
  guardsPk: Array<string>;
  signer: EncryptionHandler;
  submitMsg: (message: string, guards: Array<string>) => unknown;
  messageValidDuration?: number;
  timeoutSeconds?: number;
  tssSignUrl: string;
  callbackUrl: string;
  detection: GuardDetection;
  turnDurationSeconds?: number;
  turnNoWorkSeconds?: number;
  threshold: number;
  getPeerId: () => Promise<string>;
}

export interface Signature {
  signature: string;
  r: string;
  z: string;
}

export interface Sign {
  msg: string;
  callback: (status: boolean, message?: string, args?: Signature) => unknown;
  request?: {
    guards: Array<ActiveGuard>;
    index: number;
    timestamp: number;
  };
  signs: Array<string>;
  addedTime: number;
}

export interface PendingSign {
  msg: string;
  guards: Array<ActiveGuard>;
  index: number;
  timestamp: number;
  sender: string;
}
export interface SignRequestPayload {
  msg: string;
  guards: Array<ActiveGuard>;
}

export interface SignApprovePayload {
  msg: string;
  guards: Array<ActiveGuard>;
  initGuardIndex: number;
}

export interface SignStartPayload {
  msg: string;
  guards: Array<ActiveGuard>;
  signs: Array<string>;
}

export type SignMessageType = 'request' | 'approve' | 'start';
