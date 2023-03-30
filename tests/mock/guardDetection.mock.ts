import {
  ApprovePayload,
  GuardDetectionConfig,
  GuardInfo,
  HeartbeatPayload,
  Message,
  MessageHandler,
  RegisterPayload,
} from '../../lib/types/types';
import crypto from 'crypto';
import pkg from 'secp256k1';
import { DummyLogger } from '@rosen-bridge/logger-interface';
import { GuardDetection } from '../../lib/GuardDetection';

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
  checkSign: (message, signature) => {
    return signature === 'signature';
  },
  decrypt: (message) => {
    return message;
  },
  encrypt: (message) => {
    return message;
  },
  send: () => {
    return {};
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
class mockGuardDetection extends GuardDetection {
  getCheckMessageSign(message: Message) {
    return this.checkMessageSign(message);
  }
  getPublicKeyToIndex(publicKey: string) {
    return this.publicKeyToIndex(publicKey);
  }

  getHandleRegisterMessage(payload: RegisterPayload, sender: string) {
    return this.handleRegisterMessage(payload, sender);
  }

  getHandleApproveMessage(
    payload: ApprovePayload,
    sender: string,
    senderPeerId: string
  ) {
    return this.handleApproveMessage(payload, sender, senderPeerId);
  }

  getHandleHeartbeatMessage(payload: HeartbeatPayload, sender: string) {
    return this.handleHeartbeatMessage(payload, sender);
  }

  getHandleReceivedMessage(message: string, senderPeerId: string) {
    return this.handleReceiveMessage(message, senderPeerId);
  }

  getCheckTimestamp(timestamp: number) {
    return this.checkTimestamp(timestamp);
  }
  runUpdateGuardsStatus() {
    this.updateGuardsStatus();
  }

  setGuardsInfo(info: GuardInfo, index: number) {
    this.guardsInfo[index] = info;
  }

  getGuardInfo(index: number) {
    return this.guardsInfo[index];
  }
}

export {
  mockGuardDetection,
  handler,
  config,
  guardsPrivateKeys,
  guardsPublicKeys,
};
