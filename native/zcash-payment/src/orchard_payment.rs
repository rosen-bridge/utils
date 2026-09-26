//! Isolated, fixed-Nu6.2 Orchard payment path. The signable PCZT is the frozen proposal.
use std::{convert::Infallible, sync::OnceLock};

use orchard::{keys::OutgoingViewingKey, note_encryption::OrchardDomain};
use pczt::{
    Pczt,
    roles::{
        creator::Creator,
        io_finalizer::IoFinalizer,
        prover::Prover,
        signer::Signer,
        spend_finalizer::SpendFinalizer,
        tx_extractor::TransactionExtractor,
        updater::Updater,
        verifier::{OrchardError, Verifier},
    },
};
use rand_core::{OsRng, RngCore};
use secp256k1::PublicKey;
use serde::Deserialize;
use sha2::{Digest as _, Sha256};
use zcash_address::{
    ConversionError, TryFromAddress, ZcashAddress,
    unified::{self, Container},
};
use zcash_note_encryption::try_output_recovery_with_ovk;
use zcash_primitives::transaction::{
    Authorization as TransactionAuthorization, Transaction,
    builder::{BuildConfig, Builder, BundlePadding},
    fees::zip317::FeeRule,
    sighash::{SignableInput, signature_hash},
    txid::{TxIdDigester, to_txid},
};
use zcash_protocol::{
    consensus::{BlockHeight, BranchId, Network, NetworkType, NetworkUpgrade, Parameters},
    local_consensus::LocalNetwork,
    memo::MemoBytes,
    value::Zatoshis,
};
use zcash_transparent::{
    address::{Script, TransparentAddress},
    bundle::{Authorization as TransparentAuthorization, MapAuth, OutPoint, TxOut},
    sighash::TransparentAuthorizingContext,
};

use crate::{
    ConstructInput, Response, ToolError, decode_hex, parse_display_txid, parse_external_pubkey,
    require_p2pkh,
};

const BRANCH: &str = "5437f330";
const TEST_HEIGHT_START: u32 = 4_052_000;
const TEST_HEIGHT_END: u32 = 4_134_000;
const OUTPUT_OVK_KEY: &str = "rosen:output-ovk";

fn verifying_key() -> &'static orchard::circuit::VerifyingKey {
    static KEY: OnceLock<orchard::circuit::VerifyingKey> = OnceLock::new();
    KEY.get_or_init(|| {
        orchard::circuit::VerifyingKey::build(
            orchard::circuit::OrchardCircuitVersion::FixedPostNu6_2,
        )
    })
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct OrchardIntent {
    pub network: OrchardNetwork,
    pub expected_branch_id: String,
    pub target_height: u32,
    pub expiry_height: u32,
    pub input: ConstructInput,
    pub compressed_pubkey_hex: String,
    pub recipient_ua: String,
    pub payout_zat: u64,
    pub change_zat: u64,
}

#[derive(Clone, Copy, Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OrchardNetwork {
    TestnetNu6_2,
    RegtestNu6_2AtTwo,
}

#[derive(Clone)]
enum PaymentParameters {
    Testnet,
    Regtest(LocalNetwork),
}

impl Parameters for PaymentParameters {
    fn network_type(&self) -> NetworkType {
        match self {
            Self::Testnet => NetworkType::Test,
            Self::Regtest(_) => NetworkType::Regtest,
        }
    }

    fn activation_height(&self, nu: NetworkUpgrade) -> Option<BlockHeight> {
        match self {
            Self::Testnet => Network::TestNetwork.activation_height(nu),
            Self::Regtest(params) => params.activation_height(nu),
        }
    }
}

impl OrchardNetwork {
    fn params(self) -> PaymentParameters {
        match self {
            Self::TestnetNu6_2 => PaymentParameters::Testnet,
            Self::RegtestNu6_2AtTwo => {
                let one = Some(BlockHeight::from_u32(1));
                let two = Some(BlockHeight::from_u32(2));
                PaymentParameters::Regtest(LocalNetwork {
                    overwinter: one,
                    sapling: one,
                    blossom: one,
                    heartwood: one,
                    canopy: one,
                    nu5: two,
                    nu6: two,
                    nu6_1: two,
                    nu6_2: two,
                    nu6_3: None,
                })
            }
        }
    }

    fn height_supported(self, target: u32, expiry: u32) -> bool {
        match self {
            Self::TestnetNu6_2 => {
                (TEST_HEIGHT_START..TEST_HEIGHT_END).contains(&target)
                    && (TEST_HEIGHT_START..TEST_HEIGHT_END).contains(&expiry)
            }
            Self::RegtestNu6_2AtTwo => target >= 2,
        }
    }
}

fn invalid(message: impl Into<String>) -> ToolError {
    ToolError::new("orchard_intent_rejected", message)
}

struct OrchardReceiver(orchard::Address);
impl TryFromAddress for OrchardReceiver {
    type Error = &'static str;
    fn try_from_unified(
        _: NetworkType,
        ua: unified::Address,
    ) -> Result<Self, ConversionError<Self::Error>> {
        let raw = ua
            .items()
            .into_iter()
            .find_map(|r| match r {
                unified::Receiver::Orchard(raw) => Some(raw),
                _ => None,
            })
            .ok_or(ConversionError::User("UA has no Orchard receiver"))?;
        orchard::Address::from_raw_address_bytes(&raw)
            .into_option()
            .map(Self)
            .ok_or(ConversionError::User("invalid Orchard receiver"))
    }
}

fn receiver(intent: &OrchardIntent) -> Result<orchard::Address, ToolError> {
    let ua = ZcashAddress::try_from_encoded(&intent.recipient_ua)
        .map_err(|e| invalid(format!("invalid Unified Address: {e}")))?;
    let parsed = ua
        .convert_if_network::<OrchardReceiver>(intent.network.params().network_type())
        .map_err(|e| invalid(format!("unsupported Orchard recipient network: {e}")))?;
    Ok(parsed.0)
}

struct Checked {
    recipient: orchard::Address,
    pubkey: PublicKey,
    input_script: Vec<u8>,
    input_value: Zatoshis,
    change_value: Zatoshis,
    fee: u64,
    outpoint: [u8; 32],
}

#[derive(Debug)]
struct SignedSighashTransparentAuth {
    prevout: TxOut,
}

impl TransparentAuthorization for SignedSighashTransparentAuth {
    type ScriptSig = Script;
}

impl TransparentAuthorizingContext for SignedSighashTransparentAuth {
    fn input_amounts(&self) -> Vec<Zatoshis> {
        vec![self.prevout.value()]
    }

    fn input_scriptpubkeys(&self) -> Vec<Script> {
        vec![self.prevout.script_pubkey().clone()]
    }
}

struct SignedSighashAuth;
impl TransactionAuthorization for SignedSighashAuth {
    type TransparentAuth = SignedSighashTransparentAuth;
    type SaplingAuth = sapling::bundle::Authorized;
    type OrchardAuth = orchard::bundle::Authorized;
}

struct AttachPrevout(TxOut);
impl MapAuth<zcash_transparent::bundle::Authorized, SignedSighashTransparentAuth>
    for AttachPrevout
{
    fn map_script_sig(&self, script: Script) -> Script {
        script
    }

    fn map_authorization(
        &self,
        _: zcash_transparent::bundle::Authorized,
    ) -> SignedSighashTransparentAuth {
        SignedSighashTransparentAuth {
            prevout: self.0.clone(),
        }
    }
}
fn check_intent(intent: &OrchardIntent) -> Result<Checked, ToolError> {
    if intent.expected_branch_id != BRANCH
        || !intent
            .network
            .height_supported(intent.target_height, intent.expiry_height)
        || intent.expiry_height < intent.target_height
        || intent.expiry_height > intent.target_height.saturating_add(40)
    {
        return Err(invalid(
            "only selected Nu6.2 v5 network heights and a 40-block expiry window are supported",
        ));
    }
    if intent.input.sequence != u32::MAX || intent.payout_zat == 0 || intent.change_zat == 0 {
        return Err(invalid(
            "requires final input sequence, positive payout and transparent change",
        ));
    }
    let script = decode_hex("script_pubkey_hex", &intent.input.script_pubkey_hex)?;
    let pubkey = PublicKey::from_slice(&parse_external_pubkey(
        &intent.compressed_pubkey_hex,
        require_p2pkh(&script)?,
    )?)
    .map_err(|e| invalid(format!("reserve pubkey: {e}")))?;
    let input_value = Zatoshis::from_nonnegative_i64(intent.input.amount_zat)
        .map_err(|_| invalid("invalid input amount"))?;
    let payout = Zatoshis::from_u64(intent.payout_zat).map_err(|_| invalid("invalid payout"))?;
    let change_value =
        Zatoshis::from_u64(intent.change_zat).map_err(|_| invalid("invalid change"))?;
    let fee = u64::from(input_value)
        .checked_sub(intent.payout_zat)
        .and_then(|x| x.checked_sub(intent.change_zat))
        .ok_or_else(|| invalid("outputs exceed input"))?;
    if fee != 15_000 {
        return Err(invalid(
            "fixed one-input Orchard payment requires the ZIP-317 15000-zat fee",
        ));
    }
    let _ = payout;
    let outpoint = parse_display_txid(&intent.input.prevout_txid, intent.input.prevout_index)?;
    Ok(Checked {
        recipient: receiver(intent)?,
        pubkey,
        input_script: script,
        input_value,
        change_value,
        fee,
        outpoint,
    })
}

fn verify_pczt(intent: &OrchardIntent, pczt: Pczt) -> Result<(Pczt, [u8; 32], u64), ToolError> {
    let expected = check_intent(intent)?;
    let global = pczt.global();
    if *global.tx_version() != 5
        || *global.consensus_branch_id() != u32::from(BranchId::Nu6_2)
        || global.fallback_lock_time().unwrap_or(0) != 0
        || *global.expiry_height() != intent.expiry_height
        || !pczt.sapling().spends().is_empty()
        || !pczt.sapling().outputs().is_empty()
        || !pczt.ironwood().actions().is_empty()
    {
        return Err(invalid(
            "PCZT branch, version, expiry, or extra shielded pool differs",
        ));
    }
    let transparent = pczt.transparent();
    if transparent.inputs().len() != 1 || transparent.outputs().len() != 1 {
        return Err(invalid(
            "PCZT must have exactly one reserve input and one transparent change",
        ));
    }
    let input = &transparent.inputs()[0];
    let output = &transparent.outputs()[0];
    let expected_script = Script::from(TransparentAddress::from_pubkey(&expected.pubkey).script());
    if input.prevout_txid().as_ref() != expected.outpoint
        || *input.prevout_index() != intent.input.prevout_index
        || input.sequence().unwrap_or(u32::MAX) != intent.input.sequence
        || input.required_time_lock_time().is_some()
        || input.required_height_lock_time().is_some()
        || input.script_sig().is_some()
        || !input.partial_signatures().is_empty()
        || *input.sighash_type() != 1
        || *input.value() != u64::from(expected.input_value)
        || input.script_pubkey() != &expected.input_script
        || *output.value() != u64::from(expected.change_value)
        || output.script_pubkey() != &expected_script.0.0
    {
        return Err(invalid(
            "PCZT reserve input or transparent change differs from intent",
        ));
    }
    let receiver_raw = expected.recipient.to_raw_address_bytes();
    let payout = intent.payout_zat;
    let pczt = Verifier::new(pczt)
        .with_orchard::<String, _>(|bundle| {
            if bundle.actions().len() != 2 {
                return Err(OrchardError::Custom("wrong Orchard action count".into()));
            }
            let mut positive = 0;
            for action in bundle.actions() {
                let output = action.output();
                output
                    .verify_note_commitment(action.spend())
                    .map_err(OrchardError::Verify)?;
                let declared = output
                    .value()
                    .as_ref()
                    .ok_or_else(|| OrchardError::Custom("missing Orchard value".into()))?
                    .inner();
                if declared > 0 {
                    positive += 1;
                    if declared != payout
                        || output
                            .recipient()
                            .as_ref()
                            .map(|a| a.to_raw_address_bytes())
                            != Some(receiver_raw)
                    {
                        return Err(OrchardError::Custom(
                            "Orchard declared recipient or value differs".into(),
                        ));
                    }
                    let ovk_bytes: [u8; 32] = output
                        .proprietary()
                        .get(OUTPUT_OVK_KEY)
                        .ok_or_else(|| {
                            OrchardError::Custom("Orchard output recovery witness absent".into())
                        })?
                        .as_slice()
                        .try_into()
                        .map_err(|_| {
                            OrchardError::Custom("Orchard output recovery witness malformed".into())
                        })?;
                    let ovk = OutgoingViewingKey::from(ovk_bytes);
                    let domain = OrchardDomain::for_pczt_action(action);
                    let (note, address, _) = try_output_recovery_with_ovk(
                        &domain,
                        &ovk,
                        action,
                        action.cv_net(),
                        &output.encrypted_note().out_ciphertext,
                    )
                    .ok_or_else(|| {
                        OrchardError::Custom("Orchard ciphertext does not recover".into())
                    })?;
                    if note.value().inner() != payout
                        || address.to_raw_address_bytes() != receiver_raw
                        || orchard::note::ExtractedNoteCommitment::from(note.commitment())
                            != *output.cmx()
                    {
                        return Err(OrchardError::Custom(
                            "Orchard ciphertext recipient, value or cmx differs".into(),
                        ));
                    }
                }
            }
            if positive != 1 {
                return Err(OrchardError::Custom(
                    "requires one value-carrying Orchard output".into(),
                ));
            }
            let instances = bundle
                .actions()
                .iter()
                .map(|action| {
                    orchard::circuit::Instance::from_parts(
                        *bundle.anchor(),
                        action.cv_net().clone(),
                        *action.spend().nullifier(),
                        action.spend().rk().clone(),
                        *action.output().cmx(),
                        *bundle.flags(),
                    )
                })
                .collect::<Option<Vec<_>>>()
                .ok_or_else(|| OrchardError::Custom("invalid Orchard circuit instance".into()))?;
            let proof = bundle
                .zkproof()
                .as_ref()
                .ok_or_else(|| OrchardError::Custom("Orchard proof absent".into()))?;
            proof
                .verify(verifying_key(), &instances)
                .map_err(|e| OrchardError::Custom(format!("Orchard proof invalid: {e:?}")))?;
            Ok(())
        })
        .map_err(|e| invalid(format!("Orchard verification failed: {e:?}")))?
        .finish();
    let signer =
        Signer::new(pczt.clone()).map_err(|e| invalid(format!("signer refused PCZT: {e:?}")))?;
    let sighash = signer
        .transparent_sighash(0)
        .map_err(|e| invalid(format!("transparent digest unavailable: {e:?}")))?;
    Ok((pczt, sighash, expected.fee))
}

fn frozen(
    intent: &OrchardIntent,
    pczt_hex: &str,
) -> Result<(Pczt, [u8; 32], u64, String), ToolError> {
    let bytes = decode_hex("pczt_hex", pczt_hex)?;
    let pczt = Pczt::parse(&bytes).map_err(|e| invalid(format!("PCZT parse failed: {e:?}")))?;
    let (pczt, digest, fee) = verify_pczt(intent, pczt)?;
    Ok((pczt, digest, fee, hex::encode(Sha256::digest(&bytes))))
}

fn effect_txid(pczt: &Pczt) -> Result<String, ToolError> {
    let effects = pczt
        .clone()
        .into_effects()
        .map_err(|e| invalid(format!("PCZT effects unavailable: {e:?}")))?;
    let txid = to_txid(
        effects.version(),
        effects.consensus_branch_id(),
        &effects.digest(TxIdDigester),
    );
    Ok(hex::encode(txid.as_ref()))
}

pub fn prepare(intent: OrchardIntent) -> Result<Response, ToolError> {
    let checked = check_intent(&intent)?;
    let mut builder = Builder::new(
        intent.network.params(),
        BlockHeight::from_u32(intent.target_height),
        BuildConfig::Standard {
            sapling_anchor: None,
            orchard_anchor: Some(orchard::Anchor::empty_tree()),
            ironwood_anchor: None,
            orchard_padding: BundlePadding::DEFAULT,
            ironwood_padding: BundlePadding::DEFAULT,
        },
    )
    .with_expiry_height(BlockHeight::from_u32(intent.expiry_height));
    builder
        .add_transparent_p2pkh_input(
            checked.pubkey,
            OutPoint::new(checked.outpoint, intent.input.prevout_index),
            TxOut::new(
                checked.input_value,
                TransparentAddress::from_pubkey(&checked.pubkey)
                    .script()
                    .into(),
            ),
        )
        .map_err(|e| invalid(format!("reserve input rejected: {e:?}")))?;
    let mut ovk_bytes = [0u8; 32];
    OsRng.fill_bytes(&mut ovk_bytes);
    builder
        .add_orchard_output::<Infallible>(
            Some(OutgoingViewingKey::from(ovk_bytes)),
            checked.recipient,
            Zatoshis::from_u64(intent.payout_zat).unwrap(),
            MemoBytes::empty(),
        )
        .map_err(|e| invalid(format!("Orchard output rejected: {e:?}")))?;
    builder
        .add_transparent_output(
            &TransparentAddress::from_pubkey(&checked.pubkey),
            checked.change_value,
        )
        .map_err(|e| invalid(format!("change rejected: {e:?}")))?;
    let built = builder
        .build_for_pczt(OsRng, &FeeRule::standard())
        .map_err(|e| invalid(format!("ZIP-317 builder rejected payment: {e:?}")))?;
    let pczt = Creator::build_from_parts(built.pczt_parts)
        .ok_or_else(|| invalid("PCZT creator failed"))?;
    let pczt = Updater::new(pczt)
        .update_transparent_with(|mut bundle| {
            bundle.update_input_with(0, |mut input| {
                input.set_hash160_preimage(checked.pubkey.serialize().to_vec());
                Ok(())
            })
        })
        .map_err(|e| invalid(format!("reserve witness failed: {e:?}")))?
        .finish();
    let pczt = Updater::new(pczt)
        .update_orchard_with(|mut bundle| {
            let paying: Vec<_> = bundle
                .bundle()
                .actions()
                .iter()
                .enumerate()
                .filter_map(|(i, action)| {
                    action
                        .output()
                        .value()
                        .as_ref()
                        .is_some_and(|v| v.inner() > 0)
                        .then_some(i)
                })
                .collect();
            for i in paying {
                bundle.update_action_with(i, |mut action| {
                    action.set_output_proprietary(OUTPUT_OVK_KEY.into(), ovk_bytes.to_vec());
                    Ok(())
                })?;
            }
            Ok(())
        })
        .map_err(|e| invalid(format!("Orchard output witness failed: {e:?}")))?
        .finish();
    let key = orchard::circuit::ProvingKey::build(
        orchard::circuit::OrchardCircuitVersion::FixedPostNu6_2,
    );
    let pczt = Prover::new(pczt)
        .create_orchard_proof(&key)
        .map_err(|e| invalid(format!("Orchard proof failed: {e:?}")))?
        .finish();
    let pczt = IoFinalizer::new(pczt)
        .finalize_io()
        .map_err(|e| invalid(format!("PCZT IO finalizer failed: {e:?}")))?;
    let bytes = pczt
        .clone()
        .serialize()
        .map_err(|e| invalid(format!("PCZT encoding failed: {e:?}")))?;
    let hex = hex::encode(&bytes);
    let (verified, digest, fee, fingerprint) = frozen(&intent, &hex)?;
    Ok(Response::OrchardPrepare {
        pczt_hex: hex,
        txid_raw: effect_txid(&verified)?,
        fingerprint_sha256: fingerprint,
        sighash_all: hex::encode(digest),
        actual_fee_zat: fee,
        recipient_ciphertext_verified: true,
        orchard_proof_verified: true,
    })
}

pub fn verify(intent: OrchardIntent, pczt_hex: &str) -> Result<Response, ToolError> {
    let (verified, digest, fee, fingerprint) = frozen(&intent, pczt_hex)?;
    Ok(Response::OrchardVerify {
        txid_raw: effect_txid(&verified)?,
        fingerprint_sha256: fingerprint,
        sighash_all: hex::encode(digest),
        actual_fee_zat: fee,
        recipient_ciphertext_verified: true,
        orchard_proof_verified: true,
    })
}

pub fn finalize(
    intent: OrchardIntent,
    pczt_hex: &str,
    fingerprint_sha256: &str,
    compact_signature_hex: &str,
) -> Result<Response, ToolError> {
    let (pczt, digest, _, fingerprint) = frozen(&intent, pczt_hex)?;
    let proposed_txid = effect_txid(&pczt)?;
    if fingerprint != fingerprint_sha256 {
        return Err(invalid("PCZT fingerprint differs from TSS proposal"));
    }
    let signature_bytes = decode_hex("compact_signature_hex", compact_signature_hex)?;
    let signature = secp256k1::ecdsa::Signature::from_compact(&signature_bytes)
        .map_err(|e| invalid(format!("invalid compact signature: {e}")))?;
    let mut signer =
        Signer::new(pczt).map_err(|e| invalid(format!("signer refused PCZT: {e:?}")))?;
    if signer
        .transparent_sighash(0)
        .map_err(|e| invalid(format!("digest unavailable: {e:?}")))?
        != digest
    {
        return Err(invalid("signing digest changed"));
    }
    signer
        .append_transparent_signature(0, signature)
        .map_err(|e| invalid(format!("external signature rejected: {e:?}")))?;
    let pczt = SpendFinalizer::new(signer.finish())
        .finalize_spends()
        .map_err(|e| invalid(format!("spend finalizer rejected signature: {e:?}")))?;
    let tx = TransactionExtractor::new(pczt)
        .with_orchard(verifying_key())
        .extract()
        .map_err(|e| invalid(format!("transaction extraction failed: {e:?}")))?;
    if hex::encode(tx.txid().as_ref()) != proposed_txid {
        return Err(invalid(
            "signed transaction ID differs from frozen PCZT effects",
        ));
    }
    let mut bytes = Vec::new();
    tx.write(&mut bytes)
        .map_err(|e| invalid(format!("transaction serialization failed: {e}")))?;
    Ok(Response::OrchardFinalize {
        signed_tx_hex: hex::encode(bytes),
        signed_txid_raw: hex::encode(tx.txid().as_ref()),
        fingerprint_sha256: fingerprint,
        sighash_all: hex::encode(digest),
        recipient_ciphertext_verified: true,
        orchard_proof_verified: true,
    })
}

/// Validates a saved signed transaction without trying to reproduce randomized
/// Orchard binding-signature bytes. The binding signature occupies the final
/// 64 bytes of this fixed v5, Orchard-only shielded transaction shape.
pub fn verify_signed(
    intent: OrchardIntent,
    pczt_hex: &str,
    fingerprint_sha256: &str,
    compact_signature_hex: &str,
    signed_tx_hex: &str,
) -> Result<Response, ToolError> {
    let checked = check_intent(&intent)?;
    let prevout = TxOut::new(
        checked.input_value,
        TransparentAddress::from_pubkey(&checked.pubkey)
            .script()
            .into(),
    );
    let Response::OrchardFinalize {
        signed_tx_hex: expected_hex,
        signed_txid_raw: expected_txid,
        fingerprint_sha256: fingerprint,
        sighash_all,
        ..
    } = finalize(intent, pczt_hex, fingerprint_sha256, compact_signature_hex)?
    else {
        unreachable!()
    };
    let expected = hex::decode(expected_hex).expect("finalizer produced hex");
    let submitted = decode_hex("signed_tx_hex", signed_tx_hex)?;
    if submitted.len() < 64
        || submitted.len() != expected.len()
        || submitted[..submitted.len() - 64] != expected[..expected.len() - 64]
    {
        return Err(invalid(
            "signed transaction differs outside Orchard binding signature",
        ));
    }
    let mut cursor = std::io::Cursor::new(submitted.as_slice());
    let tx = Transaction::read(&mut cursor, BranchId::Nu6_2)
        .map_err(|e| invalid(format!("signed transaction cannot be parsed: {e}")))?;
    let expected_txid_bytes = hex::decode(&expected_txid).expect("finalizer produced txid hex");
    if cursor.position() != submitted.len() as u64
        || tx.txid().as_ref().as_slice() != expected_txid_bytes.as_slice()
    {
        return Err(invalid("signed transaction encoding or effects differ"));
    }
    let mut canonical = Vec::new();
    tx.write(&mut canonical)
        .map_err(|e| invalid(format!("signed transaction cannot be serialized: {e}")))?;
    if canonical != submitted {
        return Err(invalid("signed transaction is not canonical"));
    }
    let data = tx.into_data();
    if data.consensus_branch_id() != BranchId::Nu6_2
        || data.sapling_bundle().is_some()
        || data.ironwood_bundle().is_some()
    {
        return Err(invalid("signed transaction shielded shape differs"));
    }
    let hash_data = data.map_bundles::<SignedSighashAuth>(
        |bundle| bundle.map(|bundle| bundle.map_authorization(AttachPrevout(prevout))),
        |bundle| bundle,
        |bundle| bundle,
    );
    let digests = hash_data.digest(TxIdDigester);
    let shielded_sighash = signature_hash(&hash_data, &SignableInput::Shielded, &digests);
    let bundle = hash_data
        .orchard_bundle()
        .ok_or_else(|| invalid("signed Orchard bundle absent"))?;
    let mut validator = orchard::bundle::BatchValidator::new(verifying_key());
    validator
        .add_bundle(bundle, *shielded_sighash.as_ref())
        .map_err(|e| invalid(format!("Orchard verification rejected bundle: {e}")))?;
    if !validator.validate(OsRng) {
        return Err(invalid("signed Orchard proof or authorization invalid"));
    }
    Ok(Response::OrchardVerifySigned {
        signed_txid_raw: expected_txid,
        fingerprint_sha256: fingerprint,
        sighash_all,
        recipient_ciphertext_verified: true,
        orchard_proof_verified: true,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use orchard::keys::{FullViewingKey, Scope, SpendingKey};
    use secp256k1::{Message, Secp256k1, SecretKey};
    use zcash_address::unified::Encoding;

    #[test]
    fn synthetic_orchard_payment_and_mutated_intent() {
        let reserve_key = SecretKey::from_slice(&[1u8; 32]).unwrap();
        let pubkey = PublicKey::from_secret_key(&Secp256k1::new(), &reserve_key);
        let recipient_key = SpendingKey::from_bytes([0u8; 32]).unwrap();
        let recipient_fvk = FullViewingKey::from(&recipient_key);
        let recipient = recipient_fvk.address_at(0u32, Scope::External);
        let ua = unified::Address::try_from_items(vec![
            unified::Receiver::Orchard(recipient.to_raw_address_bytes()),
            unified::Receiver::P2pkh([7u8; 20]),
        ])
        .unwrap()
        .encode(&NetworkType::Test);
        let intent = OrchardIntent {
            network: OrchardNetwork::TestnetNu6_2,
            expected_branch_id: BRANCH.into(),
            target_height: 4_052_100,
            expiry_height: 4_052_120,
            input: ConstructInput {
                prevout_txid: "02".repeat(32),
                prevout_index: 0,
                sequence: u32::MAX,
                amount_zat: 100_000,
                script_pubkey_hex: hex::encode(
                    Script::from(TransparentAddress::from_pubkey(&pubkey).script())
                        .0
                        .0,
                ),
            },
            compressed_pubkey_hex: hex::encode(pubkey.serialize()),
            recipient_ua: ua,
            payout_zat: 80_000,
            change_zat: 5_000,
        };
        let Response::OrchardPrepare {
            pczt_hex,
            txid_raw: proposed_txid,
            fingerprint_sha256,
            sighash_all,
            actual_fee_zat,
            recipient_ciphertext_verified,
            orchard_proof_verified,
        } = prepare(intent).unwrap()
        else {
            panic!("wrong prepare response")
        };
        assert_eq!(actual_fee_zat, 15_000);
        assert!(recipient_ciphertext_verified);
        assert!(orchard_proof_verified);
        let digest: [u8; 32] = hex::decode(&sighash_all).unwrap().try_into().unwrap();
        let sig = Secp256k1::new().sign_ecdsa(&Message::from_digest(digest), &reserve_key);
        let intent_json = serde_json::json!({
            "network": "testnet_nu6_2",
            "expected_branch_id": BRANCH, "target_height": 4052100,
            "expiry_height": 4052120,
            "input": {"prevout_txid": "02".repeat(32), "prevout_index": 0,
                "sequence": 4294967295u32, "amount_zat": 100000,
                "script_pubkey_hex": hex::encode(Script::from(
                    TransparentAddress::from_pubkey(&pubkey).script()).0.0)},
            "compressed_pubkey_hex": hex::encode(pubkey.serialize()),
            "recipient_ua": unified::Address::try_from_items(vec![
                unified::Receiver::Orchard(recipient.to_raw_address_bytes()),
                unified::Receiver::P2pkh([7u8; 20])]).unwrap().encode(&NetworkType::Test),
            "payout_zat": 80000, "change_zat": 5000,
        });
        let from_json = |v: serde_json::Value| serde_json::from_value::<OrchardIntent>(v).unwrap();
        let Response::OrchardVerify {
            fingerprint_sha256: verified,
            sighash_all: verified_digest,
            recipient_ciphertext_verified: true,
            ..
        } = verify(from_json(intent_json.clone()), &pczt_hex).unwrap()
        else {
            panic!("wrong verify response")
        };
        assert_eq!(verified, fingerprint_sha256);
        assert_eq!(verified_digest, sighash_all);
        let mut changed_recipient = intent_json.clone();
        changed_recipient["recipient_ua"] = serde_json::json!(
            unified::Address::try_from_items(vec![
                unified::Receiver::Orchard(
                    recipient_fvk
                        .address_at(1u32, Scope::External)
                        .to_raw_address_bytes()
                ),
                unified::Receiver::P2pkh([7u8; 20]),
            ])
            .unwrap()
            .encode(&NetworkType::Test)
        );
        assert!(verify(from_json(changed_recipient), &pczt_hex).is_err());
        let parsed = Pczt::parse(&hex::decode(&pczt_hex).unwrap()).unwrap();
        let changed_ciphertext_witness = Updater::new(parsed)
            .update_orchard_with(|mut bundle| {
                let i = bundle
                    .bundle()
                    .actions()
                    .iter()
                    .position(|a| a.output().value().as_ref().is_some_and(|v| v.inner() > 0))
                    .unwrap();
                bundle.update_action_with(i, |mut action| {
                    action.set_output_proprietary(OUTPUT_OVK_KEY.into(), vec![9u8; 32]);
                    Ok(())
                })
            })
            .unwrap()
            .finish()
            .serialize()
            .unwrap();
        let rejected = verify(
            from_json(intent_json.clone()),
            &hex::encode(changed_ciphertext_witness),
        )
        .unwrap_err();
        assert!(
            rejected.message.contains("ciphertext does not recover"),
            "{rejected:?}"
        );
        let Response::OrchardFinalize {
            signed_tx_hex,
            signed_txid_raw,
            recipient_ciphertext_verified: true,
            ..
        } = finalize(
            from_json(intent_json.clone()),
            &pczt_hex,
            &fingerprint_sha256,
            &hex::encode(sig.serialize_compact()),
        )
        .unwrap()
        else {
            panic!("wrong finalize response")
        };
        let raw = hex::decode(&signed_tx_hex).unwrap();
        assert_eq!(signed_txid_raw, proposed_txid);
        let compact_signature = hex::encode(sig.serialize_compact());
        let Response::OrchardVerifySigned {
            signed_txid_raw: verified_signed_txid,
            recipient_ciphertext_verified: true,
            orchard_proof_verified: true,
            ..
        } = verify_signed(
            from_json(intent_json.clone()),
            &pczt_hex,
            &fingerprint_sha256,
            &compact_signature,
            &signed_tx_hex,
        )
        .unwrap()
        else {
            panic!("wrong signed verification response")
        };
        assert_eq!(verified_signed_txid, proposed_txid);
        let mut corrupted_binding = raw.clone();
        *corrupted_binding.last_mut().unwrap() ^= 1;
        assert!(
            verify_signed(
                from_json(intent_json.clone()),
                &pczt_hex,
                &fingerprint_sha256,
                &compact_signature,
                &hex::encode(corrupted_binding),
            )
            .is_err()
        );
        let mut corrupted_change = raw.clone();
        corrupted_change[100] ^= 1;
        assert!(
            verify_signed(
                from_json(intent_json),
                &pczt_hex,
                &fingerprint_sha256,
                &compact_signature,
                &hex::encode(corrupted_change),
            )
            .is_err()
        );
        println!(
            "pczt_sha256={fingerprint_sha256} raw_sha256={} txid={signed_txid_raw}",
            hex::encode(Sha256::digest(&raw))
        );
        let tx = crate::parse_transaction(&raw).unwrap();
        assert_eq!(signed_txid_raw, hex::encode(tx.txid().as_ref()));
        let decrypted = tx
            .orchard_bundle()
            .unwrap()
            .decrypt_outputs_with_keys(&[recipient_fvk.to_ivk(Scope::External)]);
        assert_eq!(decrypted.len(), 1);
        assert_eq!(decrypted[0].2.value().inner(), 80_000);
        assert_eq!(
            decrypted[0].3.to_raw_address_bytes(),
            recipient.to_raw_address_bytes()
        );
    }
}
