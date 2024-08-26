// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::frontend_actions::{add_new_image, check_meta_data_directory, export_csv, load_frontend_app_state, open_browser, open_image, rename_directory, save_preferences, setup_backup};
use crate::services::setup::setup;

mod models;
mod frontend_actions;
mod utils;
mod services;

fn main() {
    setup();

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
            open_image
    ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
