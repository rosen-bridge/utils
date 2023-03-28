/**
 * MessageType type for communication between nodes in the network
 */
type MessageType = 'register' | 'approve' | 'heartbeat';

/**
 * Message interface for communication between nodes in the network
 * @param type - type of message (sign, register, approve)
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
  checkSign(message: string): boolean;
  decrypt(message: string): string;
  send(message: Message): void;
}

interface RegisterPayload {
  nounce: string;
}

interface ApprovePayload {
  nounce?: string;
  receivedNounce: string;
}
interface HeartbeatPayload {
  nounce: string;
}

export {
  MessageHandler,
  Message,
  RegisterPayload,
  ApprovePayload,
  HeartbeatPayload,
};
