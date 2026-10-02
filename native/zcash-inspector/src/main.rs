use std::{io, process::ExitCode};

fn main() -> ExitCode {
    let args: Vec<_> = std::env::args_os().skip(1).collect();
    let result = if args.is_empty() {
        rosen_zcash_native_inspector::run_reader(io::stdin().lock()).map(|response| {
            serde_json::to_string_pretty(&response).expect("response serialization is infallible")
        })
    } else if args.len() == 1 && args[0] == "--batch" {
        rosen_zcash_native_inspector::run_batch_reader(io::stdin().lock()).map(|response| {
            serde_json::to_string(&response).expect("response serialization is infallible")
        })
    } else {
        Err(rosen_zcash_native_inspector::ToolError {
            code: "unsupported_mode".to_owned(),
            message: "expected no arguments or --batch".to_owned(),
        })
    };
    match result {
        Ok(response) => {
            println!("{response}");
            ExitCode::SUCCESS
        }
        Err(error) => {
            eprintln!(
                "{}",
                serde_json::to_string_pretty(&error).expect("error serialization is infallible")
            );
            ExitCode::FAILURE
        }
    }
}
