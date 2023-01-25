interface CardanoRosenData {
  toChain: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
  fromAddress: string;
}

interface MetaData {
  [key: string]: JSON;
}

type ListObject = Array<MetadataObject>;
type NativeValue = string | undefined;
interface JsonObject {
  [key: string]: MetadataObject;
}
type MetadataObject = JsonObject | ListObject | NativeValue;

export {
  CardanoRosenData,
  MetaData,
  MetadataObject,
  JsonObject,
  ListObject,
  NativeValue,
};
