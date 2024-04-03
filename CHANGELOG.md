# @rosen-bridge/tss

## 2.0.0

### Major Changes

- add chainCode as required to TssSigner class config
- change TssSigner to abstract with abstract `getSignExtraData` and `handleSuccessfulSign` functions

### Minor Changes

- add EcdsaSigner class that implements TssSigner with ECDSA signer
- add EddsaSigner class that implements TssSigner with EdDSA signer
- add `crypto` and `chainCode` parameters to sign request
- add `crypto` parameter to update threshold request
