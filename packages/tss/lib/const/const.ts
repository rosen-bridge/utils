import { MessageType } from '../types/detection';
//
const approveMessage: MessageType = 'approval';
const heartbeatMessage: MessageType = 'heartbeat';
const registerMessage: MessageType = 'register';

const guardActiveTimeoutDefault = 2 * 60; // 2 minutes
const guardHeartbeatTimeoutDefault = 1 * 60; // 1 minutes
const guardMessageValidTimeoutDefault = 1 * 60; // 1 minute

export {
  approveMessage,
  heartbeatMessage,
  registerMessage,
  guardActiveTimeoutDefault,
  guardHeartbeatTimeoutDefault,
  guardMessageValidTimeoutDefault,
};
