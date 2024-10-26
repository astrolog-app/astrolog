// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use dotenv::dotenv;
use crate::commands::gallery::{add_new_image, open_image};
use crate::commands::imaging_sessions::{export_csv, open_imaging_session};
use crate::commands::preferences::{check_meta_data_directory, save_preferences, setup_backup};
use crate::commands::state::load_frontend_app_state;
use crate::commands::utils::{open_browser, rename_directory};
use crate::commands::calibration::{analyze_calibration_frames, classify_calibration_frames};
use crate::commands::image::get_date;
use crate::setup::setup;

mod models;
mod commands;
mod utils;
mod image;
pub mod file_store;
pub mod setup;
pub mod state;

fn main() {
    setup();
    dotenv().ok();

    let account_id = env::var("ACCOUNT_ID").expect("ACCOUNT_ID is not set");
    let verify_key = env::var("VERIFY_KEY").expect("VERIFY_KEY is not set");

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
      load_frontend_app_state,
      rename_directory,
      save_preferences,
      check_meta_data_directory,
      setup_backup,
      export_csv,
      open_browser,
      add_new_image,
      open_image,
      open_imaging_session,
      analyze_calibration_frames,
      classify_calibration_frames,
      get_date
    ])
        .plugin(
            tauri_plugin_keygen::Builder::new(
                &account_id,
                &verify_key,
            )
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
