import { AbstractLogger } from '@rosen-bridge/logger-interface';

/**
 * MessageType type for communication between nodes in the network
 */
type MessageType =
  | 'register'
  | 'approval'
  | 'heartbeat'
  | 'sign'
  | 'requestToSign';

/**
 * Message interface for communication between nodes in the network
 * @param type - type of message (sign, register, approval)
 * @param payload - message payload
 * @param signature - message signature
 * @param receiver - public key of receiver
 * @param pk - public key of sender
 */
type Message = {
  type: MessageType;
  payload: string;
  signature: string;
  receiver: string;
  pk: string;
};

/**
 * MessageHandler interface for communication between nodes in the network
 * @param sign - sign a message
 * @param encrypt - encrypt a message
 * @param checkSign - check message sign
 * @param decrypt - decrypt a message
 * @param send - send message
 */
interface MessageHandler {
  sign(message: string): string;
  encrypt(message: string): string;
  checkSign(
    message: string,
    signature: string,
    signerPublicKey: string
  ): boolean;
  decrypt(message: string): string;
  send(message: Message): Promise<void>;
}

interface TSSHandler {
  sign(message: string): Promise<string>;
  verify(
    message: string,
    signature: string,
    publicKey: string
  ): Promise<boolean>;
}

interface RegisterPayload {
  nonce: string;
  timestamp: number;
}

interface ApprovePayload {
  nonce?: string;
  receivedNonce: string;
  timestamp: number;
}
interface HeartbeatPayload {
  nonce: string;
  timestamp: number;
}

interface RequestToSignPayload {
  timestamp: number;
  payload: string;
  activeGuards: ActiveGuard[];
}

interface SignPayload {
  timestamp: number;
  payload: string;
  sign: string;
}

/**
 * GuardInfo interface for communication between nodes in the network
 * @param peerId - peer id of the guard
 * @param nonce - nonce of the guard
 * @param lastUpdate - last update of the guard (timestamp)
 * @param publicKey - public key of the guard
 * @param recognitionPromises - recognition promises of the guard
 **/
interface GuardInfo {
  peerId: string;
  nonce: string;
  lastUpdate: number; // timestamp
  publicKey: string;
  recognitionPromises: ((value: boolean) => unknown)[];
}

interface GuardDetectionConfig {
  logger?: AbstractLogger;
  guardsPublicKey: string[];
  publicKey: string;
  privateKey: string;
  index: number;
  minimumSigner: number;
  guardsRegisterTimeout?: number;
  guardsHeartbeatTimeout?: number;
  messageValidDuration?: number;
  guardsUpdateStatusInterval?: number;
}

interface ActiveGuard {
  peerId: string;
  publicKey: string;
}

export {
  MessageHandler,
  Message,
  RegisterPayload,
  ApprovePayload,
  HeartbeatPayload,
  RequestToSignPayload,
  SignPayload,
  TSSHandler,
  GuardInfo,
  GuardDetectionConfig,
  MessageType,
  ActiveGuard,
};
