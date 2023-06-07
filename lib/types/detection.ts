import { AbstractLogger } from '@rosen-bridge/logger-interface';
import { EncryptionHandler } from '../abstract/EncryptionHandler';
import { randomBytes } from '@noble/hashes/utils';

export interface GuardDetectionConfig {
  logger?: AbstractLogger;
  guardsPublicKey: string[];
  signer: EncryptionHandler;
  submit: (msg: string, peers: Array<string>) => unknown;
  activeTimeoutSeconds?: number;
  heartbeatTimeoutSeconds?: number;
  messageValidDurationSeconds?: number;
}

export interface GuardInfo {
  peerId: string;
  nonce: Array<Nonce>;
  lastUpdate: number; // timestamp
  publicKey: string;
  callback: Array<(value: boolean) => unknown>;
}

export class Nonce {
  bytes: string;
  timestamp: number;

  constructor() {
    this.bytes = Buffer.from(randomBytes(32)).toString('hex');
    this.timestamp = Date.now();
  }
}

export interface RegisterPayload {
  nonce: string;
}

export interface ApprovePayload {
  nonce?: string;
  receivedNonce: string;
}
export interface HeartbeatPayload {
  nonce: string;
}

export type MessageType = 'register' | 'approval' | 'heartbeat';
