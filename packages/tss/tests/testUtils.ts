import {
  ApprovePayload,
  GuardDetectionConfig,
  GuardInfo,
  HeartbeatPayload,
  Message,
  MessageHandler,
  RegisterPayload,
} from '../lib/types/types';
import crypto from 'crypto';
import pkg from 'secp256k1';
import { DummyLogger } from '@rosen-bridge/logger-interface';
import { GuardDetection } from '../lib';

/**
 * Generate 4 random private keys
 */
const guardsPrivateKeys = Array.from({ length: 4 }, () =>
  crypto.randomBytes(32).toString('hex')
);

/**
 * Generate public keys from private keys in ed25519 format
 */
const guardsPublicKeys = guardsPrivateKeys.map((privateKey) =>
  Buffer.from(
    pkg.publicKeyCreate(Buffer.from(privateKey, 'hex'), false)
  ).toString('hex')
);

/**
 * Mocked handler for testing
 */
const handler: MessageHandler = {
  checkSign: (message, signature, signerPublicKey) => {
    return signature === 'signature';
  },
  decrypt: (message) => {
    return message;
  },
  encrypt: (message) => {
    return message;
  },
  send: () => {
    return new Promise((resolve) => {
      resolve();
    });
  },
  sign: (message) => {
    return 'signature';
  },
};

/**
 * Mocked config for testing
 */
const config: GuardDetectionConfig = {
  guardsPublicKey: guardsPublicKeys.slice(1, 4),
  logger: new DummyLogger(),
  publicKey: guardsPublicKeys[0],
};

/**
 * Mocked GuardDetection class for testing
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

export {
  TestGuardDetection,
  handler,
  config,
  guardsPrivateKeys,
  guardsPublicKeys,
};
