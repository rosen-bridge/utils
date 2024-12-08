export const BITCOIN_CHAIN = 'bitcoin';
export const CARDANO_CHAIN = 'cardano';
export const ERGO_CHAIN = 'ergo';
export const ETHEREUM_CHAIN = 'ethereum';
export const BINANCE_CHAIN = 'binance';
export const DOGE_CHAIN = 'doge';

export const DOGE_NETWORK = {
  // Doge network parameters
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'doge',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e,
};
