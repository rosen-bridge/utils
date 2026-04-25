import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';

import { parseRosenData } from '../../utils';
import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import { RosenData, TokenTransformation } from '../abstract/types';
import { HANDSHAKE_CHAIN, HANDSHAKE_NATIVE_TOKEN } from '../const';
import {
  HandshakeRpcTransaction,
  HandshakeRpcTxOutput,
  HandshakeRosenData,
} from './types';
import {
  addressToHash,
  convertHnsToDollarydoos,
  extractDataFromOutputs,
  hasNoneCovenant,
} from './utils';

export class HandshakeRpcRosenExtractor extends AbstractRosenDataExtractor<HandshakeRpcTransaction> {
  readonly chain = HANDSHAKE_CHAIN;
  protected lockAddressHash: string;

  constructor(
    lockAddress: string,
    tokens: TokenMap,
    logger?: AbstractLogger,
    storeRawData = true,
  ) {
    super(lockAddress, tokens, logger, storeRawData);
    this.lockAddressHash = addressToHash(lockAddress);
  }

  /**
   * extracts RosenData from given lock transaction in Rpc format
   * @param transaction the lock transaction in Rpc format
   */
  extractData = (
    transaction: HandshakeRpcTransaction,
  ): RosenData | undefined => {
    const baseError = `No rosen data found for tx [${transaction.txid}]`;
    try {
      const outputs = transaction.vout;
      if (outputs.length < 2) {
        this.logger.debug(baseError + `: Insufficient number of outputs`);
        return undefined;
      }

      // Find lock output first (need to use original RPC output for value)
      const lockOutputIndex = outputs.findIndex(
        (output) =>
          output.address?.hash === this.lockAddressHash &&
          hasNoneCovenant(output),
      );

      if (lockOutputIndex === -1) {
        this.logger.debug(baseError + `: Lock output not found`);
        return undefined;
      }

      const lockOutputRpc = outputs[lockOutputIndex];

      // Convert RPC outputs to standard format (HNS to dollarydoos)
      const convertedOutputs = outputs.map((output) => {
        const dollarydoos = convertHnsToDollarydoos(output.value);
        return {
          value: BigInt(dollarydoos),
          address: output.address,
        };
      });

      // Extract data from outputs using utility function
      const reconstructedData = extractDataFromOutputs(
        convertedOutputs,
        lockOutputIndex,
      );

      if (!reconstructedData) {
        this.logger.debug(baseError + `: No data chunks found`);
        return undefined;
      }

      // Parse the reconstructed data
      let rosenData: HandshakeRosenData | undefined;
      try {
        rosenData = parseRosenData(reconstructedData);
        this.logger.debug(
          `Successfully extracted Rosen data for [${rosenData.toChain}]`,
        );
      } catch (e) {
        this.logger.debug(baseError + `: Failed to parse extracted data: ${e}`);
        return undefined;
      }

      // Find asset transformation using the lock output
      const assetTransformation = this.getAssetTransformation(
        lockOutputRpc,
        rosenData.toChain,
      );

      if (!assetTransformation) {
        this.logger.debug(
          baseError + `: Failed to find rosen asset transformation`,
        );
        return undefined;
      }

      const fromAddress = `box:${transaction.vin[0].txid}.${transaction.vin[0].vout}`;
      return {
        toChain: rosenData.toChain,
        toAddress: rosenData.toAddress,
        bridgeFee: rosenData.bridgeFee,
        networkFee: rosenData.networkFee,
        fromAddress: fromAddress,
        sourceChainTokenId: assetTransformation.from,
        amount: assetTransformation.amount,
        targetChainTokenId: assetTransformation.to,
        sourceTxId: transaction.txid,
        rawData: outputs
          .map((output) => `${output.address?.hash}:${output.value}`)
          .join(','),
      };
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Handshake rosen data from Rpc: ${e}`,
      );
      if (e instanceof Error && e.stack) {
        this.logger.debug(e.stack);
      }
    }
    return undefined;
  };

  /**
   * extracts and builds token transformation from UTXO and tokenMap
   * @param box transaction output
   * @param toChain event target chain
   */
  getAssetTransformation = (
    box: HandshakeRpcTxOutput,
    toChain: string,
  ): TokenTransformation | undefined => {
    const wrappedHns = this.tokens.search(HANDSHAKE_CHAIN, {
      tokenId: HANDSHAKE_NATIVE_TOKEN,
    });

    if (wrappedHns.length > 0 && Object.hasOwn(wrappedHns[0], toChain)) {
      // Convert HNS to dollarydoos
      const dollarydoos = convertHnsToDollarydoos(box.value);

      return {
        from: HANDSHAKE_NATIVE_TOKEN,
        to: this.tokens.getID(wrappedHns[0], toChain),
        amount: dollarydoos,
      };
    }
    return undefined;
  };
}
