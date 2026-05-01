declare module 'fastify/lib/logger-pino.js' {
  export const serializers: {
    [key: string]: (v: unknown) => unknown;
  };
}
