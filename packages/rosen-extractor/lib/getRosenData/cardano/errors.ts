/**
 * Will stop the scanner when there is no tx cbor available
 * in ogmios client response
 */
export class OmgiosNoCborError extends Error {
  message =
    'Unable to extract raw-data, enable the transaction cbor in ogmios client (--include-cbor or --include-transaction-cbor) or turn off the raw data extraction';
}
