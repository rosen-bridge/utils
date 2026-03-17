import { AbstractMinimumFeeNetwork } from '@rosen-bridge/minimum-fee';

class TestNetwork extends AbstractMinimumFeeNetwork {
  notImplemented = () => {
    throw Error('Not implemented');
  };

  getBoxesByTokenId = this.notImplemented;
}

export default TestNetwork;
