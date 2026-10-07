---
'@rosen-bridge/service-manager': patch
---

Clear the pending action promise when a service start, stop or assemble throws, so the action can be retried instead of returning the old rejected promise forever.
