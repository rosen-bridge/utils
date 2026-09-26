use rosen_zcash_native_finalizer::{ToolError, run_json};
use std::{env, fs::File, io::Read, process::ExitCode};

/// Accommodates a 2,000,000-byte raw transaction encoded as hex plus its JSON envelope.
const MAX_REQUEST_BYTES: usize = 4_001_024;

fn read_bounded(mut reader: impl Read) -> Result<String, ToolError> {
    let mut bytes = Vec::new();
    reader
        .by_ref()
        .take((MAX_REQUEST_BYTES + 1) as u64)
        .read_to_end(&mut bytes)
        .map_err(|e| ToolError {
            code: "input_read_failed",
            message: format!("request could not be read: {e}"),
            callback_count: None,
        })?;
    if bytes.len() > MAX_REQUEST_BYTES {
        return Err(ToolError {
            code: "input_too_large",
            message: format!("request exceeds {MAX_REQUEST_BYTES} bytes"),
            callback_count: None,
        });
    }
    String::from_utf8(bytes).map_err(|e| ToolError {
        code: "input_read_failed",
        message: format!("request is not UTF-8: {e}"),
        callback_count: None,
    })
}

fn read_request() -> Result<String, ToolError> {
    let args: Vec<String> = env::args().skip(1).collect();
    match args.as_slice() {
        [] => read_bounded(std::io::stdin().lock()),
        [flag, path] if flag == "--input" => File::open(path)
            .map_err(|e| ToolError {
                code: "input_read_failed",
                message: format!("input file could not be opened: {e}"),
                callback_count: None,
            })
            .and_then(read_bounded),
        _ => Err(ToolError {
            code: "invalid_arguments",
            message: "usage: rosen-zcash-native-finalizer [--input REQUEST.json]".to_owned(),
            callback_count: None,
        }),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Cursor;

    #[test]
    fn request_reader_accepts_limit_and_rejects_one_byte_more() {
        assert_eq!(
            read_bounded(Cursor::new(vec![b'a'; MAX_REQUEST_BYTES]))
                .unwrap()
                .len(),
            MAX_REQUEST_BYTES
        );
        assert_eq!(
            read_bounded(Cursor::new(vec![b'a'; MAX_REQUEST_BYTES + 1]))
                .unwrap_err()
                .code,
            "input_too_large"
        );
    }
}

fn main() -> ExitCode {
    match read_request().and_then(|input| run_json(&input)) {
        Ok(response) => {
            println!(
                "{}",
                serde_json::to_string_pretty(&response).expect("response serializes")
            );
            ExitCode::SUCCESS
        }
        Err(error) => {
            eprintln!(
                "{}",
                serde_json::to_string_pretty(&error).expect("error serializes")
            );
            ExitCode::FAILURE
        }
    }
}
