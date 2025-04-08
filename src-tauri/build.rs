use std::env;

fn main() {

        println!("cargo:rustc-env=ACCOUNT_ID=account_id");
        println!("cargo:rustc-env=VERIFY_KEY=verify_key");

    tauri_build::build();
}
