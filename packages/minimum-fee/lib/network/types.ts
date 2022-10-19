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

export { Asset, Box, Boxes };
