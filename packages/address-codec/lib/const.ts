export const BITCOIN_CHAIN = 'bitcoin';
export const RUNES_CHAIN = 'bitcoin-runes';
export const CARDANO_CHAIN = 'cardano';
export const ERGO_CHAIN = 'ergo';
export const ETHEREUM_CHAIN = 'ethereum';
export const BINANCE_CHAIN = 'binance';
export const DOGE_CHAIN = 'doge';
export const HANDSHAKE_CHAIN = 'handshake';

export const DOGE_NETWORK = {
  // Doge network parameters
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'dc',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e,
};

export const HANDSHAKE_NETWORK = {
  // Handshake network parameters
  messagePrefix: '\x18Handshake Signed Message:\n',
  bech32: 'hs',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0,
  scriptHash: 0,
  wif: 0,
};
