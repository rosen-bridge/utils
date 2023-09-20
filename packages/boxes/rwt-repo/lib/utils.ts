import JSONbigint from 'json-bigint';

export const jsonBigInt = JSONbigint({
  useNativeBigInt: true,
  alwaysParseAsBig: true,
});
