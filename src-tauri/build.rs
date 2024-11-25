use std::env;

fn main() {
    // Check if we are in a release build (production)
    let is_release = env::var("PROFILE").unwrap_or_default() == "release";

    if is_release {
        // Read the environment variables that must be set during build time
        let account_id = env::var("ACCOUNT_ID").expect("ACCOUNT_ID must be set");
        let verify_key = env::var("VERIFY_KEY").expect("VERIFY_KEY must be set");

        // Embed the variables
        println!("cargo:rustc-env=ACCOUNT_ID={}", account_id);
        println!("cargo:rustc-env=VERIFY_KEY={}", verify_key);
    }

    // Call tauri_build::build() to configure the Tauri build
    tauri_build::build();
}
