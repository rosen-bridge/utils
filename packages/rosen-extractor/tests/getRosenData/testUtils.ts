import { RosenTokens } from '@rosen-bridge/tokens';
import {
  BITCOIN_RUNES_CHAIN,
  ETHEREUM_CHAIN,
} from './../../lib/getRosenData/const';
import {
  BITCOIN_CHAIN,
  BITCOIN_NATIVE_TOKEN,
  CARDANO_CHAIN,
  CARDANO_NATIVE_TOKEN,
  ERGO_CHAIN,
  ERGO_NATIVE_TOKEN,
  DOGE_CHAIN,
  DOGE_NATIVE_TOKEN,
} from '../../lib/getRosenData/const';
import * as wasm from '@emurgo/cardano-serialization-lib-nodejs';
import { BlockFrostTransaction } from '../../lib/getRosenData/cardano/types';

function toHex(bytes: Uint8Array) {
  return Buffer.from(bytes).toString('hex');
}

function fromHex(hex: string) {
  return Buffer.from(hex, 'hex');
}

export default class TestUtils {
  static tokens: RosenTokens = [
    {
      [ERGO_CHAIN]: {
        tokenId: ERGO_NATIVE_TOKEN,
        name: ERGO_NATIVE_TOKEN,
        decimals: 9,
        type: 'tokenType',
        residency: 'tokenResidency',
        extra: {},
      },
      [CARDANO_CHAIN]: {
        tokenId:
          'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
        extra: {
          policyId: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          assetName: '7369676d61',
        },
        name: 'Wrapped Erg',
        decimals: 9,
        type: 'tokenType',
        residency: 'tokenResidency',
      },
    },
    {
      [ERGO_CHAIN]: {
        tokenId:
          'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
        name: 'wrapped ada',
        decimals: 6,
        type: 'tokenType',
        residency: 'tokenResidency',
        extra: {},
      },
      [CARDANO_CHAIN]: {
        tokenId: CARDANO_NATIVE_TOKEN,
        extra: {
          policyId: '',
          assetName: '414441',
        },
        name: 'ada',
        decimals: 6,
        type: 'tokenType',
        residency: 'tokenResidency',
      },
      [ETHEREUM_CHAIN]: {
        tokenId: '0xb416c8a6d7ec94706a9ae2c26c11d320519482b1',
        name: 'rsAda',
        decimals: 6,
        type: 'ERC-20',
        residency: 'wrapped',
        extra: {},
      },
    },
    {
      [ERGO_CHAIN]: {
        tokenId:
          'b37bfa41c2d9e61b4e478ddfc459a03d25b658a2305ffb428fbc47ad6abbeeaa',
        name: 'RstHoskyVTest2',
        decimals: 0,
        type: 'EIP-004',
        residency: 'wrapped',
        extra: {},
      },
      [CARDANO_CHAIN]: {
        tokenId:
          'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235.484f534b59',
        extra: {
          policyId: 'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235',
          assetName: '484f534b59',
        },
        name: 'WrappedHosky',
        decimals: 0,
        type: 'CIP26',
        residency: 'native',
      },
    },
    {
      [ETHEREUM_CHAIN]: {
        tokenId: '0x4606d11ff65b17d29e8c5e4085f9a868a8e5e4f2',
        name: 'rsBTC',
        decimals: 8,
        type: 'ERC-20',
        residency: 'wrapped',
        extra: {},
      },
      [BITCOIN_CHAIN]: {
        tokenId: BITCOIN_NATIVE_TOKEN,
        name: 'BTC',
        decimals: 8,
        type: 'native',
        residency: 'native',
        extra: {},
      },
      [ERGO_CHAIN]: {
        tokenId:
          'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
        name: 'rsBTC',
        decimals: 8,
        type: 'EIP-004',
        residency: 'wrapped',
        extra: {},
      },
    },
    {
      [ETHEREUM_CHAIN]: {
        tokenId: 'eth',
        name: 'ETH',
        decimals: 18,
        type: 'native',
        residency: 'native',
        extra: {},
      },
      [ERGO_CHAIN]: {
        tokenId:
          'dcbda15f1361f5eeba41748193e059fce34f0c57499e9afe733ea0fd59cf63f48',
        name: 'rsETH',
        decimals: 18,
        type: 'EIP-004',
        residency: 'wrapped',
        extra: {},
      },
    },
    {
      [DOGE_CHAIN]: {
        tokenId: DOGE_NATIVE_TOKEN,
        name: DOGE_NATIVE_TOKEN,
        decimals: 8,
        type: 'tokenType',
        residency: 'tokenResidency',
        extra: {},
      },
      [ERGO_CHAIN]: {
        tokenId:
          'dcbda15f1361f5eeba416dd63e059fce34f0c57499e9afe733ea0fd59cf63f48',
        name: 'rsDOGE',
        decimals: 8,
        type: 'EIP-004',
        residency: 'wrapped',
        extra: {},
      },
    },
    {
      [BITCOIN_RUNES_CHAIN]: {
        tokenId: '880887:3052',
        name: 'ROSEN•POC•RUNE',
        decimals: 3,
        type: 'Runes',
        residency: 'native',
        extra: {},
      },
      [ERGO_CHAIN]: {
        tokenId:
          '8b35fd2dabc9bdf2b69aa9c25eb7e7818297add61b2dd3b5ab039439e100e487',
        name: 'rpnRPOCR',
        decimals: 3,
        type: 'EIP-004',
        residency: 'wrapped',
        extra: {},
      },
      [CARDANO_CHAIN]: {
        tokenId:
          'e8699f09f993366363e2354a7520770ded59d23f5aeaad6717e73614.72706e52504f4352',
        name: 'rpnRPOCR',
        decimals: 3,
        type: 'CIP26',
        residency: 'wrapped',
        extra: {
          policyId: 'e8699f09f993366363e2354a7520770ded59d23f5aeaad6717e73614',
          assetName: '72706e52504f4352',
        },
      },
    },
  ];

  static noNativeTokens: RosenTokens = [
    {
      [ERGO_CHAIN]: {
        tokenId:
          'f6a69529b12a7e2326acffee8383e0c44408f87a872886fadf410fe8498006d3',
        name: 'Wrapped token',
        decimals: 0,
        type: 'tokenType',
        residency: 'tokenResidency',
        extra: {},
      },
      [CARDANO_CHAIN]: {
        tokenId:
          'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
        extra: {
          policyId: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          assetName: '7369676d61',
        },
        name: 'Cardano token',
        decimals: 0,
        type: 'tokenType',
        residency: 'tokenResidency',
      },
    },
  ];

  static multiDecimals: RosenTokens = [
    {
      [ERGO_CHAIN]: {
        tokenId: ERGO_NATIVE_TOKEN,
        name: ERGO_NATIVE_TOKEN,
        decimals: 9,
        type: 'tokenType',
        residency: 'tokenResidency',
        extra: {},
      },
      [CARDANO_CHAIN]: {
        tokenId:
          'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2.7369676d61',
        extra: {
          policyId: 'ace7bcc2ce705679149746620de3a84660ce57573df54b5a096e39a2',
          assetName: '7369676d61',
        },
        name: 'Wrapped Erg',
        decimals: 3,
        type: 'tokenType',
        residency: 'tokenResidency',
      },
    },
  ];

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
  static buildUnsignedTxHexFromBlockFrostTx = (data: BlockFrostTransaction) => {
    // Build inputs
    const inputs = wasm.TransactionInputs.new();
    for (const inp of data.utxos.inputs) {
      const txHash = wasm.TransactionHash.from_bytes(fromHex(inp.tx_hash));
      const input = wasm.TransactionInput.new(txHash, inp.output_index ?? 0);
      inputs.add(input);
    }

    // Build outputs
    const outputs = wasm.TransactionOutputs.new();
    for (const out of data.utxos.outputs) {
      const addr = wasm.Address.from_bech32(out.address);
      const value = TestUtils.parseAmountListToValue(out.amount);
      const txOut = wasm.TransactionOutput.new(addr, value);
      outputs.add(txOut);
    }

    // Build metadata if available
    let aux: wasm.AuxiliaryData | null = wasm.AuxiliaryData.new();
    if (Array.isArray(data.metadataCbor) && data.metadataCbor.length > 0) {
      const general = wasm.GeneralTransactionMetadata.new();
      for (const mdItem of data.metadataCbor) {
        const metadatum = wasm.encode_json_str_to_metadatum(
          `[${mdItem.metadata}]`,
          wasm.MetadataJsonSchema.NoConversions,
        );
        general.insert(wasm.BigNum.from_str(mdItem.label), metadatum);
        mdItem.cbor_metadata = toHex(metadatum.to_bytes());
      }
      aux.set_metadata(general);
    }

    // Fee & TTL
    const fee = wasm.BigNum.from_str('170000');
    const ttl = 3600;

    // Build TransactionBody
    const txBody = wasm.TransactionBody.new(inputs, outputs, fee, ttl);

    // Build unsigned transaction
    const witnessSet = wasm.TransactionWitnessSet.new();
    const tx = aux
      ? wasm.Transaction.new(txBody, witnessSet, aux)
      : wasm.Transaction.new(txBody, witnessSet);

    tx.auxiliary_data;

    return toHex(tx.to_bytes());
  };
}
