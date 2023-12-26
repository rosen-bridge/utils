import {
  CardanoGraphQLScannerHealthCheck,
  CardanoBlockFrostScannerHealthCheck,
} from '../../../lib';

export class TestCardanoGraphQLScannerHealthCheck extends CardanoGraphQLScannerHealthCheck {
  getClient = () => this.client;
}

export class TestCardanoBlockFrostScannerHealthCheck extends CardanoBlockFrostScannerHealthCheck {
  getClient = () => this.client;
}
