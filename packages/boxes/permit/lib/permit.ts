import * as ergoLib from 'ergo-lib-wasm-nodejs';
import { hexToUint8Array } from './utils';

/**
 * creates a permit box using passed arguments
 *
 * @param {number} height
 * @param {string} wid
 * @param {string} rwt
 * @param {bigint} rwtCount
 * @param {bigint} value
 * @param {string} permitAddress
 * @return {ergoLib.ErgoBoxCandidate}
 */
export const createPermit = (
  height: number,
  wid: string,
  rwt: string,
  rwtCount: bigint,
  value: bigint,
  permitAddress: string
): ergoLib.ErgoBoxCandidate => {
  const boxBuilder = new ergoLib.ErgoBoxCandidateBuilder(
    ergoLib.BoxValue.from_i64(ergoLib.I64.from_str(value.toString())),
    ergoLib.Contract.pay_to_address(ergoLib.Address.from_base58(permitAddress)),
    height
  );

  if (rwtCount <= 0) {
    throw new Error(`rwtCount should be greater than zero.`);
  }
  boxBuilder.add_token(
    ergoLib.TokenId.from_str(rwt),
    ergoLib.TokenAmount.from_i64(ergoLib.I64.from_str(rwtCount.toString()))
  );

  boxBuilder.set_register_value(
    4,
    ergoLib.Constant.from_coll_coll_byte([hexToUint8Array(wid)])
  );
  boxBuilder.set_register_value(
    5,
    ergoLib.Constant.from_coll_coll_byte([Buffer.from('00', 'hex')])
  );

  return boxBuilder.build();
};
