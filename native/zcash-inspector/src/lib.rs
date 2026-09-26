use std::io::{Cursor, ErrorKind, Read};

use serde::{Deserialize, Serialize};
use zcash_primitives::transaction::{Transaction, TxVersion};
use zcash_protocol::consensus::BranchId;

pub const MAX_RAW_TRANSACTION_BYTES: usize = 2_000_000;
pub const MAX_REQUEST_BYTES: usize = MAX_RAW_TRANSACTION_BYTES * 2 + 1_024;

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Request {
    pub raw_tx_hex: Option<String>,
    pub expected_branch_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct VersionInfo {
    pub kind: String,
    pub number: u32,
    pub header: String,
    pub version_group_id: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct TransparentInput {
    pub prevout_txid: String,
    pub prevout_index: u32,
    pub script_sig_hex: String,
    pub sequence: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct TransparentOutput {
    pub index: usize,
    pub value_zat: u64,
    pub script_pubkey_hex: String,
    pub script_kind: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct TransparentSummary {
    pub present: bool,
    pub inputs: Vec<TransparentInput>,
    pub outputs: Vec<TransparentOutput>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct ShieldedSummary {
    pub present: bool,
    pub sprout_joinsplits: usize,
    pub sapling_spends: usize,
    pub sapling_outputs: usize,
    pub orchard_actions: usize,
    pub ironwood_actions: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct Inspection {
    pub txid: String,
    pub version: VersionInfo,
    pub consensus_branch_id: String,
    pub branch_source: String,
    pub lock_time: u32,
    pub expiry_height: u32,
    pub coinbase: bool,
    pub fully_transparent: bool,
    pub transparent: TransparentSummary,
    pub shielded: ShieldedSummary,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct ToolError {
    pub code: String,
    pub message: String,
}

impl ToolError {
    fn new(code: &str, message: impl Into<String>) -> Self {
        Self {
            code: code.to_owned(),
            message: message.into(),
        }
    }
}

fn parse_branch(value: Option<&str>) -> Result<BranchId, ToolError> {
    let value = value.ok_or_else(|| {
        ToolError::new(
            "missing_branch_id",
            "expected_branch_id is required for transaction interpretation",
        )
    })?;
    if value.len() != 8
        || !value
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
    {
        return Err(ToolError::new(
            "invalid_branch_id",
            "expected_branch_id must be exactly eight lowercase hexadecimal digits",
        ));
    }
    let raw = u32::from_str_radix(value, 16).map_err(|e| {
        ToolError::new(
            "invalid_branch_id",
            format!("expected_branch_id could not be parsed: {e}"),
        )
    })?;
    BranchId::try_from(raw).map_err(|_| {
        ToolError::new(
            "unsupported_branch_id",
            format!("expected_branch_id {value} is not known by the pinned library"),
        )
    })
}

fn version_error(error: std::io::Error) -> ToolError {
    match error.kind() {
        ErrorKind::UnexpectedEof => ToolError::new(
            "truncated_transaction",
            "transaction ended before its format header was complete",
        ),
        ErrorKind::InvalidData => ToolError::new(
            "unsupported_transaction_format",
            "transaction version or version-group identifier is not supported by the pinned library",
        ),
        _ => ToolError::new(
            "malformed_transaction",
            format!("transaction format header could not be read: {error}"),
        ),
    }
}

fn transaction_error(error: std::io::Error) -> ToolError {
    if error.kind() == ErrorKind::UnexpectedEof {
        ToolError::new(
            "truncated_transaction",
            "transaction ended before all encoded fields were present",
        )
    } else {
        ToolError::new(
            "malformed_transaction",
            format!("transaction decoding failed: {error}"),
        )
    }
}

fn decode_raw(value: Option<&str>) -> Result<Vec<u8>, ToolError> {
    let value = value.filter(|value| !value.is_empty()).ok_or_else(|| {
        ToolError::new(
            "missing_raw_transaction",
            "raw_tx_hex must contain a serialized transaction",
        )
    })?;
    if value.len() > MAX_RAW_TRANSACTION_BYTES * 2 {
        return Err(ToolError::new(
            "raw_transaction_too_large",
            format!(
                "raw transaction exceeds the {MAX_RAW_TRANSACTION_BYTES}-byte inspection limit"
            ),
        ));
    }
    if value.len() % 2 != 0
        || !value
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
    {
        return Err(ToolError::new(
            "noncanonical_hex",
            "raw_tx_hex must be nonempty, even-length lowercase hexadecimal without a prefix",
        ));
    }
    hex::decode(value).map_err(|e| {
        ToolError::new(
            "invalid_hex",
            format!("raw_tx_hex could not be decoded: {e}"),
        )
    })
}

fn version_info(version: TxVersion) -> VersionInfo {
    let (kind, number) = match version {
        TxVersion::Sprout(number) => ("sprout", number),
        TxVersion::V3 => ("v3", 3),
        TxVersion::V4 => ("v4", 4),
        TxVersion::V5 => ("v5", 5),
        TxVersion::V6 => ("v6", 6),
    };
    VersionInfo {
        kind: kind.to_owned(),
        number,
        header: format!("{:08x}", version.header()),
        version_group_id: format!("{:08x}", version.version_group_id()),
    }
}

pub fn inspect(request: Request) -> Result<Inspection, ToolError> {
    let expected_branch = parse_branch(request.expected_branch_id.as_deref())?;
    let bytes = decode_raw(request.raw_tx_hex.as_deref())?;

    let mut header = Cursor::new(bytes.as_slice());
    let version = TxVersion::read(&mut header).map_err(version_error)?;
    let embedded_branch = if matches!(version, TxVersion::V5 | TxVersion::V6) {
        let mut raw = [0u8; 4];
        header.read_exact(&mut raw).map_err(transaction_error)?;
        Some(BranchId::try_from(u32::from_le_bytes(raw)).map_err(|_| {
            ToolError::new(
                "unsupported_branch_id",
                "transaction embeds a branch identifier unknown to the pinned library",
            )
        })?)
    } else {
        None
    };

    if !version.valid_in_branch(expected_branch) {
        return Err(ToolError::new(
            "branch_mismatch",
            format!(
                "transaction version {} is not valid in expected branch {:08x}",
                version_info(version).kind,
                u32::from(expected_branch)
            ),
        ));
    }
    if embedded_branch.is_some_and(|actual| actual != expected_branch) {
        return Err(ToolError::new(
            "branch_mismatch",
            format!(
                "transaction embeds branch {:08x}, expected {:08x}",
                u32::from(embedded_branch.expect("checked as present")),
                u32::from(expected_branch)
            ),
        ));
    }

    let mut cursor = Cursor::new(bytes.as_slice());
    let tx = Transaction::read(&mut cursor, expected_branch).map_err(transaction_error)?;
    if cursor.position() as usize != bytes.len() {
        return Err(ToolError::new(
            "trailing_bytes",
            "raw_tx_hex contains bytes after the complete transaction",
        ));
    }
    let mut canonical = Vec::with_capacity(bytes.len());
    tx.write(&mut canonical).map_err(|e| {
        ToolError::new(
            "noncanonical_transaction",
            format!("parsed transaction could not be canonically serialized: {e}"),
        )
    })?;
    if canonical != bytes {
        return Err(ToolError::new(
            "noncanonical_transaction",
            "transaction bytes are not preserved by canonical reserialization",
        ));
    }

    let transparent = tx.transparent_bundle();
    let inputs = transparent
        .into_iter()
        .flat_map(|bundle| bundle.vin.iter())
        .map(|input| TransparentInput {
            prevout_txid: input.prevout().txid().to_string(),
            prevout_index: input.prevout().n(),
            script_sig_hex: hex::encode(&input.script_sig().0.0),
            sequence: input.sequence(),
        })
        .collect();
    let outputs = transparent
        .into_iter()
        .flat_map(|bundle| bundle.vout.iter().enumerate())
        .map(|(index, output)| TransparentOutput {
            index,
            value_zat: u64::from(output.value()),
            script_pubkey_hex: hex::encode(&output.script_pubkey().0.0),
            script_kind: output
                .script_kind()
                .map(|kind| kind.as_str().to_owned())
                .unwrap_or_else(|| "nonstandard".to_owned()),
        })
        .collect();

    let sprout_joinsplits = tx
        .sprout_bundle()
        .map(|bundle| bundle.joinsplits.len())
        .unwrap_or(0);
    let (sapling_spends, sapling_outputs) = tx
        .sapling_bundle()
        .map(|bundle| {
            (
                bundle.shielded_spends().len(),
                bundle.shielded_outputs().len(),
            )
        })
        .unwrap_or((0, 0));
    let orchard_actions = tx
        .orchard_bundle()
        .map(|bundle| bundle.actions().len())
        .unwrap_or(0);
    let ironwood_actions = tx
        .ironwood_bundle()
        .map(|bundle| bundle.actions().len())
        .unwrap_or(0);
    let shielded_present = sprout_joinsplits > 0
        || sapling_spends > 0
        || sapling_outputs > 0
        || orchard_actions > 0
        || ironwood_actions > 0;
    let coinbase = transparent.is_some_and(|bundle| bundle.is_coinbase());

    Ok(Inspection {
        txid: tx.txid().to_string(),
        version: version_info(version),
        consensus_branch_id: format!("{:08x}", u32::from(tx.consensus_branch_id())),
        branch_source: if embedded_branch.is_some() {
            "embedded".to_owned()
        } else {
            "context".to_owned()
        },
        lock_time: tx.lock_time(),
        expiry_height: u32::from(tx.expiry_height()),
        coinbase,
        fully_transparent: !shielded_present,
        transparent: TransparentSummary {
            present: transparent.is_some(),
            inputs,
            outputs,
        },
        shielded: ShieldedSummary {
            present: shielded_present,
            sprout_joinsplits,
            sapling_spends,
            sapling_outputs,
            orchard_actions,
            ironwood_actions,
        },
    })
}

pub fn run_json(input: &str) -> Result<Inspection, ToolError> {
    // Serde's derived struct visitor also accepts positional arrays. Restrict
    // the CLI shape before decoding directly, retaining duplicate-field errors.
    if !input
        .trim_start_matches([' ', '\t', '\r', '\n'])
        .starts_with('{')
    {
        return Err(ToolError::new(
            "invalid_json",
            "request JSON must be one object, not a positional array or scalar",
        ));
    }
    let request = serde_json::from_str(input)
        .map_err(|e| ToolError::new("invalid_json", format!("request JSON is invalid: {e}")))?;
    inspect(request)
}

pub fn run_reader<R: Read>(reader: R) -> Result<Inspection, ToolError> {
    let mut bytes = Vec::new();
    reader
        .take((MAX_REQUEST_BYTES + 1) as u64)
        .read_to_end(&mut bytes)
        .map_err(|e| {
            ToolError::new("input_read_failed", format!("stdin could not be read: {e}"))
        })?;
    if bytes.len() > MAX_REQUEST_BYTES {
        return Err(ToolError::new(
            "input_too_large",
            format!("JSON input exceeds the {MAX_REQUEST_BYTES}-byte limit"),
        ));
    }
    let text = std::str::from_utf8(&bytes)
        .map_err(|e| ToolError::new("invalid_json", format!("request is not UTF-8: {e}")))?;
    run_json(text)
}
