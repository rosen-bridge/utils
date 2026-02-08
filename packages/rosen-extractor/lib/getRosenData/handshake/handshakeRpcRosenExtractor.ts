import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import { HANDSHAKE_CHAIN, HANDSHAKE_NATIVE_TOKEN } from '../const';
import {
  HandshakeRpcTransaction,
  HandshakeRpcTxOutput,
  HandshakeRosenData,
} from './types';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { parseRosenData, addressToHash, extractDataFromOutputs } from './utils';

export class HandshakeRpcRosenExtractor extends AbstractRosenDataExtractor<HandshakeRpcTransaction> {
  readonly chain = HANDSHAKE_CHAIN;
  protected lockAddressHash: string;

  constructor(lockAddress: string, tokens: TokenMap, logger?: AbstractLogger) {
    super(lockAddress, tokens, logger);
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

      // Convert RPC outputs to standard format (HNS to dollarydoos)
      const convertedOutputs = outputs.map((output) => ({
        value: Math.round(output.value * 1000000), // HNS to dollarydoos
        address: output.address,
      }));

      // Extract data from outputs using utility function
      const { validLock, lockOutput, reconstructedData } =
        extractDataFromOutputs(convertedOutputs, this.lockAddressHash);

      if (!validLock || !lockOutput) {
        this.logger.debug(baseError + `: Lock output not found`);
        return undefined;
      }

      if (!reconstructedData) {
        this.logger.debug(baseError + `: No data chunks found`);
        return undefined;
      }

      // Parse the reconstructed data
      let rosenData: HandshakeRosenData | undefined;
      try {
        rosenData = parseRosenData(reconstructedData);
        this.logger.debug(
          `Successfully extracted Rosen data for ${rosenData.toChain}`,
        );
      } catch (e) {
        this.logger.debug(baseError + `: Failed to parse extracted data: ${e}`);
        return undefined;
      }

      // Find asset transformation (need to use original RPC output for value)
      const lockOutputRpc = outputs.find(
        (o) => o.address?.hash === this.lockAddressHash,
      ) as HandshakeRpcTxOutput;
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
        rawData: reconstructedData,
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
    // try to build transformation using locked HNS
    const wrappedHns = this.tokens.search(HANDSHAKE_CHAIN, {
      tokenId: HANDSHAKE_NATIVE_TOKEN,
    });

    if (wrappedHns.length > 0 && Object.hasOwn(wrappedHns[0], toChain)) {
      // Safe conversion to dollarydoos
      const dollarydoos = Math.round(box.value * 1000000).toString();
      return {
        from: HANDSHAKE_NATIVE_TOKEN,
        to: this.tokens.getID(wrappedHns[0], toChain),
        amount: dollarydoos,
      };
    }
    return undefined;
  };
}
