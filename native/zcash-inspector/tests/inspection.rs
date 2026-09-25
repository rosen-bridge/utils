use std::io::Cursor;

use rosen_zcash_native_inspector::{
    MAX_RAW_TRANSACTION_BYTES, MAX_REQUEST_BYTES, Request, inspect, run_json, run_reader,
};
use zcash_primitives::transaction::{
    Authorized as TransactionAuthorized, Transaction, TransactionData, TxVersion,
};
use zcash_protocol::consensus::BranchId;

// Public regtest transactions retained by checkpoint 003. Their source block hashes are recorded
// in README.md.
const COINBASE: &str = "050000800a27a726b4d0d6c2000000006a000000010000000000000000000000000000000000000000000000000000000000000000ffffffff29016a26f09fa6933a20eea707f5b8cbd51d277103f885e447ee8476299109a11aab039cdbfeb2778b1fffffffff01600c41250000000017a9140c0bcca02f3cba01a5d7423ac3903d40586399eb87000000";
const DEPOSIT: &str = "050000800a27a726b4d0d6c2000000003101000001e2a1cda70db00af3239d8737dede92134268edd4eb3da835406ffad6c9c9fff5010000006b483045022100a4f063e9a11ba1c680649258799a3305cc216d65f38397d3b4fa79f1116b48f3022079e79de7f8bf984bc1a4d96f7315e9b6a197e42d3482497febb8460fb520223601210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798feffffff0300e1f505000000001976a914f09ce3435526cda8bffce9b09336d23ec5cc7c9188acf0385419000000001976a914751e76e8199196d454941c45d1b3a323f1433bd688ac0000000000000000356a3300000000000000138800000000000008982103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339000000";
const WITHDRAWAL: &str = "050000800a27a726b4d0d6c20000000032010000017b72f760ea2af88318f9e265df12d280045183e97e3268f22f56bec73fbff9aa000000006b483045022100bfcd82f3ac4cf31915e3f5475d11878c28f926d5b9ec6ff7014059b253f35ad902207527fb7ddf5d3dd56050485d9bc08c9456b0c30bf67498d4b04569e597297e66012103e81665f832096960c4b205b466afd55560598163d9bf16431b6cf8ceacbb1feefeffffff02005a6202000000001976a914751e76e8199196d454941c45d1b3a323f1433bd688acf05f9303000000001976a914f09ce3435526cda8bffce9b09336d23ec5cc7c9188ac000000";
// Exact independent-review pair: only the V4 Sapling valueBalance changes from 0 to 1.
const REVIEW_V4_ZERO: &str = "0400008085202f8901e2a1cda70db00af3239d8737dede92134268edd4eb3da835406ffad6c9c9fff5010000006b483045022100a4f063e9a11ba1c680649258799a3305cc216d65f38397d3b4fa79f1116b48f3022079e79de7f8bf984bc1a4d96f7315e9b6a197e42d3482497febb8460fb520223601210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798feffffff0300e1f505000000001976a914f09ce3435526cda8bffce9b09336d23ec5cc7c9188acf0385419000000001976a914751e76e8199196d454941c45d1b3a323f1433bd688ac0000000000000000356a3300000000000000138800000000000008982103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a933900000000310100000000000000000000000000";
const REVIEW_V4_ONE: &str = "0400008085202f8901e2a1cda70db00af3239d8737dede92134268edd4eb3da835406ffad6c9c9fff5010000006b483045022100a4f063e9a11ba1c680649258799a3305cc216d65f38397d3b4fa79f1116b48f3022079e79de7f8bf984bc1a4d96f7315e9b6a197e42d3482497febb8460fb520223601210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798feffffff0300e1f505000000001976a914f09ce3435526cda8bffce9b09336d23ec5cc7c9188acf0385419000000001976a914751e76e8199196d454941c45d1b3a323f1433bd688ac0000000000000000356a3300000000000000138800000000000008982103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a933900000000310100000100000000000000000000";
// ZIP-244 vector 7 from zcash/zcash-test-vectors@78321beacb0e0477e33cd002b56585a107c2708c.
const SHIELDED_V5: &str = "050000800a27a726b4d0d6c2d2c4e624a6fc330003af247e36483f13b204422237fc6ab3eba02fc4142b4297ebb5683db8d24319706ad26aaf001c53b740f34543a6b3e9f5bb7d5c49e8c37f614921254f3212394c797d1cee7899b7b4b65b59b734075253ac6351515170b7317414438cd80bd0f9a67c9b9e552f013c115a954f35e0616c68d43163d334dac3827033e5ad06006a51ac53658f5935c6033aee46294f0a0400055353636365d1526a0e794e0500080000ac52006a5263b552e8d573000600036a6a5101010f7549a9cf5fd4f61d157b6e2c80dc60478aee453ee140ad397f27e42e414fa217d649616bbe739b13d14df03ff27671489be0b4bebaafa7d1e639d5b3e994e0903af6e17081d5818e88b14e4f601b8c063e3f4387ffa2322a5181909f0980008f0b8964de3d0500ccca4d22b983c328c8d95f433a08e9064c0c46d33d65047e43a91066af420f0ad689de7f8e6a5c62a777d175002a137de85b8888929198117aa5d61993e1dcf75876dca609f9d28471f997fa11f99d423f9cf1734be8a5ff997d451eb3cf4b3dfdd9d4545c35b2b5a7dc17a836b12b43befc0be0a1bd369772338078b4ff7d8e2d979a3441e1c8f5afe47b1e7da56cf00602d01b110c05cf48fda3e6cce32a044000f45c6d1e696d245cbd312bdc3a3a21c992d0ebc8cc8fa6306d7e130a2ba42018fe596949fd82267bcc59dd4626efc3ea7438d05c91b0f8e092550d2d39a07652d7eda089440669beca2ca2e380073cb3888f182968f22fde97b78f10764bc6a22b4f035200d681d427e2dc1d004cbfbb54bb44b1a7fc85e38cba4f83a801eb3d1e40c4745e85ab7e2d4794cf224a8d440d7944a86c84e02063ff7ade0a5d946e3b4830651e38332039df49b531040bc68f6b4e52eeec9e543b2955c1440600";

fn request(raw: impl Into<String>, branch: &str) -> Request {
    Request {
        raw_tx_hex: Some(raw.into()),
        expected_branch_id: Some(branch.to_owned()),
    }
}

fn rebuild(version: TxVersion, duplicate_input: bool) -> String {
    let mut cursor = Cursor::new(hex::decode(DEPOSIT).unwrap());
    let tx = Transaction::read(&mut cursor, BranchId::Nu5).unwrap();
    let mut bundle = tx.transparent_bundle().cloned().unwrap();
    if duplicate_input {
        bundle.vin.push(bundle.vin[0].clone());
    }
    let data = TransactionData::<TransactionAuthorized>::from_parts(
        version,
        BranchId::Nu5,
        tx.lock_time(),
        tx.expiry_height(),
        Some(bundle),
        None,
        None,
        None,
    );
    let tx = data.freeze().unwrap();
    let mut encoded = Vec::new();
    tx.write(&mut encoded).unwrap();
    hex::encode(encoded)
}

#[test]
fn real_deposit_preserves_canonical_identity_values_and_scripts() {
    let result = inspect(request(DEPOSIT, "c2d6d0b4")).unwrap();
    assert_eq!(
        result.txid,
        "aaf9bf3fc7be562ff268327ee983510480d212df65e2f91883f82aea60f7727b"
    );
    assert_eq!(result.version.kind, "v5");
    assert_eq!(result.version.version_group_id, "26a7270a");
    assert_eq!(result.consensus_branch_id, "c2d6d0b4");
    assert_eq!(result.branch_source, "embedded");
    assert!(!result.coinbase);
    assert!(result.fully_transparent);
    assert_eq!(result.transparent.inputs.len(), 1);
    assert_eq!(result.transparent.outputs.len(), 3);
    assert_eq!(
        result
            .transparent
            .outputs
            .iter()
            .map(|output| output.value_zat)
            .collect::<Vec<_>>(),
        [100_000_000, 424_950_000, 0]
    );
    assert_eq!(
        result
            .transparent
            .outputs
            .iter()
            .map(|output| output.script_kind.as_str())
            .collect::<Vec<_>>(),
        ["pubkeyhash", "pubkeyhash", "nulldata"]
    );
    assert_eq!(
        result.transparent.outputs[0].script_pubkey_hex,
        "76a914f09ce3435526cda8bffce9b09336d23ec5cc7c9188ac"
    );
}

#[test]
fn real_coinbase_is_classified_without_rejection() {
    let result = inspect(request(COINBASE, "c2d6d0b4")).unwrap();
    assert_eq!(
        result.txid,
        "d0bc10d7dee3e7d3db34e11bbb530e81eb4f29e76186758e040a4fddc55a653b"
    );
    assert!(result.coinbase);
    assert_eq!(result.transparent.inputs[0].prevout_txid, "0".repeat(64));
    assert_eq!(result.transparent.inputs[0].prevout_index, u32::MAX);
    assert_eq!(result.transparent.outputs[0].value_zat, 625_020_000);
    assert_eq!(result.transparent.outputs[0].script_kind, "scripthash");
}

#[test]
fn real_withdrawal_preserves_prevout_and_output_amounts() {
    let result = inspect(request(WITHDRAWAL, "c2d6d0b4")).unwrap();
    assert_eq!(
        result.txid,
        "1e7e3e6c9c6f17660c1ac51c769b324fe4e9b53ff21231ff311d5c589a15bc72"
    );
    assert_eq!(
        result.transparent.inputs[0].prevout_txid,
        "aaf9bf3fc7be562ff268327ee983510480d212df65e2f91883f82aea60f7727b"
    );
    assert_eq!(result.transparent.inputs[0].prevout_index, 0);
    assert_eq!(
        result
            .transparent
            .outputs
            .iter()
            .map(|output| output.value_zat)
            .collect::<Vec<_>>(),
        [40_000_000, 59_990_000]
    );
}

#[test]
fn official_shielded_transaction_is_reported_not_rejected() {
    let result = inspect(request(SHIELDED_V5, "c2d6d0b4")).unwrap();
    assert!(result.shielded.present);
    assert!(!result.fully_transparent);
    assert_eq!(result.transparent.inputs.len(), 3);
    assert_eq!(result.transparent.outputs.len(), 3);
    assert_eq!(
        (
            result.shielded.sprout_joinsplits,
            result.shielded.sapling_spends,
            result.shielded.sapling_outputs,
            result.shielded.orchard_actions,
            result.shielded.ironwood_actions,
        ),
        (0, 1, 0, 0, 0)
    );
}

#[test]
fn transparent_v4_uses_explicit_branch_context() {
    assert_eq!(rebuild(TxVersion::V4, false), REVIEW_V4_ZERO);
    let result = inspect(request(REVIEW_V4_ZERO, "c2d6d0b4")).unwrap();
    assert_eq!(result.version.kind, "v4");
    assert_eq!(result.branch_source, "context");
    assert_eq!(result.consensus_branch_id, "c2d6d0b4");
    assert_eq!(result.transparent.outputs.len(), 3);
}

#[test]
fn v4_discarded_nonzero_sapling_balance_is_noncanonical() {
    assert_eq!(
        inspect(request(REVIEW_V4_ONE, "c2d6d0b4"))
            .unwrap_err()
            .code,
        "noncanonical_transaction"
    );
}

#[test]
fn parser_valid_multi_input_transaction_is_preserved() {
    let result = inspect(request(rebuild(TxVersion::V5, true), "c2d6d0b4")).unwrap();
    assert_eq!(result.transparent.inputs.len(), 2);
    assert_eq!(result.transparent.outputs.len(), 3);
}

#[test]
fn missing_raw_transaction_is_distinct() {
    let error = inspect(Request {
        raw_tx_hex: None,
        expected_branch_id: Some("c2d6d0b4".to_owned()),
    })
    .unwrap_err();
    assert_eq!(error.code, "missing_raw_transaction");
}

#[test]
fn missing_branch_context_is_distinct() {
    let error = inspect(Request {
        raw_tx_hex: Some(DEPOSIT.to_owned()),
        expected_branch_id: None,
    })
    .unwrap_err();
    assert_eq!(error.code, "missing_branch_id");
}

#[test]
fn noncanonical_hex_is_rejected_before_parsing() {
    assert_eq!(
        inspect(request(DEPOSIT.to_uppercase(), "c2d6d0b4"))
            .unwrap_err()
            .code,
        "noncanonical_hex"
    );
    assert_eq!(
        inspect(request(&DEPOSIT[..DEPOSIT.len() - 1], "c2d6d0b4"))
            .unwrap_err()
            .code,
        "noncanonical_hex"
    );
}

#[test]
fn unknown_format_is_distinct_from_malformed_transaction() {
    let unknown = format!("070000800a27a726{}", &DEPOSIT[16..]);
    assert_eq!(
        inspect(request(unknown, "c2d6d0b4")).unwrap_err().code,
        "unsupported_transaction_format"
    );
}

#[test]
fn unknown_branch_is_distinct() {
    assert_eq!(
        inspect(request(DEPOSIT, "deadbeef")).unwrap_err().code,
        "unsupported_branch_id"
    );
}

#[test]
fn embedded_branch_mismatch_is_rejected() {
    assert_eq!(
        inspect(request(DEPOSIT, "c8e71055")).unwrap_err().code,
        "branch_mismatch"
    );
}

#[test]
fn trailing_bytes_are_rejected() {
    assert_eq!(
        inspect(request(format!("{DEPOSIT}00"), "c2d6d0b4"))
            .unwrap_err()
            .code,
        "trailing_bytes"
    );
}

#[test]
fn truncation_is_distinct() {
    assert_eq!(
        inspect(request(&DEPOSIT[..DEPOSIT.len() - 2], "c2d6d0b4"))
            .unwrap_err()
            .code,
        "truncated_transaction"
    );
}

#[test]
fn invalid_encoded_amount_is_malformed() {
    let malformed = DEPOSIT.replacen("00e1f50500000000", "ffffffffffffffff", 1);
    assert_eq!(
        inspect(request(malformed, "c2d6d0b4")).unwrap_err().code,
        "malformed_transaction"
    );
}

#[test]
fn raw_and_stdin_limits_fail_before_unbounded_processing() {
    let oversized_raw = "00".repeat(MAX_RAW_TRANSACTION_BYTES + 1);
    assert_eq!(
        inspect(request(oversized_raw, "c2d6d0b4"))
            .unwrap_err()
            .code,
        "raw_transaction_too_large"
    );
    let oversized_stdin = vec![b' '; MAX_REQUEST_BYTES + 1];
    assert_eq!(
        run_reader(Cursor::new(oversized_stdin)).unwrap_err().code,
        "input_too_large"
    );
}

#[test]
fn json_schema_rejects_unknown_fields() {
    assert_eq!(
        run_json(r#"{"raw_tx_hex":"00","expected_branch_id":"c2d6d0b4","extra":true}"#)
            .unwrap_err()
            .code,
        "invalid_json"
    );
}

#[test]
fn json_schema_requires_an_object_without_positional_aliases() {
    let object = serde_json::json!({
        "raw_tx_hex": DEPOSIT,
        "expected_branch_id": "c2d6d0b4",
    });
    assert_eq!(
        run_json(&object.to_string()).unwrap().txid,
        "aaf9bf3fc7be562ff268327ee983510480d212df65e2f91883f82aea60f7727b"
    );
    let positional = serde_json::json!([DEPOSIT, "c2d6d0b4"]);
    for input in [
        positional.to_string(),
        "null".into(),
        "1".into(),
        "true".into(),
        "\"text\"".into(),
    ] {
        assert_eq!(run_json(&input).unwrap_err().code, "invalid_json");
    }
}

#[test]
fn json_schema_rejects_duplicate_fields_without_collapsing_them() {
    for input in [
        format!(
            r#"{{"raw_tx_hex":"{DEPOSIT}","raw_tx_hex":"{DEPOSIT}","expected_branch_id":"c2d6d0b4"}}"#
        ),
        format!(
            r#"{{"raw_tx_hex":"{DEPOSIT}","expected_branch_id":"c2d6d0b4","expected_branch_id":"c2d6d0b4"}}"#
        ),
    ] {
        assert_eq!(run_json(&input).unwrap_err().code, "invalid_json");
    }
}
