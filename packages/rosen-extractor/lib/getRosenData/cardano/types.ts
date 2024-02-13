import { components } from '@blockfrost/openapi';

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

interface BlockFrostTransaction {
  utxos: components['schemas']['tx_content_utxo'];
  metadata: components['schemas']['tx_content_metadata'];
}

type BlockFrostOutputBox =
  components['schemas']['tx_content_utxo']['outputs'][0];

type GraphQLBlockTxsQuery = {
  __typename?: 'Query';
  blocks: Array<{
    __typename?: 'Block';
    transactions: Array<{
      __typename?: 'Transaction';
      hash: any;
      fee: any;
      inputs: Array<{
        __typename?: 'TransactionInput';
        sourceTxIndex: number;
        sourceTxHash: any;
        value: any;
        tokens: Array<{
          __typename?: 'Token';
          quantity: string;
          asset: {
            __typename?: 'Asset';
            assetName?: any | null;
            policyId: any;
          };
        } | null>;
      }>;
      outputs: Array<{
        __typename?: 'TransactionOutput';
        address: string;
        value: any;
        tokens: Array<{
          __typename?: 'Token';
          quantity: string;
          asset: {
            __typename?: 'Asset';
            assetName?: any | null;
            policyId: any;
          };
        }>;
      } | null>;
      metadata?: Array<{
        __typename?: 'TransactionMetadata';
        key: string;
        value: any;
      } | null> | null;
    } | null>;
  } | null>;
};
type GraphQLTransaction = NonNullable<
  NonNullable<GraphQLBlockTxsQuery['blocks'][0]>['transactions'][0]
>;
type GraphQLTxOutput = NonNullable<GraphQLTransaction['outputs'][0]>;

export {
  Utxo,
  KoiosTransaction,
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
  BlockFrostTransaction,
  BlockFrostOutputBox,
  GraphQLTransaction,
  GraphQLTxOutput,
};
