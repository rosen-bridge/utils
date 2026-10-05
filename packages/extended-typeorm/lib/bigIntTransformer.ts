import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';

class BigIntValueTransformer implements ValueTransformer {
  from(value: string): bigint {
    if (value === undefined || value === null) return value;
    return BigInt(value);
  }

  to(value: bigint): string {
    if (value === undefined || value === null) return value;
    return value.toString();
  }
}

export { BigIntValueTransformer };
