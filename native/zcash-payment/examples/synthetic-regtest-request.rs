//! Emits an offline-only Orchard prepare request with disposable synthetic inputs.
use orchard::keys::{FullViewingKey, Scope, SpendingKey};
use zcash_address::unified::{self, Encoding};
use zcash_protocol::consensus::NetworkType;

fn main() {
    let recipient_key = SpendingKey::from_bytes([0u8; 32]).unwrap();
    let receiver = FullViewingKey::from(&recipient_key).address_at(0u32, Scope::External);
    let ua = unified::Address::try_from_items(vec![
        unified::Receiver::Orchard(receiver.to_raw_address_bytes()),
        unified::Receiver::P2pkh([7u8; 20]),
    ])
    .unwrap()
    .encode(&NetworkType::Regtest);
    println!(
        "{}",
        serde_json::json!({
            "operation": "orchard_prepare",
            "intent": {
                "network": "regtest_nu6_2_at_two",
                "expected_branch_id": "5437f330",
                "target_height": 3,
                "expiry_height": 23,
                "input": {
                    "prevout_txid": "02".repeat(32),
                    "prevout_index": 0,
                    "sequence": 4294967295u32,
                    "amount_zat": 100000,
                    "script_pubkey_hex": "76a91479b000887626b294a914501a4cd226b58b23598388ac"
                },
                "compressed_pubkey_hex": "031b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f",
                "recipient_ua": ua,
                "payout_zat": 80000,
                "change_zat": 5000
            }
        })
    );
}
