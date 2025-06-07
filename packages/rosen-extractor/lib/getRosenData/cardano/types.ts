import { components } from '@blockfrost/openapi';
import { TransactionJSON } from '@emurgo/cardano-serialization-lib-nodejs';

interface KoiosCborTx {
  tx_hash: string;
  block_hash: string;
  block_height: number;
  epoch_no: number;
  absolute_slot: number;
  tx_timestamp: number;
  cbor: string;
}

type KoiosTransaction = KoiosCborTx & TransactionJSON;

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

interface CardanoAsset {
  policy_id: string;
  asset_name: string;
  quantity: string;
}

interface CardanoTxInput {
  txId: string;
  index: number;
}

interface CardanoBoxCandidate {
  address: string;
  value: bigint;
  assets: Array<CardanoAsset>;
}

type CardanoMetadata = Record<string, string | Record<string, any>>;

interface CardanoTx {
  id: string;
  inputs: CardanoTxInput[];
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
  KoiosTransaction as KoiosCborTransaction,
  KoiosTransaction,
  CardanoRosenData,
  CardanoMetadataRosenData,
  CardanoMetadata,
  CardanoTx,
  CardanoTxInput,
  CardanoBoxCandidate,
  BlockFrostTransaction,
  BlockFrostOutputBox,
  GraphQLTransaction,
  GraphQLTxOutput,
};
