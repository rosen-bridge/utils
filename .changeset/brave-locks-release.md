---
'@rosen-bridge/tokens': patch
'@rosen-bridge/extended-typeorm': patch
---

fix(tokens): release the update semaphore when a TokenMap config update fails, so later updates no longer wait forever
fix(extended-typeorm): release the CustomQueryRunner mutex when starting a transaction or rolling one back fails
