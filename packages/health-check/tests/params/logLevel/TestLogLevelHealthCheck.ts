import { LogLevelHealthCheck } from '../../../lib/params/logLevel/LogLevelHealthCheck';

class TestLogLevelHealthCheck extends LogLevelHealthCheck {
  getTimes = () => this.times;

  getLastMessage = () => this.lastMessage;
}

export default TestLogLevelHealthCheck;
