import { HealthCheck } from '../lib';

export class TestHealthCheck extends HealthCheck {
  getParams = () => {
    return [...this.params];
  };
}
