import { Constant } from 'ergo-lib-wasm-nodejs';

import { Fee } from '@rosen-bridge/minimum-fee';

/**
 * converts fee config to register values
 * @param fees
 * @returns
 */
export const feeToRegisterValues = (fees: Array<Fee>) => {
  //  extract chains
  const chains: Array<string> = [];
  fees.forEach((fee) => {
    Object.keys(fee.heights).forEach((feeChain) => {
      if (!chains.includes(feeChain)) chains.push(feeChain);
    });
  });
  chains.sort();
  //  extract configs
  const heights: Array<Array<number>> = [];
  const bridgeFees: Array<Array<string>> = [];
  const networkFees: Array<Array<string>> = [];
  const rsnRatios: Array<Array<Array<string>>> = [];
  const feeRatios: Array<Array<string>> = [];
  fees.forEach((fee) => {
    const heightsConfigs: Array<number> = [];
    const bridgeFeesConfigs: Array<string> = [];
    const networkFeesConfigs: Array<string> = [];
    const rsnRatiosConfigs: Array<Array<string>> = [];
    const feeRatiosConfigs: Array<string> = [];

    chains.forEach((chain) => {
      if (Object.hasOwn(fee.heights, chain))
        heightsConfigs.push(fee.heights[chain]);
      else heightsConfigs.push(-1);

      if (Object.hasOwn(fee.configs, chain)) {
        bridgeFeesConfigs.push(fee.configs[chain].bridgeFee.toString());
        networkFeesConfigs.push(fee.configs[chain].networkFee.toString());
        rsnRatiosConfigs.push([
          fee.configs[chain].rsnRatio.toString(),
          fee.configs[chain].rsnRatioDivisor.toString(),
        ]);
        feeRatiosConfigs.push(fee.configs[chain].feeRatio.toString());
      } else {
        bridgeFeesConfigs.push('-1');
        networkFeesConfigs.push('-1');
        rsnRatiosConfigs.push(['-1', '-1']);
        feeRatiosConfigs.push('-1');
      }
    });

    heights.push(heightsConfigs);
    bridgeFees.push(bridgeFeesConfigs);
    networkFees.push(networkFeesConfigs);
    rsnRatios.push(rsnRatiosConfigs);
    feeRatios.push(feeRatiosConfigs);
  });

  return {
    R4: Constant.from_coll_coll_byte(chains.map((chain) => Buffer.from(chain))),
    R5: Constant.from_js(heights),
    R6: Constant.from_js(bridgeFees),
    R7: Constant.from_js(networkFees),
    R8: Constant.from_js(rsnRatios),
    R9: Constant.from_js(feeRatios),
  };
};

/**
 * decodes register values to its original type
 * @param register
 * @returns
 */
export const decodeRegister = (register: string) => {
  return Constant.decode_from_base16(register).to_js();
};
