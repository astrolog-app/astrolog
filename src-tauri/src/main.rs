// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod file_stores;
mod state;
mod paths;

use state::{load_app_state, save_frontend_app_state, load_frontend_app_state};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
      load_frontend_app_state,
      save_frontend_app_state,
      load_app_state
    ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
