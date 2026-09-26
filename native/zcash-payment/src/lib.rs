use std::{cell::Cell, io::Cursor, ops::Deref};

use ripemd::Ripemd160;
use secp256k1::{PublicKey, ecdsa::Signature};
use serde::{Deserialize, Serialize};
use sha2::{Digest as _, Sha256};
use zcash_primitives::transaction::{
    Authorization, Authorized as TransactionAuthorized, Transaction, TransactionData, TxVersion,
    fees::{
        FeeRule as _,
        transparent::{InputSize, OutputView},
        zip317,
    },
    sighash::{SignableInput, signature_hash},
    txid::TxIdDigester,
};
use zcash_protocol::{
    consensus::{BlockHeight, BranchId, MAIN_NETWORK},
    value::Zatoshis,
};
use zcash_script::{
    interpreter::{CallbackTransactionSignatureChecker, Flags},
    pv, script,
    script::Evaluable,
    signature::{HashType as ScriptHashType, SignedOutputs},
};
use zcash_transparent::{
    address::Script,
    bundle::{self as transparent, Bundle, OutPoint, TxIn, TxOut},
    sighash::{SighashType, TransparentAuthorizingContext},
};

mod orchard_payment;

pub const SIGHASH_ALL_BYTE: u8 = 0x01;
/// Operational batch cap for this one-input payment constructor, not a consensus limit.
pub const MAX_PAYMENT_OUTPUTS: usize = 1024;

#[derive(Debug)]
pub struct ConstructInput {
    pub prevout_txid: String,
    pub prevout_index: u32,
    pub sequence: u32,
    pub amount_zat: i64,
    pub script_pubkey_hex: String,
}

#[derive(Debug)]
pub struct ConstructOutput {
    pub value_zat: i64,
    pub script_pubkey_hex: String,
}

// Derived struct visitors also accept positional arrays. Require a map while
// delegating field decoding directly, so duplicate and unknown fields still fail.
fn deserialize_map_only<'de, D, T>(deserializer: D) -> Result<T, D::Error>
where
    D: serde::Deserializer<'de>,
    T: Deserialize<'de>,
{
    struct MapVisitor<T>(std::marker::PhantomData<T>);
    impl<'de, T: Deserialize<'de>> serde::de::Visitor<'de> for MapVisitor<T> {
        type Value = T;
        fn expecting(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            formatter.write_str("a JSON object")
        }
        fn visit_map<M: serde::de::MapAccess<'de>>(self, map: M) -> Result<T, M::Error> {
            T::deserialize(serde::de::value::MapAccessDeserializer::new(map))
        }
    }
    deserializer.deserialize_map(MapVisitor(std::marker::PhantomData))
}

impl<'de> Deserialize<'de> for ConstructInput {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        #[derive(Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Fields {
            prevout_txid: String,
            prevout_index: u32,
            sequence: u32,
            amount_zat: i64,
            script_pubkey_hex: String,
        }
        let fields: Fields = deserialize_map_only(deserializer)?;
        Ok(Self {
            prevout_txid: fields.prevout_txid,
            prevout_index: fields.prevout_index,
            sequence: fields.sequence,
            amount_zat: fields.amount_zat,
            script_pubkey_hex: fields.script_pubkey_hex,
        })
    }
}

impl<'de> Deserialize<'de> for ConstructOutput {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        #[derive(Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Fields {
            value_zat: i64,
            script_pubkey_hex: String,
        }
        let fields: Fields = deserialize_map_only(deserializer)?;
        Ok(Self {
            value_zat: fields.value_zat,
            script_pubkey_hex: fields.script_pubkey_hex,
        })
    }
}

#[derive(Debug, Deserialize)]
#[serde(tag = "operation", rename_all = "snake_case", deny_unknown_fields)]
pub enum Request {
    OrchardPrepare {
        intent: orchard_payment::OrchardIntent,
    },
    OrchardVerify {
        intent: orchard_payment::OrchardIntent,
        pczt_hex: String,
    },
    OrchardFinalize {
        intent: orchard_payment::OrchardIntent,
        pczt_hex: String,
        fingerprint_sha256: String,
        compact_signature_hex: String,
    },
    OrchardVerifySigned {
        intent: orchard_payment::OrchardIntent,
        pczt_hex: String,
        fingerprint_sha256: String,
        compact_signature_hex: String,
        signed_tx_hex: String,
    },
    Construct {
        expected_branch_id: String,
        lock_time: u32,
        expiry_height: u32,
        input: ConstructInput,
        outputs: Vec<ConstructOutput>,
    },
    Digest {
        unsigned_tx_hex: String,
        expected_branch_id: String,
        input_amount_zat: i64,
        prevout_script_hex: String,
    },
    Finalize {
        unsigned_tx_hex: String,
        expected_branch_id: String,
        input_amount_zat: i64,
        prevout_script_hex: String,
        compact_signature_hex: String,
        compressed_pubkey_hex: String,
    },
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(tag = "operation", rename_all = "snake_case")]
pub enum Response {
    OrchardPrepare {
        pczt_hex: String,
        txid_raw: String,
        fingerprint_sha256: String,
        sighash_all: String,
        actual_fee_zat: u64,
        recipient_ciphertext_verified: bool,
        orchard_proof_verified: bool,
    },
    OrchardVerify {
        txid_raw: String,
        fingerprint_sha256: String,
        sighash_all: String,
        actual_fee_zat: u64,
        recipient_ciphertext_verified: bool,
        orchard_proof_verified: bool,
    },
    OrchardFinalize {
        signed_tx_hex: String,
        signed_txid_raw: String,
        fingerprint_sha256: String,
        sighash_all: String,
        recipient_ciphertext_verified: bool,
        orchard_proof_verified: bool,
    },
    OrchardVerifySigned {
        signed_txid_raw: String,
        fingerprint_sha256: String,
        sighash_all: String,
        recipient_ciphertext_verified: bool,
        orchard_proof_verified: bool,
    },
    Construct {
        unsigned_tx_hex: String,
        txid_raw: String,
        sighash_all: String,
        actual_fee_zat: u64,
        zip317_conventional_fee_zat: u64,
    },
    Digest {
        txid_raw: String,
        sighash_all: String,
        actual_fee_zat: u64,
        zip317_conventional_fee_zat: u64,
    },
    Finalize {
        unsigned_txid_raw: String,
        signed_txid_raw: String,
        sighash_all: String,
        actual_fee_zat: u64,
        zip317_conventional_fee_zat: u64,
        der_signature_plus_type_hex: String,
        script_sig_hex: String,
        signed_tx_hex: String,
        callback_count: usize,
    },
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ToolError {
    pub code: &'static str,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub callback_count: Option<usize>,
}

impl ToolError {
    fn new(code: &'static str, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
            callback_count: None,
        }
    }

    fn script(message: impl Into<String>, callback_count: usize) -> Self {
        Self {
            code: "script_rejected",
            message: message.into(),
            callback_count: Some(callback_count),
        }
    }
}

impl std::fmt::Display for ToolError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", self.code, self.message)
    }
}
impl std::error::Error for ToolError {}

#[derive(Debug)]
struct ExternalTransparentAuth {
    input_amounts: Vec<Zatoshis>,
    input_scriptpubkeys: Vec<Script>,
}
impl transparent::Authorization for ExternalTransparentAuth {
    type ScriptSig = Script;
}
impl TransparentAuthorizingContext for ExternalTransparentAuth {
    fn input_amounts(&self) -> Vec<Zatoshis> {
        self.input_amounts.clone()
    }
    fn input_scriptpubkeys(&self) -> Vec<Script> {
        self.input_scriptpubkeys.clone()
    }
}
struct ExternalAuthorization;
impl Authorization for ExternalAuthorization {
    type TransparentAuth = ExternalTransparentAuth;
    type SaplingAuth = sapling::bundle::Authorized;
    type OrchardAuth = orchard::bundle::Authorized;
}

struct Validated {
    tx: Transaction,
    prevout_script: Vec<u8>,
    input_amount: Zatoshis,
    actual_fee: Zatoshis,
    conventional_fee: Zatoshis,
}

fn decode_hex(label: &str, value: &str) -> Result<Vec<u8>, ToolError> {
    hex::decode(value).map_err(|e| {
        ToolError::new(
            "invalid_hex",
            format!("{label} must be even-length hexadecimal: {e}"),
        )
    })
}

fn parse_transaction(bytes: &[u8]) -> Result<Transaction, ToolError> {
    let mut cursor = Cursor::new(bytes);
    let tx = Transaction::read(&mut cursor, BranchId::Nu5).map_err(|e| {
        ToolError::new(
            "invalid_transaction",
            format!("transaction decoding failed: {e}"),
        )
    })?;
    if cursor.position() as usize != bytes.len() {
        return Err(ToolError::new(
            "trailing_bytes",
            "transaction hex contains bytes after the complete transaction",
        ));
    }
    Ok(tx)
}

fn parse_expected_branch(value: &str) -> Result<u32, ToolError> {
    if value.len() != 8 || !value.bytes().all(|b| b.is_ascii_hexdigit()) {
        return Err(ToolError::new(
            "invalid_branch_id",
            "expected_branch_id must contain exactly eight hexadecimal digits",
        ));
    }
    u32::from_str_radix(value, 16).map_err(|e| {
        ToolError::new(
            "invalid_branch_id",
            format!("expected_branch_id could not be parsed: {e}"),
        )
    })
}

fn parse_construct_branch(value: &str) -> Result<BranchId, ToolError> {
    if value.len() != 8
        || !value
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
    {
        return Err(ToolError::new(
            "invalid_branch_id",
            "construct expected_branch_id must contain exactly eight lowercase hexadecimal digits",
        ));
    }
    let raw = parse_expected_branch(value)?;
    BranchId::try_from(raw).map_err(|_| {
        ToolError::new(
            "unsupported_branch_id",
            format!("construct does not recognize consensus branch {raw:08x}"),
        )
    })
}

fn require_p2pkh(script: &[u8]) -> Result<&[u8], ToolError> {
    if script.len() != 25
        || script[0] != 0x76
        || script[1] != 0xa9
        || script[2] != 0x14
        || script[23] != 0x88
        || script[24] != 0xac
    {
        return Err(ToolError::new(
            "unsupported_prevout_script",
            "prevout_script_hex must be an exact 25-byte P2PKH script",
        ));
    }
    Ok(&script[3..23])
}

fn require_output_p2pkh(script: &[u8]) -> Result<(), ToolError> {
    require_p2pkh(script).map(|_| ()).map_err(|_| {
        ToolError::new(
            "unsupported_output_script",
            "construct output script_pubkey_hex must be an exact 25-byte P2PKH script",
        )
    })
}

fn parse_display_txid(value: &str, index: u32) -> Result<[u8; 32], ToolError> {
    if value.len() != 64
        || !value
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
    {
        return Err(ToolError::new(
            "invalid_outpoint",
            "input prevout_txid must contain exactly 64 lowercase hexadecimal digits",
        ));
    }
    let mut display = decode_hex("input prevout_txid", value)?;
    if display.iter().all(|byte| *byte == 0) && index == u32::MAX {
        return Err(ToolError::new(
            "null_outpoint",
            "construct input must not be the null coinbase outpoint",
        ));
    }
    display.reverse();
    display.try_into().map_err(|_| {
        ToolError::new(
            "invalid_outpoint",
            "input prevout_txid must encode exactly 32 bytes",
        )
    })
}

fn construct_unsigned(
    expected_branch_id: &str,
    lock_time: u32,
    expiry_height: u32,
    input: &ConstructInput,
    outputs: &[ConstructOutput],
) -> Result<Vec<u8>, ToolError> {
    let branch = parse_construct_branch(expected_branch_id)?;
    let _input_amount = Zatoshis::from_nonnegative_i64(input.amount_zat).map_err(|e| {
        ToolError::new(
            "invalid_amount",
            format!("construct input amount_zat is outside Zcash amount bounds: {e}"),
        )
    })?;
    let input_script = decode_hex("input script_pubkey_hex", &input.script_pubkey_hex)?;
    require_p2pkh(&input_script)?;
    let outpoint = OutPoint::new(
        parse_display_txid(&input.prevout_txid, input.prevout_index)?,
        input.prevout_index,
    );
    if outputs.is_empty() {
        return Err(ToolError::new(
            "empty_outputs",
            "construct requires at least one transparent output",
        ));
    }
    if outputs.len() > MAX_PAYMENT_OUTPUTS {
        return Err(ToolError::new(
            "too_many_outputs",
            format!("construct supports at most {MAX_PAYMENT_OUTPUTS} payment outputs"),
        ));
    }
    let mut tx_outputs = Vec::with_capacity(outputs.len());
    for output in outputs {
        let value = Zatoshis::from_nonnegative_i64(output.value_zat).map_err(|e| {
            ToolError::new(
                "invalid_output_amount",
                format!("construct output value_zat is outside Zcash amount bounds: {e}"),
            )
        })?;
        let script = decode_hex("output script_pubkey_hex", &output.script_pubkey_hex)?;
        require_output_p2pkh(&script)?;
        tx_outputs.push(TxOut::new(value, Script(script::Code(script))));
    }
    let transparent_bundle = Bundle {
        vin: vec![TxIn::from_parts(
            outpoint,
            Script(script::Code(Vec::new())),
            input.sequence,
        )],
        vout: tx_outputs,
        authorization: transparent::Authorized,
    };
    let data = TransactionData::<TransactionAuthorized>::from_parts(
        TxVersion::V5,
        branch,
        lock_time,
        BlockHeight::from_u32(expiry_height),
        Some(transparent_bundle),
        None,
        None,
        None,
    );
    let transaction = data.freeze().map_err(|e| {
        ToolError::new(
            "serialization_failed",
            format!("unsigned transaction construction failed: {e}"),
        )
    })?;
    let mut bytes = Vec::new();
    transaction.write(&mut bytes).map_err(|e| {
        ToolError::new(
            "serialization_failed",
            format!("unsigned transaction serialization failed: {e}"),
        )
    })?;
    Ok(bytes)
}

fn fee_metrics(
    tx: &Transaction,
    input_amount: Zatoshis,
) -> Result<(Zatoshis, Zatoshis), ToolError> {
    let bundle = tx.transparent_bundle().ok_or_else(|| {
        ToolError::new(
            "missing_transparent_bundle",
            "transparent bundle is required",
        )
    })?;
    let output_total = bundle.vout.iter().try_fold(0u64, |sum, output| {
        sum.checked_add(u64::from(output.value())).ok_or_else(|| {
            ToolError::new(
                "amount_overflow",
                "transparent output amount sum overflowed",
            )
        })
    })?;
    let actual = u64::from(input_amount)
        .checked_sub(output_total)
        .ok_or_else(|| {
            ToolError::new(
                "negative_fee",
                "transparent output total exceeds input_amount_zat",
            )
        })?;
    let actual = Zatoshis::from_u64(actual).map_err(|e| {
        ToolError::new("amount_out_of_range", format!("actual fee is invalid: {e}"))
    })?;
    let conventional = zip317::FeeRule::standard()
        .fee_required(
            &MAIN_NETWORK,
            BlockHeight::from_u32(1),
            [InputSize::STANDARD_P2PKH],
            bundle.vout.iter().map(OutputView::serialized_size),
            0,
            0,
            0,
            0,
        )
        .map_err(|e| {
            ToolError::new(
                "fee_computation_failed",
                format!("ZIP-317 fee computation failed: {e}"),
            )
        })?;
    Ok((actual, conventional))
}

fn validate_common(
    unsigned_tx_hex: &str,
    expected_branch_id: &str,
    input_amount_zat: i64,
    prevout_script_hex: &str,
) -> Result<Validated, ToolError> {
    let tx = parse_transaction(&decode_hex("unsigned_tx_hex", unsigned_tx_hex)?)?;
    if tx.version() != TxVersion::V5 {
        return Err(ToolError::new(
            "unsupported_version",
            "only version 5 transactions are supported",
        ));
    }
    let expected = parse_expected_branch(expected_branch_id)?;
    let actual = u32::from(tx.consensus_branch_id());
    if expected != actual {
        return Err(ToolError::new(
            "branch_mismatch",
            format!("expected branch {expected:08x}, transaction embeds {actual:08x}"),
        ));
    }
    if tx.sprout_bundle().is_some()
        || tx.sapling_bundle().is_some()
        || tx.orchard_bundle().is_some()
        || tx.ironwood_bundle().is_some()
    {
        return Err(ToolError::new(
            "shielded_bundle",
            "only fully transparent transactions are supported",
        ));
    }
    let bundle = tx.transparent_bundle().ok_or_else(|| {
        ToolError::new(
            "missing_transparent_bundle",
            "transparent bundle is required",
        )
    })?;
    if bundle.vin.len() != 1 {
        return Err(ToolError::new(
            "input_count",
            "exactly one transparent input is required",
        ));
    }
    if bundle.vout.is_empty() {
        return Err(ToolError::new(
            "empty_outputs",
            "at least one transparent output is required",
        ));
    }
    if !bundle.vin[0].script_sig().0.0.is_empty() {
        return Err(ToolError::new(
            "prefilled_script_sig",
            "the sole input scriptSig must be empty",
        ));
    }
    let input_amount = Zatoshis::from_nonnegative_i64(input_amount_zat).map_err(|e| {
        ToolError::new(
            "invalid_amount",
            format!("input_amount_zat is outside Zcash amount bounds: {e}"),
        )
    })?;
    let prevout_script = decode_hex("prevout_script_hex", prevout_script_hex)?;
    require_p2pkh(&prevout_script)?;
    let (actual_fee, conventional_fee) = fee_metrics(&tx, input_amount)?;
    Ok(Validated {
        tx,
        prevout_script,
        input_amount,
        actual_fee,
        conventional_fee,
    })
}

fn signature_digest(
    tx: &Transaction,
    input_amount: Zatoshis,
    prevout_script_bytes: &[u8],
    script_code_bytes: &[u8],
    hash_type: SighashType,
) -> Result<[u8; 32], ToolError> {
    let txdata = tx.deref();
    let prevout_script = Script(script::Code(prevout_script_bytes.to_vec()));
    let script_code = Script(script::Code(script_code_bytes.to_vec()));
    let transparent_bundle = txdata.transparent_bundle().map(|bundle| Bundle {
        vin: bundle
            .vin
            .iter()
            .map(|vin| {
                TxIn::from_parts(
                    vin.prevout().clone(),
                    vin.script_sig().clone(),
                    vin.sequence(),
                )
            })
            .collect(),
        vout: bundle.vout.clone(),
        authorization: ExternalTransparentAuth {
            input_amounts: vec![input_amount],
            input_scriptpubkeys: vec![prevout_script.clone()],
        },
    });
    let external_tx = TransactionData::<ExternalAuthorization>::from_parts(
        txdata.version(),
        txdata.consensus_branch_id(),
        txdata.lock_time(),
        txdata.expiry_height(),
        transparent_bundle,
        txdata.sprout_bundle().cloned(),
        txdata.sapling_bundle().cloned(),
        txdata.orchard_bundle().cloned(),
    );
    let txid_parts = txdata.digest(TxIdDigester);
    let bundle = external_tx.transparent_bundle().ok_or_else(|| {
        ToolError::new(
            "missing_transparent_bundle",
            "transparent bundle is required",
        )
    })?;
    let signable = zcash_transparent::sighash::SignableInput::from_parts(
        bundle,
        hash_type,
        0,
        &script_code,
        &prevout_script,
        input_amount,
    )
    .map_err(|e| {
        ToolError::new(
            "digest_failed",
            format!("transparent signable input construction failed: {e}"),
        )
    })?;
    let digest = signature_hash(
        &external_tx,
        &SignableInput::Transparent(signable),
        &txid_parts,
    );
    let mut bytes = [0u8; 32];
    bytes.copy_from_slice(digest.as_ref());
    Ok(bytes)
}

fn script_hash_type(hash_type: &ScriptHashType) -> SighashType {
    match (hash_type.signed_outputs(), hash_type.anyone_can_pay()) {
        (SignedOutputs::All, false) => SighashType::ALL,
        (SignedOutputs::None, false) => SighashType::NONE,
        (SignedOutputs::Single, false) => SighashType::SINGLE,
        (SignedOutputs::All, true) => SighashType::ALL_ANYONECANPAY,
        (SignedOutputs::None, true) => SighashType::NONE_ANYONECANPAY,
        (SignedOutputs::Single, true) => SighashType::SINGLE_ANYONECANPAY,
    }
}

fn verification_flags() -> Flags {
    Flags::P2SH
        | Flags::StrictEnc
        | Flags::LowS
        | Flags::NullDummy
        | Flags::SigPushOnly
        | Flags::MinimalData
        | Flags::CleanStack
        | Flags::CHECKLOCKTIMEVERIFY
}

fn verify_serialized(
    signed_tx: &[u8],
    input_amount: Zatoshis,
    prevout_script_bytes: &[u8],
) -> Result<(bool, usize, Option<String>), ToolError> {
    let tx = parse_transaction(signed_tx)?;
    let bundle = tx.transparent_bundle().ok_or_else(|| {
        ToolError::new(
            "missing_transparent_bundle",
            "transparent bundle is required",
        )
    })?;
    if bundle.vin.len() != 1 {
        return Err(ToolError::new(
            "input_count",
            "exactly one transparent input is required",
        ));
    }
    let raw_script = script::Raw::from_raw_parts(
        bundle.vin[0].script_sig().0.0.clone(),
        prevout_script_bytes.to_vec(),
    );
    let callback_count = Cell::new(0usize);
    let callback = |script_code: &script::Code, hash_type: &ScriptHashType| -> Option<[u8; 32]> {
        callback_count.set(callback_count.get() + 1);
        signature_digest(
            &tx,
            input_amount,
            prevout_script_bytes,
            &script_code.0,
            script_hash_type(hash_type),
        )
        .ok()
    };
    let checker = CallbackTransactionSignatureChecker {
        sighash: &callback,
        lock_time: i64::from(tx.lock_time()),
        is_final: bundle.vin[0].sequence() == u32::MAX,
    };
    let (accepted, engine_error) = match raw_script.eval(verification_flags(), &checker) {
        Ok(accepted) => (accepted, None),
        Err((component, error)) => (false, Some(format!("{component:?}: {error}"))),
    };
    Ok((accepted, callback_count.get(), engine_error))
}

fn parse_external_signature(value: &str) -> Result<Vec<u8>, ToolError> {
    let compact = decode_hex("compact_signature_hex", value)?;
    if compact.len() != 64 {
        return Err(ToolError::new(
            "invalid_signature",
            "compact_signature_hex must encode exactly 64 bytes (r || s)",
        ));
    }
    let signature = Signature::from_compact(&compact).map_err(|e| {
        ToolError::new(
            "invalid_signature",
            format!("compact ECDSA signature is invalid: {e}"),
        )
    })?;
    let mut normalized = signature;
    normalized.normalize_s();
    if normalized.serialize_compact().as_slice() != compact.as_slice() {
        return Err(ToolError::new(
            "high_s_signature",
            "external signature is not low-S",
        ));
    }
    let mut encoded = signature.serialize_der().to_vec();
    encoded.push(SIGHASH_ALL_BYTE);
    Ok(encoded)
}

fn parse_external_pubkey(value: &str, expected_hash: &[u8]) -> Result<Vec<u8>, ToolError> {
    let bytes = decode_hex("compressed_pubkey_hex", value)?;
    if bytes.len() != 33 {
        return Err(ToolError::new(
            "invalid_pubkey",
            "compressed_pubkey_hex must encode exactly 33 bytes",
        ));
    }
    let pubkey = PublicKey::from_slice(&bytes).map_err(|e| {
        ToolError::new(
            "invalid_pubkey",
            format!("compressed public key is invalid: {e}"),
        )
    })?;
    if pubkey.serialize().as_slice() != bytes.as_slice() {
        return Err(ToolError::new(
            "invalid_pubkey",
            "public key must use canonical compressed encoding",
        ));
    }
    let actual_hash = Ripemd160::digest(Sha256::digest(&bytes));
    if actual_hash.as_slice() != expected_hash {
        return Err(ToolError::new(
            "pubkey_hash_mismatch",
            "HASH160(compressed_pubkey) does not match the P2PKH prevout",
        ));
    }
    Ok(bytes)
}

fn build_script_sig(signature: &[u8], pubkey: &[u8]) -> Result<Vec<u8>, ToolError> {
    let sig_push = pv::push_value(signature).ok_or_else(|| {
        ToolError::new("script_construction_failed", "signature push is too large")
    })?;
    let key_push = pv::push_value(pubkey).ok_or_else(|| {
        ToolError::new("script_construction_failed", "public-key push is too large")
    })?;
    Ok(script::Component(vec![sig_push, key_push]).to_bytes())
}

fn serialize_signed(tx: &Transaction, script_sig: Vec<u8>) -> Result<Vec<u8>, ToolError> {
    let txdata = tx.deref();
    let mut bundle = txdata.transparent_bundle().cloned().ok_or_else(|| {
        ToolError::new(
            "missing_transparent_bundle",
            "transparent bundle is required",
        )
    })?;
    let input = &bundle.vin[0];
    bundle.vin[0] = TxIn::from_parts(
        input.prevout().clone(),
        Script(script::Code(script_sig)),
        input.sequence(),
    );
    let data = TransactionData::<TransactionAuthorized>::from_parts(
        txdata.version(),
        txdata.consensus_branch_id(),
        txdata.lock_time(),
        txdata.expiry_height(),
        Some(bundle),
        txdata.sprout_bundle().cloned(),
        txdata.sapling_bundle().cloned(),
        txdata.orchard_bundle().cloned(),
    );
    let signed = data.freeze().map_err(|e| {
        ToolError::new(
            "serialization_failed",
            format!("signed transaction finalization failed: {e}"),
        )
    })?;
    let mut bytes = Vec::new();
    signed.write(&mut bytes).map_err(|e| {
        ToolError::new(
            "serialization_failed",
            format!("signed transaction serialization failed: {e}"),
        )
    })?;
    Ok(bytes)
}

pub fn execute(request: Request) -> Result<Response, ToolError> {
    match request {
        Request::OrchardPrepare { intent } => orchard_payment::prepare(intent),
        Request::OrchardVerify { intent, pczt_hex } => orchard_payment::verify(intent, &pczt_hex),
        Request::OrchardFinalize {
            intent,
            pczt_hex,
            fingerprint_sha256,
            compact_signature_hex,
        } => orchard_payment::finalize(
            intent,
            &pczt_hex,
            &fingerprint_sha256,
            &compact_signature_hex,
        ),
        Request::OrchardVerifySigned {
            intent,
            pczt_hex,
            fingerprint_sha256,
            compact_signature_hex,
            signed_tx_hex,
        } => orchard_payment::verify_signed(
            intent,
            &pczt_hex,
            &fingerprint_sha256,
            &compact_signature_hex,
            &signed_tx_hex,
        ),
        Request::Construct {
            expected_branch_id,
            lock_time,
            expiry_height,
            input,
            outputs,
        } => {
            let bytes = construct_unsigned(
                &expected_branch_id,
                lock_time,
                expiry_height,
                &input,
                &outputs,
            )?;
            let unsigned_tx_hex = hex::encode(bytes);
            let v = validate_common(
                &unsigned_tx_hex,
                &expected_branch_id,
                input.amount_zat,
                &input.script_pubkey_hex,
            )?;
            let digest = signature_digest(
                &v.tx,
                v.input_amount,
                &v.prevout_script,
                &v.prevout_script,
                SighashType::ALL,
            )?;
            Ok(Response::Construct {
                unsigned_tx_hex,
                txid_raw: hex::encode(v.tx.txid().as_ref()),
                sighash_all: hex::encode(digest),
                actual_fee_zat: v.actual_fee.into(),
                zip317_conventional_fee_zat: v.conventional_fee.into(),
            })
        }
        Request::Digest {
            unsigned_tx_hex,
            expected_branch_id,
            input_amount_zat,
            prevout_script_hex,
        } => {
            let v = validate_common(
                &unsigned_tx_hex,
                &expected_branch_id,
                input_amount_zat,
                &prevout_script_hex,
            )?;
            let digest = signature_digest(
                &v.tx,
                v.input_amount,
                &v.prevout_script,
                &v.prevout_script,
                SighashType::ALL,
            )?;
            Ok(Response::Digest {
                txid_raw: hex::encode(v.tx.txid().as_ref()),
                sighash_all: hex::encode(digest),
                actual_fee_zat: v.actual_fee.into(),
                zip317_conventional_fee_zat: v.conventional_fee.into(),
            })
        }
        Request::Finalize {
            unsigned_tx_hex,
            expected_branch_id,
            input_amount_zat,
            prevout_script_hex,
            compact_signature_hex,
            compressed_pubkey_hex,
        } => {
            let v = validate_common(
                &unsigned_tx_hex,
                &expected_branch_id,
                input_amount_zat,
                &prevout_script_hex,
            )?;
            let expected_hash = require_p2pkh(&v.prevout_script)?;
            let signature = parse_external_signature(&compact_signature_hex)?;
            let pubkey = parse_external_pubkey(&compressed_pubkey_hex, expected_hash)?;
            let digest = signature_digest(
                &v.tx,
                v.input_amount,
                &v.prevout_script,
                &v.prevout_script,
                SighashType::ALL,
            )?;
            let script_sig = build_script_sig(&signature, &pubkey)?;
            let signed_tx = serialize_signed(&v.tx, script_sig.clone())?;
            let (accepted, callback_count, engine_error) =
                verify_serialized(&signed_tx, v.input_amount, &v.prevout_script)?;
            if !accepted || callback_count != 1 {
                let detail = engine_error.unwrap_or_else(|| "script returned false".to_owned());
                return Err(ToolError::script(
                    format!("P2PKH verification failed: {detail}"),
                    callback_count,
                ));
            }
            let reparsed = parse_transaction(&signed_tx)?;
            Ok(Response::Finalize {
                unsigned_txid_raw: hex::encode(v.tx.txid().as_ref()),
                signed_txid_raw: hex::encode(reparsed.txid().as_ref()),
                sighash_all: hex::encode(digest),
                actual_fee_zat: v.actual_fee.into(),
                zip317_conventional_fee_zat: v.conventional_fee.into(),
                der_signature_plus_type_hex: hex::encode(signature),
                script_sig_hex: hex::encode(script_sig),
                signed_tx_hex: hex::encode(signed_tx),
                callback_count,
            })
        }
    }
}

pub fn run_json(input: &str) -> Result<Response, ToolError> {
    let request = serde_json::from_str(input)
        .map_err(|e| ToolError::new("invalid_json", format!("request JSON is invalid: {e}")))?;
    execute(request)
}

#[cfg(test)]
mod tests {
    use super::*;
    use zcash_transparent::bundle::TxOut;

    const UNSIGNED: &str = "050000800a27a726b4d0d6c200000000000000000111111111111111111111111111111111111111111111111111111111111111110000000000feffffff01905f0100000000001976a914222222222222222222222222222222222222222288ac000000";
    const PREVOUT: &str = "76a914751e76e8199196d454941c45d1b3a323f1433bd688ac";
    const TXID: &str = "e83f66ebbeab2ee4dc2ff2d5056ff11d9dceb7f7b8d6b4d7948c434dd0208250";
    const DIGEST: &str = "2447a0a7c59fa794a5bcf5d043a6f92deb85dca954f658af64f63e3cc3eaf6b1";
    const COMPACT: &str = "5b3b2ca1ad6e8d1dc4b55b1eba9b72f90928304085d441e303d7bb48f385f278468b48132a3365df39f30cd2fe858a89e8e6a202e99f31d518c523a4821b12cc";
    const PUBKEY: &str = "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798";
    const DER: &str = "304402205b3b2ca1ad6e8d1dc4b55b1eba9b72f90928304085d441e303d7bb48f385f2780220468b48132a3365df39f30cd2fe858a89e8e6a202e99f31d518c523a4821b12cc01";
    const SCRIPT_SIG: &str = "47304402205b3b2ca1ad6e8d1dc4b55b1eba9b72f90928304085d441e303d7bb48f385f2780220468b48132a3365df39f30cd2fe858a89e8e6a202e99f31d518c523a4821b12cc01210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798";
    const SIGNED: &str = "050000800a27a726b4d0d6c20000000000000000011111111111111111111111111111111111111111111111111111111111111111000000006a47304402205b3b2ca1ad6e8d1dc4b55b1eba9b72f90928304085d441e303d7bb48f385f2780220468b48132a3365df39f30cd2fe858a89e8e6a202e99f31d518c523a4821b12cc01210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798feffffff01905f0100000000001976a914222222222222222222222222222222222222222288ac000000";
    const WITHDRAWAL_UNSIGNED: &str = "050000800a27a726b4d0d6c20000000032010000017b72f760ea2af88318f9e265df12d280045183e97e3268f22f56bec73fbff9aa0000000000feffffff02005a6202000000001976a914751e76e8199196d454941c45d1b3a323f1433bd688acf05f9303000000001976a914f09ce3435526cda8bffce9b09336d23ec5cc7c9188ac000000";
    const WITHDRAWAL_TXID: &str =
        "72bc159a585c1d31ff3112f23fb5e9e44f329b761cc51a0c66176f9c6c3e7e1e";
    const WITHDRAWAL_DIGEST: &str =
        "f970cc9d49ce85d5762e4706a442b73803055e743085659951cb0c61a5c264e1";
    const WITHDRAWAL_PREVOUT_TXID: &str =
        "aaf9bf3fc7be562ff268327ee983510480d212df65e2f91883f82aea60f7727b";
    const WITHDRAWAL_PREVOUT: &str = "76a914f09ce3435526cda8bffce9b09336d23ec5cc7c9188ac";
    const WITHDRAWAL_PAYOUT: &str = "76a914751e76e8199196d454941c45d1b3a323f1433bd688ac";
    // ZIP-244 vector 7 from zcash/zcash-test-vectors@78321beacb0e0477e33cd002b56585a107c2708c.
    const SHIELDED_V5: &str = "050000800a27a726b4d0d6c2d2c4e624a6fc330003af247e36483f13b204422237fc6ab3eba02fc4142b4297ebb5683db8d24319706ad26aaf001c53b740f34543a6b3e9f5bb7d5c49e8c37f614921254f3212394c797d1cee7899b7b4b65b59b734075253ac6351515170b7317414438cd80bd0f9a67c9b9e552f013c115a954f35e0616c68d43163d334dac3827033e5ad06006a51ac53658f5935c6033aee46294f0a0400055353636365d1526a0e794e0500080000ac52006a5263b552e8d573000600036a6a5101010f7549a9cf5fd4f61d157b6e2c80dc60478aee453ee140ad397f27e42e414fa217d649616bbe739b13d14df03ff27671489be0b4bebaafa7d1e639d5b3e994e0903af6e17081d5818e88b14e4f601b8c063e3f4387ffa2322a5181909f0980008f0b8964de3d0500ccca4d22b983c328c8d95f433a08e9064c0c46d33d65047e43a91066af420f0ad689de7f8e6a5c62a777d175002a137de85b8888929198117aa5d61993e1dcf75876dca609f9d28471f997fa11f99d423f9cf1734be8a5ff997d451eb3cf4b3dfdd9d4545c35b2b5a7dc17a836b12b43befc0be0a1bd369772338078b4ff7d8e2d979a3441e1c8f5afe47b1e7da56cf00602d01b110c05cf48fda3e6cce32a044000f45c6d1e696d245cbd312bdc3a3a21c992d0ebc8cc8fa6306d7e130a2ba42018fe596949fd82267bcc59dd4626efc3ea7438d05c91b0f8e092550d2d39a07652d7eda089440669beca2ca2e380073cb3888f182968f22fde97b78f10764bc6a22b4f035200d681d427e2dc1d004cbfbb54bb44b1a7fc85e38cba4f83a801eb3d1e40c4745e85ab7e2d4794cf224a8d440d7944a86c84e02063ff7ade0a5d946e3b4830651e38332039df49b531040bc68f6b4e52eeec9e543b2955c1440600";

    fn branch(id: BranchId) -> String {
        format!("{:08x}", u32::from(id))
    }
    fn digest(tx: impl Into<String>, amount: i64, id: BranchId) -> Request {
        Request::Digest {
            unsigned_tx_hex: tx.into(),
            expected_branch_id: branch(id),
            input_amount_zat: amount,
            prevout_script_hex: PREVOUT.to_owned(),
        }
    }
    fn finalize(tx: impl Into<String>, amount: i64, id: BranchId) -> Request {
        Request::Finalize {
            unsigned_tx_hex: tx.into(),
            expected_branch_id: branch(id),
            input_amount_zat: amount,
            prevout_script_hex: PREVOUT.to_owned(),
            compact_signature_hex: COMPACT.to_owned(),
            compressed_pubkey_hex: PUBKEY.to_owned(),
        }
    }
    fn construct_withdrawal() -> Request {
        Request::Construct {
            expected_branch_id: branch(BranchId::Nu5),
            lock_time: 0,
            expiry_height: 306,
            input: ConstructInput {
                prevout_txid: WITHDRAWAL_PREVOUT_TXID.to_owned(),
                prevout_index: 0,
                sequence: 0xffff_fffe,
                amount_zat: 100_000_000,
                script_pubkey_hex: WITHDRAWAL_PREVOUT.to_owned(),
            },
            outputs: vec![
                ConstructOutput {
                    value_zat: 40_000_000,
                    script_pubkey_hex: WITHDRAWAL_PAYOUT.to_owned(),
                },
                ConstructOutput {
                    value_zat: 59_990_000,
                    script_pubkey_hex: WITHDRAWAL_PREVOUT.to_owned(),
                },
            ],
        }
    }
    fn rebuild<F>(id: BranchId, expiry: u32, change: F) -> String
    where
        F: FnOnce(&mut transparent::Bundle<transparent::Authorized>),
    {
        let tx = parse_transaction(&hex::decode(UNSIGNED).unwrap()).unwrap();
        let mut bundle = tx.transparent_bundle().cloned().unwrap();
        change(&mut bundle);
        let data = TransactionData::<TransactionAuthorized>::from_parts(
            tx.version(),
            id,
            tx.lock_time(),
            expiry.into(),
            Some(bundle),
            tx.sprout_bundle().cloned(),
            tx.sapling_bundle().cloned(),
            tx.orchard_bundle().cloned(),
        );
        let tx = data.freeze().unwrap();
        let mut bytes = vec![];
        tx.write(&mut bytes).unwrap();
        hex::encode(bytes)
    }
    fn rebuild_v4() -> String {
        let tx = parse_transaction(&hex::decode(UNSIGNED).unwrap()).unwrap();
        let data = TransactionData::<TransactionAuthorized>::from_parts(
            TxVersion::V4,
            BranchId::Nu5,
            tx.lock_time(),
            tx.expiry_height(),
            tx.transparent_bundle().cloned(),
            None,
            None,
            None,
        );
        let tx = data.freeze().unwrap();
        let mut bytes = vec![];
        tx.write(&mut bytes).unwrap();
        hex::encode(bytes)
    }
    fn checksig_reject(request: Request) {
        let e = execute(request).unwrap_err();
        assert_eq!(e.code, "script_rejected", "{e:?}");
        assert_eq!(e.callback_count, Some(1), "{e:?}");
    }

    #[test]
    fn checkpoint_one_digest_golden_and_native_fees() {
        assert_eq!(
            execute(digest(UNSIGNED, 100_000, BranchId::Nu5)).unwrap(),
            Response::Digest {
                txid_raw: TXID.to_owned(),
                sighash_all: DIGEST.to_owned(),
                actual_fee_zat: 10_000,
                zip317_conventional_fee_zat: 10_000
            }
        );
    }

    #[test]
    fn construct_reproduces_frozen_withdrawal_bytes_digest_and_identity() {
        assert_eq!(
            execute(construct_withdrawal()).unwrap(),
            Response::Construct {
                unsigned_tx_hex: WITHDRAWAL_UNSIGNED.to_owned(),
                txid_raw: WITHDRAWAL_TXID.to_owned(),
                sighash_all: WITHDRAWAL_DIGEST.to_owned(),
                actual_fee_zat: 10_000,
                zip317_conventional_fee_zat: 10_000,
            }
        );
    }

    #[test]
    fn construct_fields_are_explicit_and_committed_in_order() {
        let baseline = execute(construct_withdrawal()).unwrap();
        for field in [
            "branch",
            "lock_time",
            "expiry_height",
            "prevout_txid",
            "prevout_index",
            "sequence",
            "input_amount",
            "input_script",
            "output_value",
            "output_script",
            "output_order",
        ] {
            let mut request = construct_withdrawal();
            if let Request::Construct {
                expected_branch_id,
                lock_time,
                expiry_height,
                input,
                outputs,
                ..
            } = &mut request
            {
                match field {
                    "branch" => *expected_branch_id = branch(BranchId::Nu6),
                    "lock_time" => *lock_time = 1,
                    "expiry_height" => *expiry_height += 1,
                    "prevout_txid" => input.prevout_txid.replace_range(0..2, "ab"),
                    "prevout_index" => input.prevout_index += 1,
                    "sequence" => input.sequence -= 1,
                    "input_amount" => input.amount_zat += 1,
                    "input_script" => input.script_pubkey_hex.replace_range(6..8, "f1"),
                    "output_value" => outputs[0].value_zat += 1,
                    "output_script" => outputs[0].script_pubkey_hex.replace_range(6..8, "76"),
                    "output_order" => outputs.swap(0, 1),
                    _ => unreachable!(),
                }
            }
            assert_ne!(execute(request).unwrap(), baseline, "{field}");
        }
    }

    #[test]
    fn construct_rejects_malformed_or_null_outpoints() {
        for txid in [
            "00",
            "AAf9bf3fc7be562ff268327ee983510480d212df65e2f91883f82aea60f7727b",
        ] {
            let mut request = construct_withdrawal();
            if let Request::Construct { input, .. } = &mut request {
                input.prevout_txid = txid.to_owned();
            }
            assert_eq!(execute(request).unwrap_err().code, "invalid_outpoint");
        }
        let mut request = construct_withdrawal();
        if let Request::Construct { input, .. } = &mut request {
            input.prevout_txid = "00".repeat(32);
            input.prevout_index = u32::MAX;
        }
        assert_eq!(execute(request).unwrap_err().code, "null_outpoint");
    }

    #[test]
    fn construct_rejects_invalid_amounts_scripts_and_output_counts() {
        for amount in [-1, 2_100_000_000_000_001] {
            let mut request = construct_withdrawal();
            if let Request::Construct { input, .. } = &mut request {
                input.amount_zat = amount;
            }
            assert_eq!(execute(request).unwrap_err().code, "invalid_amount");
        }
        for amount in [-1, 2_100_000_000_000_001] {
            let mut request = construct_withdrawal();
            if let Request::Construct { outputs, .. } = &mut request {
                outputs[0].value_zat = amount;
            }
            assert_eq!(execute(request).unwrap_err().code, "invalid_output_amount");
        }
        let mut request = construct_withdrawal();
        if let Request::Construct { input, .. } = &mut request {
            input.script_pubkey_hex = "51".to_owned();
        }
        assert_eq!(
            execute(request).unwrap_err().code,
            "unsupported_prevout_script"
        );
        let mut request = construct_withdrawal();
        if let Request::Construct { outputs, .. } = &mut request {
            outputs[0].script_pubkey_hex = "51".to_owned();
        }
        assert_eq!(
            execute(request).unwrap_err().code,
            "unsupported_output_script"
        );
        let mut request = construct_withdrawal();
        if let Request::Construct { outputs, .. } = &mut request {
            outputs.clear();
        }
        assert_eq!(execute(request).unwrap_err().code, "empty_outputs");
        let mut request = construct_withdrawal();
        if let Request::Construct { outputs, .. } = &mut request {
            *outputs = (0..MAX_PAYMENT_OUTPUTS)
                .map(|_| ConstructOutput {
                    value_zat: 1,
                    script_pubkey_hex: WITHDRAWAL_PAYOUT.to_owned(),
                })
                .collect();
        }
        assert!(matches!(
            execute(request).unwrap(),
            Response::Construct { .. }
        ));
        let mut request = construct_withdrawal();
        if let Request::Construct { outputs, .. } = &mut request {
            *outputs = (0..=MAX_PAYMENT_OUTPUTS)
                .map(|_| ConstructOutput {
                    value_zat: 1,
                    script_pubkey_hex: WITHDRAWAL_PAYOUT.to_owned(),
                })
                .collect();
        }
        assert_eq!(execute(request).unwrap_err().code, "too_many_outputs");
    }

    #[test]
    fn construct_schema_rejects_case_unknown_fields_and_numeric_bounds() {
        let valid = r#"{"operation":"construct","expected_branch_id":"c2d6d0b4","lock_time":0,"expiry_height":306,"input":{"prevout_txid":"aaf9bf3fc7be562ff268327ee983510480d212df65e2f91883f82aea60f7727b","prevout_index":0,"sequence":4294967294,"amount_zat":100000000,"script_pubkey_hex":"76a914f09ce3435526cda8bffce9b09336d23ec5cc7c9188ac"},"outputs":[{"value_zat":40000000,"script_pubkey_hex":"76a914751e76e8199196d454941c45d1b3a323f1433bd688ac"},{"value_zat":59990000,"script_pubkey_hex":"76a914f09ce3435526cda8bffce9b09336d23ec5cc7c9188ac"}]}"#;
        assert!(matches!(
            run_json(valid).unwrap(),
            Response::Construct { .. }
        ));
        for invalid in [
            valid.replace("c2d6d0b4", "C2D6D0B4"),
            valid.replace("\"lock_time\":0", "\"lock_time\":4294967296"),
            valid.replace("\"expiry_height\":306", "\"expiry_height\":-1"),
            valid.replace("\"prevout_index\":0", "\"prevout_index\":0,\"extra\":true"),
            valid.replace(
                "\"value_zat\":40000000",
                "\"value_zat\":40000000,\"extra\":true",
            ),
            valid.replace("\"outputs\":[", "\"surprise\":true,\"outputs\":["),
        ] {
            assert!(run_json(&invalid).is_err(), "{invalid}");
        }
    }

    #[test]
    fn construct_nested_dtos_require_objects_and_reject_duplicate_fields() {
        let valid = serde_json::json!({
            "operation": "construct", "expected_branch_id": "c2d6d0b4", "lock_time": 0, "expiry_height": 306,
            "input": {"prevout_txid": "aaf9bf3fc7be562ff268327ee983510480d212df65e2f91883f82aea60f7727b",
                "prevout_index": 0, "sequence": 4294967294u32, "amount_zat": 100000000,
                "script_pubkey_hex": "76a914f09ce3435526cda8bffce9b09336d23ec5cc7c9188ac"},
            "outputs": [{"value_zat": 40000000, "script_pubkey_hex": "76a914751e76e8199196d454941c45d1b3a323f1433bd688ac"},
                {"value_zat": 59990000, "script_pubkey_hex": "76a914f09ce3435526cda8bffce9b09336d23ec5cc7c9188ac"}]
        });
        assert!(run_json(&valid.to_string()).is_ok());
        let mut array_input = valid.clone();
        array_input["input"] = serde_json::json!([
            valid["input"]["prevout_txid"],
            0,
            4294967294u32,
            100000000,
            valid["input"]["script_pubkey_hex"]
        ]);
        let mut array_output = valid.clone();
        array_output["outputs"][0] =
            serde_json::json!([40000000, valid["outputs"][0]["script_pubkey_hex"]]);
        for invalid in [
            array_input.to_string(),
            array_output.to_string(),
            valid.to_string().replace(
                "\"prevout_index\":0",
                "\"prevout_index\":0,\"prevout_index\":0",
            ),
            valid.to_string().replace(
                "\"value_zat\":40000000",
                "\"value_zat\":40000000,\"value_zat\":40000000",
            ),
        ] {
            assert!(
                serde_json::from_str::<Request>(&invalid).is_err(),
                "{invalid}"
            );
            assert_eq!(run_json(&invalid).unwrap_err().code, "invalid_json");
        }
    }

    #[test]
    fn three_output_zip317_fixture_requires_four_logical_actions() {
        let transaction = rebuild(BranchId::Nu5, 0, |bundle| {
            let p2pkh = bundle.vout[0].script_pubkey().clone();
            let mut op_return = vec![0x6a, 0x33];
            op_return.extend([0x42; 51]);
            bundle.vout = vec![
                TxOut::new(Zatoshis::from_u64(30_000).unwrap(), p2pkh.clone()),
                TxOut::new(Zatoshis::from_u64(30_000).unwrap(), p2pkh),
                TxOut::new(
                    Zatoshis::from_u64(20_000).unwrap(),
                    Script(script::Code(op_return)),
                ),
            ];
        });
        match execute(digest(transaction, 100_000, BranchId::Nu5)).unwrap() {
            Response::Digest {
                actual_fee_zat,
                zip317_conventional_fee_zat,
                ..
            } => {
                assert_eq!(actual_fee_zat, 20_000);
                assert_eq!(zip317_conventional_fee_zat, 20_000);
            }
            _ => panic!("wrong response variant"),
        }
    }

    #[test]
    fn checkpoint_two_external_signature_finalizes_canonically() {
        match execute(finalize(UNSIGNED, 100_000, BranchId::Nu5)).unwrap() {
            Response::Finalize {
                unsigned_txid_raw,
                signed_txid_raw,
                sighash_all,
                actual_fee_zat,
                zip317_conventional_fee_zat,
                der_signature_plus_type_hex,
                script_sig_hex,
                signed_tx_hex,
                callback_count,
            } => {
                assert_eq!(
                    (
                        unsigned_txid_raw.as_str(),
                        signed_txid_raw.as_str(),
                        sighash_all.as_str()
                    ),
                    (TXID, TXID, DIGEST)
                );
                assert_eq!(
                    (actual_fee_zat, zip317_conventional_fee_zat, callback_count),
                    (10_000, 10_000, 1)
                );
                assert_eq!(
                    (
                        der_signature_plus_type_hex.as_str(),
                        script_sig_hex.as_str(),
                        signed_tx_hex.as_str()
                    ),
                    (DER, SCRIPT_SIG, SIGNED)
                );
            }
            _ => panic!("wrong response variant"),
        }
    }

    #[test]
    fn altered_output_amount_branch_and_expiry_reach_checksig() {
        let output = rebuild(BranchId::Nu5, 0, |b| {
            let o = &b.vout[0];
            let mut s = o.script_pubkey().0.0.clone();
            s[3] ^= 1;
            b.vout[0] = TxOut::new(o.value(), Script(script::Code(s)));
        });
        checksig_reject(finalize(output, 100_000, BranchId::Nu5));
        checksig_reject(finalize(UNSIGNED, 100_001, BranchId::Nu5));
        checksig_reject(finalize(
            rebuild(BranchId::Nu6, 0, |_| {}),
            100_000,
            BranchId::Nu6,
        ));
        checksig_reject(finalize(
            rebuild(BranchId::Nu5, 1, |_| {}),
            100_000,
            BranchId::Nu5,
        ));
    }

    #[test]
    fn altered_valid_signature_reaches_checksig() {
        let mut r = finalize(UNSIGNED, 100_000, BranchId::Nu5);
        if let Request::Finalize {
            compact_signature_hex,
            ..
        } = &mut r
        {
            compact_signature_hex.replace_range(0..2, "5a");
        }
        checksig_reject(r);
    }

    #[test]
    fn malformed_and_high_s_signatures_are_precheck_rejections() {
        let mut r = finalize(UNSIGNED, 100_000, BranchId::Nu5);
        if let Request::Finalize {
            compact_signature_hex,
            ..
        } = &mut r
        {
            compact_signature_hex.truncate(126);
        }
        assert_eq!(execute(r).unwrap_err().code, "invalid_signature");
        let mut r = finalize(UNSIGNED, 100_000, BranchId::Nu5);
        if let Request::Finalize {
            compact_signature_hex,
            ..
        } = &mut r
        {
            *compact_signature_hex="3e4516da7253cf068effec6b95c41221c0cf3a8e6ccb8cbf1725b562e9afde2cab1e3da73d67e32045a20e0b999e049978ea8d6ee5480d485fcf2ce0d03b2ef0".to_owned();
        }
        assert_eq!(execute(r).unwrap_err().code, "high_s_signature");
    }

    #[test]
    fn invalid_and_mismatched_pubkeys_are_precheck_rejections() {
        let mut r = finalize(UNSIGNED, 100_000, BranchId::Nu5);
        if let Request::Finalize {
            compressed_pubkey_hex,
            ..
        } = &mut r
        {
            compressed_pubkey_hex.truncate(64);
        }
        assert_eq!(execute(r).unwrap_err().code, "invalid_pubkey");
        let mut r = finalize(UNSIGNED, 100_000, BranchId::Nu5);
        if let Request::Finalize {
            compressed_pubkey_hex,
            ..
        } = &mut r
        {
            *compressed_pubkey_hex =
                "03363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640".to_owned();
        }
        assert_eq!(execute(r).unwrap_err().code, "pubkey_hash_mismatch");
    }

    #[test]
    fn invalid_33_byte_sec1_pubkey_is_rejected() {
        let mut r = finalize(UNSIGNED, 100_000, BranchId::Nu5);
        if let Request::Finalize {
            compressed_pubkey_hex,
            ..
        } = &mut r
        {
            compressed_pubkey_hex.replace_range(0..2, "04");
        }
        assert_eq!(execute(r).unwrap_err().code, "invalid_pubkey");
    }

    #[test]
    fn parser_valid_transparent_v4_is_rejected() {
        assert_eq!(
            execute(digest(rebuild_v4(), 100_000, BranchId::Nu5))
                .unwrap_err()
                .code,
            "unsupported_version"
        );
    }

    #[test]
    fn parser_valid_v5_with_shielded_bundle_is_rejected() {
        assert_eq!(
            execute(digest(SHIELDED_V5, 100_000, BranchId::Nu5))
                .unwrap_err()
                .code,
            "shielded_bundle"
        );
    }

    #[test]
    fn branch_trailing_amount_and_fee_errors_are_typed() {
        let mut r = digest(UNSIGNED, 100_000, BranchId::Nu5);
        if let Request::Digest {
            expected_branch_id, ..
        } = &mut r
        {
            *expected_branch_id = "deadbeef".to_owned();
        }
        assert_eq!(execute(r).unwrap_err().code, "branch_mismatch");
        assert_eq!(
            execute(digest(format!("{UNSIGNED}00"), 100_000, BranchId::Nu5))
                .unwrap_err()
                .code,
            "trailing_bytes"
        );
        for amount in [-1, 2_100_000_000_000_001] {
            assert_eq!(
                execute(digest(UNSIGNED, amount, BranchId::Nu5))
                    .unwrap_err()
                    .code,
                "invalid_amount"
            );
        }
        assert_eq!(
            execute(digest(UNSIGNED, 89_999, BranchId::Nu5))
                .unwrap_err()
                .code,
            "negative_fee"
        );
    }

    #[test]
    fn bounded_shape_prechecks_reject() {
        let zero = rebuild(BranchId::Nu5, 0, |b| b.vin.clear());
        assert_eq!(
            execute(digest(zero, 100_000, BranchId::Nu5))
                .unwrap_err()
                .code,
            "input_count"
        );
        let two = rebuild(BranchId::Nu5, 0, |b| b.vin.push(b.vin[0].clone()));
        assert_eq!(
            execute(digest(two, 100_000, BranchId::Nu5))
                .unwrap_err()
                .code,
            "input_count"
        );
        let none = rebuild(BranchId::Nu5, 0, |b| b.vout.clear());
        assert_eq!(
            execute(digest(none, 100_000, BranchId::Nu5))
                .unwrap_err()
                .code,
            "empty_outputs"
        );
        assert_eq!(
            execute(digest(SIGNED, 100_000, BranchId::Nu5))
                .unwrap_err()
                .code,
            "prefilled_script_sig"
        );
        let mut r = digest(UNSIGNED, 100_000, BranchId::Nu5);
        if let Request::Digest {
            prevout_script_hex, ..
        } = &mut r
        {
            *prevout_script_hex = "51".to_owned();
        }
        assert_eq!(execute(r).unwrap_err().code, "unsupported_prevout_script");
    }

    #[test]
    fn json_schema_rejects_unknown_fields_and_operations() {
        let j = format!(
            r#"{{"operation":"digest","unsigned_tx_hex":"{UNSIGNED}","expected_branch_id":"c2d6d0b4","input_amount_zat":100000,"prevout_script_hex":"{PREVOUT}","surprise":true}}"#
        );
        assert_eq!(run_json(&j).unwrap_err().code, "invalid_json");
        assert_eq!(
            run_json(r#"{"operation":"sign"}"#).unwrap_err().code,
            "invalid_json"
        );
    }
}
