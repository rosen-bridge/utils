---
'@rosen-bridge/tokens': major
---

Change TokenMap structure

- remove tokens from constructor and add separate functions to set configs (one from token map config boxes and one from config json directly)
- IdKey for all chains is now `tokenId`
- metadata fields are flatten into token interface
