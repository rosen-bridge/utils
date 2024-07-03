import { Constant, ErgoBox } from 'ergo-lib-wasm-nodejs';
import { Fee } from './types';

/**
 * extracts Fee config from box registers
 * @param box
 */
export const extractFeeFromBox = (box: ErgoBox): Array<Fee> => {
  const R4 = box.register_value(4);
  const R5 = box.register_value(5);
  const R6 = box.register_value(6);
  const R7 = box.register_value(7);
  const R8 = box.register_value(8);
  const R9 = box.register_value(9);

  if (!R4 || !R5 || !R6 || !R7 || !R8 || !R9)
    throw Error(
      `Incomplete register data for minimum-fee config box [${box
        .box_id()
        .to_str()}]`
    );

  const fees: Array<Fee> = [];
  const chains = R4.to_coll_coll_byte().map((element) =>
    Buffer.from(element).toString()
  );
  const heights = R5.to_js() as Array<Array<number>>;
  const bridgeFees = R6.to_js() as Array<Array<string>>;
  const networkFees = R7.to_js() as Array<Array<string>>;
  const rsnRatios = R8.to_js() as Array<Array<Array<string>>>;
  const feeRatios = R9.to_js() as Array<Array<string>>;

  for (let feeIdx = 0; feeIdx < heights.length; feeIdx++) {
    const fee: Fee = {
      heights: {},
      configs: {},
    };
    for (let chainIdx = 0; chainIdx < chains.length; chainIdx++) {
      const chain = chains[chainIdx];

      if (heights[feeIdx][chainIdx] === -1) continue;
      fee.heights[chain] = heights[feeIdx][chainIdx];

      if (bridgeFees[feeIdx][chainIdx] === '-1') continue;
      fee.configs[chain] = {
        bridgeFee: BigInt(bridgeFees[feeIdx][chainIdx]),
        networkFee: BigInt(networkFees[feeIdx][chainIdx]),
        rsnRatio: BigInt(rsnRatios[feeIdx][chainIdx][0]),
        rsnRatioDivisor: BigInt(rsnRatios[feeIdx][chainIdx][1]),
        feeRatio: BigInt(feeRatios[feeIdx][chainIdx]),
      };
    }
    fees.push(fee);
  }

  return fees;
};

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
