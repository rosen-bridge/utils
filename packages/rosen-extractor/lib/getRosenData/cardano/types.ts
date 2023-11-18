interface PaymentAddr {
  bech32: string;
  cred: string;
}

interface Asset {
  policy_id: string;
  asset_name: string;
  quantity: string;
}

interface Utxo {
  payment_addr: PaymentAddr;
  stake_addr?: string | null;
  tx_hash: string;
  tx_index: number;
  value: string;
  asset_list: Array<Asset>;
}

interface Metadata {
  [key: string]: Record<string, unknown>;
}

interface KoiosTransaction {
  tx_hash: string;
  block_hash: string;
  inputs: Array<Utxo>;
  outputs: Array<Utxo>;
  metadata?: Metadata;
}

interface TokenTransformation {
  from: string;
  to: string;
  amount: string;
}

interface CardanoRosenData {
  toChain: string;
  toAddress: string;
  bridgeFee: string;
  networkFee: string;
  fromAddress: string;
}

interface CardanoMetadataRosenData {
  to: string;
  networkFee: string;
  bridgeFee: string;
  toAddress: string;
  fromAddress: string[];
}

type ListObject = Array<MetadataObject>;
type NativeValue = string | undefined;
interface JsonObject {
  [key: string]: MetadataObject;
}
type MetadataObject = JsonObject | ListObject | NativeValue;

interface CardanoAsset {
  policy_id: string;
  asset_name: string;
  quantity: string;
}

interface CardanoUtxo {
  txId: string;
  index: number;
  value: bigint;
  assets: Array<CardanoAsset>;
}

interface CardanoBoxCandidate {
  address: string;
  value: bigint;
  assets: Array<CardanoAsset>;
}

type CardanoMetadata = Record<string, string | Record<string, any>>;

interface CardanoTx {
  id: string;
  inputs: CardanoUtxo[];
  outputs: CardanoBoxCandidate[];
  fee: bigint;
  metadata?: CardanoMetadata;
}

export {
  Utxo,
  KoiosTransaction,
  TokenTransformation,
  CardanoRosenData,
  CardanoMetadataRosenData,
  Metadata,
  MetadataObject,
  JsonObject,
  ListObject,
  NativeValue,
  CardanoMetadata,
  CardanoTx,
  CardanoBoxCandidate,
};
