import { ErgoBoxWrapper, Fee } from './types';

/**
 * extracts Fee config from box registers
 * @param box
 * @param decodeRegister function to decode register value from string to its original type
 */
export const extractFeeFromBox = (
  box: ErgoBoxWrapper,
  decodeRegister: (register: string) => unknown,
): Array<Fee> => {
  const R4 = box.additionalRegisters?.R4;
  const R5 = box.additionalRegisters?.R5;
  const R6 = box.additionalRegisters?.R6;
  const R7 = box.additionalRegisters?.R7;
  const R8 = box.additionalRegisters?.R8;
  const R9 = box.additionalRegisters?.R9;

  if (!R4 || !R5 || !R6 || !R7 || !R8 || !R9)
    throw Error(
      `Incomplete register data for minimum-fee config box [${box.boxId}]`,
    );

  const fees: Array<Fee> = [];
  const chains = (decodeRegister(R4) as Array<Uint8Array>).map((chainStr) =>
    Buffer.from(chainStr).toString('utf8'),
  );
  const heights = decodeRegister(R5) as Array<Array<number>>;
  const bridgeFees = decodeRegister(R6) as Array<Array<string>>;
  const networkFees = decodeRegister(R7) as Array<Array<string>>;
  const rsnRatios = decodeRegister(R8) as Array<Array<Array<string>>>;
  const feeRatios = decodeRegister(R9) as Array<Array<string>>;

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
