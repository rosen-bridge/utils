# Native Zcash finalizer release assets

The Zcash payment finalizer is distributed as a separate GitHub Release asset.
The release workflow does not publish an npm package or automatically make a
release public.

## Release contract

Tags named `rosen-zcash-native-finalizer-v<semver>` build one binary for each
supported target and upload these assets to a draft GitHub Release:

- `rosen-zcash-native-finalizer-x86_64-pc-windows-msvc.exe`;
- `rosen-zcash-native-finalizer-x86_64-unknown-linux-gnu`;
- `manifest.json`, binding the tag build to the exact commit, Cargo inputs,
  Rust toolchain identity, target, size, and SHA-256 of each binary;
- `SHA256SUMS`, containing the binary hashes in the manifest.

The workflow uses Rust 1.98.1 and `cargo build --locked --release`. Build jobs
have read-only repository permission and no persisted checkout credentials.
Only the release job can create GitHub Release assets, and it creates a draft.

## Verification and publication

Before publishing the draft, a maintainer should verify each downloaded binary
against both `SHA256SUMS` and the matching `manifest.json` entry, including its
target, byte count, source commit, and Cargo input hashes. Publishing the draft
is a separate maintainer action; the workflow never publishes it automatically.
