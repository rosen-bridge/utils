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
  policyId: string;
  assetName: string;
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

type CardanoMetadata = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedJson: Record<string, string | Record<string, any>>;
  cbor: string;
};

interface CardanoTx {
  id: string;
  inputs: CardanoTxInput[];
  outputs: CardanoBoxCandidate[];
  fee: bigint;
  metadata?: CardanoMetadata;
}

interface BlockFrostTransaction {
  utxos: components['schemas']['tx_content_utxo'];
  metadataCbor: components['schemas']['tx_content_metadata_cbor'];
}

type BlockFrostOutputBox =
  components['schemas']['tx_content_utxo']['outputs'][0];

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
};
