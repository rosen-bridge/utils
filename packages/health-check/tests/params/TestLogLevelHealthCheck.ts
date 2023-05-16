import { LogLevelHealthCheck } from '../../lib/params/LogLevelHealthCheck';

class TestLogLevelHealthCheck extends LogLevelHealthCheck {
  getTimes = () => this.times;

  getLastMessage = () => this.lastMessage;
}

export default TestLogLevelHealthCheck;
