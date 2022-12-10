interface Asset {
  tokenId: string;
  amount: bigint;
}

interface Box {
  boxId: string;
  ergoTree: string;
  address: string;
  value: bigint;
  assets: Asset[];
  additionalRegisters: { [key: string]: ExplorerRegister };
}

interface Boxes {
  items: Box[];
  total: number;
}

interface ExplorerRegister {
  serializedValue: string;
  sigmaType: string;
  renderedValue: string;
}

interface ConfigBox {
  chains: Uint8Array[] | undefined;
  heights: string[][] | undefined;
  bridgeFees: string[][] | undefined;
  networkFees: string[][] | undefined;
  rsnRatios: string[][] | undefined;
}

export { Asset, Box, Boxes, ConfigBox };
