---
'@rosen-bridge/tokens': major
---

Change TokenMap structure

- remove tokens from constructor and add separate functions to set configs (one from token map config boxes and one from config json directly)
- change IdKey to `tokenId` for all chains
- remove getIdKey function
- flat the metadata fields into token interface
