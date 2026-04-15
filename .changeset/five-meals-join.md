---
'@rosen-bridge/service-manager': major
---

Add `Assemble` feature: Services now should have a new function, `assemble`, which performs a one-time action, such as initializing the service hyper parameters and classes. Additionally, the `ServiceManager` handles it, requesting to assemble services in the `raw` status (the new status representing the non-assembled services) when they are going to be started or required.
