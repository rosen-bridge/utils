---
'@rosen-bridge/tss': major
---

- add chainCode as required to TssSigner class config
- change TssSigner to abstract with abstract `getSignExtraData` and `handleSuccessfulSign` functions
