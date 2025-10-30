import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import { HANDSHAKE_CHAIN, HANDSHAKE_NATIVE_TOKEN } from '../const';
import {
  HandshakeRpcTransaction,
  HandshakeRpcTxOutput,
  OpReturnData,
} from './types';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { parseRosenData, addressToHash } from './utils';

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
  extractRawData = (
    transaction: HandshakeRpcTransaction,
  ): RosenData | undefined => {
    const baseError = `No rosen data found for tx [${transaction.txid}]`;
    try {
      const outputs = transaction.vout;
      if (outputs.length < 2) {
        this.logger.debug(baseError + `: Insufficient number of boxes`);
        return undefined;
      }

      let validData = false; // an OP_RETURN box with valid data is found
      let validLock = false; // a lock box is found with available asset transformation

      // parse rosen data from OP_RETURN box
      // In Handshake, OP_RETURN data is stored in outputs with address.version === 31
      let opReturnData: OpReturnData | undefined;
      let rawData: string = '';
      for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i];
        // Check if this is an OP_RETURN output (version 31 in Handshake)
        if (output.address.version !== 31) continue;

        try {
          // In Handshake, the data is stored in address.hash (hex encoded)
          opReturnData = parseRosenData(output.address.hash);
          rawData = output.address.hash;
          validData = true;
          break;
        } catch (e) {
          this.logger.debug(
            `Failed to extract data from OP_RETURN box [${transaction.txid}.${i}]: ${e}`,
          );
        }
      }
      if (!validData || !opReturnData) {
        this.logger.debug(
          baseError + `: No OP_RETURN box with valid data is found`,
        );
        return undefined;
      }

      // find target chain token id
      let assetTransformation: TokenTransformation | undefined;
      for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i];
        // Skip OP_RETURN outputs (version 31) as they can never be lock addresses
        if (output.address.version === 31) continue;

        // Check if the output address hash matches the lock address hash
        if (output.address.hash !== this.lockAddressHash) continue; // utxo address is not lock address

        assetTransformation = this.getAssetTransformation(
          output,
          opReturnData.toChain,
        );
        if (assetTransformation) {
          validLock = true;
          break;
        }
      }
      if (!validLock || !assetTransformation) {
        this.logger.debug(
          baseError + `: Failed to find rosen asset transformation`,
        );
        return undefined;
      }

      const fromAddress = `box:${transaction.vin[0].txid}.${transaction.vin[0].vout}`;
      return {
        toChain: opReturnData.toChain,
        toAddress: opReturnData.toAddress,
        bridgeFee: opReturnData.bridgeFee,
        networkFee: opReturnData.networkFee,
        fromAddress: fromAddress,
        sourceChainTokenId: assetTransformation.from,
        amount: assetTransformation.amount,
        targetChainTokenId: assetTransformation.to,
        sourceTxId: transaction.txid,
        rawData,
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
      const parts = box.value.toString().split('.');
      const part1 = ((parts[1] ?? '') + '0'.repeat(6)).substring(0, 6);
      return {
        from: HANDSHAKE_NATIVE_TOKEN,
        to: this.tokens.getID(wrappedHns[0], toChain),
        amount: (parts[0] === '0' ? '' : parts[0]) + part1,
      };
    } else {
      return undefined;
    }
  };
}
