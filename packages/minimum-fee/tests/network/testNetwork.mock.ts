import { AbstractMinimumFeeNetwork } from '../../lib/network/abstract';

class TestNetwork extends AbstractMinimumFeeNetwork {
  notImplemented = () => {
    throw Error('Not implemented');
  };

  getBoxesByTokenId = this.notImplemented;
}

export default TestNetwork;
