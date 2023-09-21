import JsonBigIntFactory from 'json-bigint';

const JsonBigInt = JsonBigIntFactory({
  alwaysParseAsBig: true,
  useNativeBigInt: true,
});

export default JsonBigInt;
