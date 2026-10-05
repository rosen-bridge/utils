---
'@rosen-bridge/rosen-extractor': minor
---

Add bounded native Bitcoin Cash RPC deposit extraction using raw transaction bytes, exact satoshi amounts, CashAddr treasury scripts, and explicit CashToken exclusion. Bitcoin Cash destination decoding remains unavailable until Rosen assigns its protocol index.

Expose BCH classes and transaction types through the dedicated `@rosen-bridge/rosen-extractor/dist/bitcoinCash.js` entry. The existing package root retains its legacy exports without importing BCH transaction cryptography. BCH consumers must import the dedicated entry explicitly.
