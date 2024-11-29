use std::env;

fn main() {
    let is_release = env::var("PROFILE").unwrap_or_default() == "release";

    if is_release {
        let account_id = env::var("ACCOUNT_ID").expect("ACCOUNT_ID must be set");
        let verify_key = env::var("VERIFY_KEY").expect("VERIFY_KEY must be set");

        println!("cargo:rustc-env=ACCOUNT_ID={}", account_id);
        println!("cargo:rustc-env=VERIFY_KEY={}", verify_key);
    } else {
        println!("cargo:rustc-env=ACCOUNT_ID=account_id");
        println!("cargo:rustc-env=VERIFY_KEY=verify_key");
    }

    tauri_build::build();
}
