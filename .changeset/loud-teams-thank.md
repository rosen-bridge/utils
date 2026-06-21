---
'@rosen-bridge/winston-logger': minor
---

Add json formatting, serviceName, and symlink support for file transport:

- Add `format` option to `FileTransportOptions` supporting both `'plain'` and `'json'` outputs (recommended for Grafana Alloy tailing)
- Add `serviceName` option to `FileTransportOptions` to inject service name label into log entries
- Add `createSymlink` and `symlinkName` options to `FileTransportOptions`
- Add a console warning to the `loki` transport for notifying users about potential log-loss risks
