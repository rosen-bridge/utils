vi.mock('@rosen-clients/ergo-explorer', () => {
  return {
    __esModule: true,
    default: vi.fn(() => ({
      v1: {
        getApiV1BoxesUnspentBytokenidP1: vi.fn(),
      },
    })),
  };
});

vi.mock('@rosen-clients/ergo-node', () => {
  return {
    __esModule: true,
    default: vi.fn(() => ({
      getBoxesByTokenIdUnspent: vi.fn(),
    })),
  };
});
