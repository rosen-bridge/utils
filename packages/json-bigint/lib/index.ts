import JsonBigIntFactory from 'json-bigint';

const JsonBigInt = JsonBigIntFactory({
  alwaysParseAsBig: true,
  useNativeBigInt: true,
});

export { JsonBigIntFactory };
export default JsonBigInt;
