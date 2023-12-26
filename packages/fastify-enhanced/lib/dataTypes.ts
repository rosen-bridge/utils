import zod from 'zod';

export const types = {
  ...(zod as Omit<typeof zod, 'bigint'>),
  bigint: () =>
    zod.union([zod.number(), zod.bigint()]).pipe(zod.coerce.bigint()),
};
