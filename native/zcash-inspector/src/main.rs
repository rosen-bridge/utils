use std::{io, process::ExitCode};

fn main() -> ExitCode {
    match rosen_zcash_native_inspector::run_reader(io::stdin().lock()) {
        Ok(response) => {
            println!(
                "{}",
                serde_json::to_string_pretty(&response)
                    .expect("response serialization is infallible")
            );
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
