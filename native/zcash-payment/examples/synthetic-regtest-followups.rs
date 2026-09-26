//! Makes offline-only verify/finalize requests for the synthetic prepare fixture.
use secp256k1::{Message, Secp256k1, SecretKey};
use serde_json::{Value, json};
use std::{env, fs};

fn main() {
    let args: Vec<_> = env::args().collect();
    assert_eq!(
        args.len(),
        4,
        "usage: EXE PREPARE.json RESPONSE.json OUTPUT_DIR"
    );
    let prepare: Value = serde_json::from_slice(&fs::read(&args[1]).unwrap()).unwrap();
    let response: Value = serde_json::from_slice(&fs::read(&args[2]).unwrap()).unwrap();
    let intent = prepare.get("intent").unwrap();
    let pczt = response.get("pczt_hex").unwrap();
    let fingerprint = response.get("fingerprint_sha256").unwrap();
    let digest: [u8; 32] = hex::decode(response["sighash_all"].as_str().unwrap())
        .unwrap()
        .try_into()
        .unwrap();
    let key = SecretKey::from_slice(&[1u8; 32]).unwrap();
    let signature = Secp256k1::new()
        .sign_ecdsa(&Message::from_digest(digest), &key)
        .serialize_compact();
    fs::write(
        format!("{}/synthetic-regtest-verify.json", args[3]),
        serde_json::to_vec(&json!({
            "operation": "orchard_verify", "intent": intent, "pczt_hex": pczt
        }))
        .unwrap(),
    )
    .unwrap();
    fs::write(
        format!("{}/synthetic-regtest-finalize.json", args[3]),
        serde_json::to_vec(&json!({
            "operation": "orchard_finalize", "intent": intent, "pczt_hex": pczt,
            "fingerprint_sha256": fingerprint,
            "compact_signature_hex": hex::encode(signature)
        }))
        .unwrap(),
    )
    .unwrap();
}
