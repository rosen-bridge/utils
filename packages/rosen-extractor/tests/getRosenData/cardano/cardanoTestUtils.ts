import * as wasm from '@emurgo/cardano-serialization-lib-nodejs';

export type RawMetaDataType =
  | null
  | string
  | number
  | RawMetaDataType[]
  | { [key: string]: null | string | number | RawMetaDataType };

interface TxData {
  id: string;
  inputs: { txId: string; index: number }[];
  outputs: {
    address: string;
    value: bigint;
    assets: {
      policyId: string;
      assetName: string;
      quantity: string;
    }[];
  }[];
  fee: bigint;
  metadata: {
    parsedJson: {
      [k: string]: {
        to: string;
        bridgeFee: string;
        toAddress: string;
        networkFee: string;
        fromAddress: string[];
      };
    };
    cbor: string;
  };
}

function toHex(bytes: Uint8Array) {
  return Buffer.from(bytes).toString('hex');
}

function fromHex(hex: string) {
  return Buffer.from(hex, 'hex');
}

export class CardanoTestUtility {
  /**
   * Convert a list of amounts (ADA + tokens) to wasm.Value
   */
  static parseAmountListToValue = (
    amountList: { unit: string; quantity: string }[],
  ) => {
    let adaBig = wasm.BigNum.from_str('0');
    let multiasset: wasm.MultiAsset | null = null;

    for (const { unit, quantity } of amountList) {
      if (unit === 'lovelace') {
        adaBig = wasm.BigNum.from_str(quantity);
      } else {
        let unitHex = unit.startsWith('f') ? unit.slice(1) : unit;
        const POLICY_ID_LEN = 56;
        const policyIdHex = unitHex.slice(0, POLICY_ID_LEN);
        const assetNameHex = unitHex.slice(POLICY_ID_LEN);

        if (policyIdHex.length === 0) {
          throw new Error('invalid unit (no policyId): ' + unit);
        }

        if (!multiasset) multiasset = wasm.MultiAsset.new();

        const scriptHash = wasm.ScriptHash.from_bytes(fromHex(policyIdHex));
        let assets = multiasset.get(scriptHash);
        if (!assets) assets = wasm.Assets.new();

        const assetNameBytes = assetNameHex
          ? fromHex(assetNameHex)
          : Buffer.from([]);
        const assetName = wasm.AssetName.new(assetNameBytes);
        assets.insert(assetName, wasm.BigNum.from_str(quantity));
        multiasset.insert(scriptHash, assets);
      }
    }

    const value = wasm.Value.new(adaBig);
    if (multiasset) value.set_multiasset(multiasset);
    return value;
  };

  /**
   * Build an unsigned transaction CBOR hex from BlockFrost structured data
   */
  static buildCborHexFromMetadataJson = (metadataList: RawMetaDataType[]) => {
    // Build metadata if available
    let aux: wasm.AuxiliaryData | null = wasm.AuxiliaryData.new();
    if (Array.isArray(metadataList) && metadataList.length > 0) {
      const general = wasm.GeneralTransactionMetadata.new();
      for (const metadata of metadataList) {
        const metadatum = wasm.encode_json_str_to_metadatum(
          JSON.stringify(metadata),
          wasm.MetadataJsonSchema.NoConversions,
        );
        general.insert(wasm.BigNum.from_str('0'), metadatum);
      }
      aux.set_metadata(general);
    }

    return toHex(aux.to_bytes());
  };

  /**
   * Calculate transaction CBOR and adding to the input txData
   *
   * @param txData
   * @returns txData
   */
  static AddCborHexToTxJson = (txData: TxData, metadataKey = '0'): TxData => {
    const inputs = wasm.TransactionInputs.new();
    for (const input of txData.inputs) {
      const txHash = wasm.TransactionHash.from_bytes(
        Buffer.from(input.txId, 'hex'),
      );
      const txInput = wasm.TransactionInput.new(txHash, input.index);
      inputs.add(txInput);
    }

    const outputs = wasm.TransactionOutputs.new();
    for (const out of txData.outputs) {
      const address = wasm.Address.from_bech32(out.address);
      const value = wasm.Value.new(wasm.BigNum.from_str(out.value.toString()));

      if (out.assets.length > 0) {
        const multiAsset = wasm.MultiAsset.new();
        for (const asset of out.assets) {
          const policy = wasm.ScriptHash.from_bytes(
            Buffer.from(asset.policyId, 'hex'),
          );
          const assets = wasm.Assets.new();
          assets.insert(
            wasm.AssetName.new(Buffer.from(asset.assetName, 'hex')),
            wasm.BigNum.from_str(asset.quantity.toString()),
          );
          multiAsset.insert(policy, assets);
        }
        value.set_multiasset(multiAsset);
      }

      const txOutput = wasm.TransactionOutput.new(address, value);
      outputs.add(txOutput);
    }

    const auxData = wasm.AuxiliaryData.from_hex(
      CardanoTestUtility.buildCborHexFromMetadataJson([
        txData.metadata.parsedJson[metadataKey],
      ]),
    );

    const body = wasm.TransactionBody.new(
      inputs,
      outputs,
      wasm.BigNum.from_str(txData.fee.toString()),
    );
    body.set_auxiliary_data_hash(wasm.hash_auxiliary_data(auxData));

    const witnesses = wasm.TransactionWitnessSet.new();
    const transaction = wasm.Transaction.new(body, witnesses, auxData);

    const cborHex = Buffer.from(transaction.to_bytes()).toString('hex');

    txData.metadata.cbor = cborHex;
    return txData;
  };
}
