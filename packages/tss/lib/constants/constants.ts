import { MessageType } from '../types/types';

const approveType: MessageType = 'approve';
const heartbeatType: MessageType = 'heartbeat';
const registerType: MessageType = 'register';

const registerTimeout = 2 * 60 * 1000; // 2 minutes
const heartbeatTimeout = 1 * 60 * 1000; // 1 minutes
const timestampTolerance = 1 * 60 * 1000; // 1 minute
const guardsUpdateStatusInterval = 3 * 1000; // 3 seconds

export {
  approveType,
  heartbeatType,
  registerType,
  registerTimeout,
  heartbeatTimeout,
  timestampTolerance,
  guardsUpdateStatusInterval,
};
