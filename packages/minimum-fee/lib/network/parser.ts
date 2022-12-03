import JSONBigInt from 'json-bigint';
import { ErgoBox } from 'ergo-lib-wasm-nodejs';

export const JsonBI = JSONBigInt({
  useNativeBigInt: true,
  alwaysParseAsBig: true,
});

export const checkConfigRegisters = (box: ErgoBox): boolean => {
  const chains = box.register_value(4)?.to_coll_coll_byte();
  const heights: Array<Array<string>> | undefined = box
    .register_value(5)
    ?.to_js();
  const bridgeFees: Array<Array<string>> | undefined = box
    .register_value(6)
    ?.to_js();
  const networkFees: Array<Array<string>> | undefined = box
    .register_value(7)
    ?.to_js();
  const rsnRatios: Array<Array<string>> | undefined = box
    .register_value(8)
    ?.to_js();

  return (
    chains !== undefined &&
    heights !== undefined &&
    bridgeFees !== undefined &&
    networkFees !== undefined &&
    rsnRatios !== undefined
  );
};
