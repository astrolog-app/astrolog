// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::commands::calibration::{analyze_calibration_frames, classify_calibration_frames};
use crate::commands::gallery::{add_new_image, open_image};
use crate::commands::image::get_date;
use crate::commands::imaging_sessions::{export_csv, open_imaging_session};
use crate::commands::preferences::{save_preferences, set_root_directory, setup_backup};
use crate::commands::state::{load_frontend_app_state, update_app_state_from_json};
use crate::commands::utils::{open_browser, rename_directory};
use std::env;
use std::sync::Mutex;
use tauri::Manager;
use models::state::AppState;

mod commands;
pub mod file_store;
mod image;
mod models;
pub mod setup;
mod utils;

fn main() {
    let account_id = option_env!("ACCOUNT_ID")
        .expect("ACCOUNT_ID is not embedded in the binary")
        .to_string();
    let verify_key = option_env!("VERIFY_KEY")
        .expect("VERIFY_KEY is not embedded in the binary")
        .to_string();

    tauri::Builder::default()
        .setup(|app| {
            app.manage(Mutex::new(AppState::new()));
            // TODO: add setup() method

            Ok(())
        })
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_keygen::Builder::new(&account_id, &verify_key).build())
        .invoke_handler(tauri::generate_handler![
            load_frontend_app_state,
            rename_directory,
            save_preferences,
            setup_backup,
            export_csv,
            open_browser,
            add_new_image,
            open_image,
            open_imaging_session,
            analyze_calibration_frames,
            classify_calibration_frames,
            set_root_directory,
            update_app_state_from_json,
            get_date,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
