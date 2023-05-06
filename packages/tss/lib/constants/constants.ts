import { MessageType } from '../types';

const approveType: MessageType = 'approval';
const heartbeatType: MessageType = 'heartbeat';
const registerType: MessageType = 'register';
const signType: MessageType = 'sign';
const requestToSignType: MessageType = 'requestToSign';
const registerTimeout = 2 * 60 * 1000; // 2 minutes
const heartbeatTimeout = 1 * 60 * 1000; // 1 minutes
const messageValidDuration = 1 * 60 * 1000; // 1 minute
const guardsUpdateStatusInterval = 3 * 1000; // 3 seconds
const approveMessageTimeout = 5 * 1000; // 5 seconds
const minimumTimeRemainedToSign = 10 * 1000; // 10 seconds
const oneMinute = 60 * 1000;
export {
  approveType,
  heartbeatType,
  registerType,
  signType,
  requestToSignType,
  approveMessageTimeout,
  registerTimeout,
  heartbeatTimeout,
  messageValidDuration,
  guardsUpdateStatusInterval,
  oneMinute,
  minimumTimeRemainedToSign,
};
