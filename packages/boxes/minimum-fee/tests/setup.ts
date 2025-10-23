vi.mock('@rosen-clients/ergo-explorer', () => {
  return {
    default: vi.fn(() => ({
      v1: {
        getApiV1BoxesUnspentBytokenidP1: vi.fn(),
      },
    })),
  };
});

vi.mock('@rosen-clients/ergo-node', () => {
  return {
    default: vi.fn(() => ({
      getBoxesByTokenIdUnspent: vi.fn(),
    })),
  };
});
