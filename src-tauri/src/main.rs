// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod state;
mod paths;
mod file_store;

use state::load_frontend_app_state;
use crate::models::preferences::save_preferences;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
      load_frontend_app_state,
      save_preferences
    ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
