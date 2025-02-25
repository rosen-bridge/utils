---
'@rosen-bridge/tokens': major
---

Revamp TokenMap structure

- The extra fields per chain are now under `extra` field and only value of 'string', 'number' or 'boolean' is supported
- The `search` function is improved and only accepts a partial object of `RosenChainToken` instead of any object
