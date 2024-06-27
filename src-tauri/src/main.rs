// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod state;

use models::log::LogTableRow;

#[tauri::command]
fn get_log_data() -> Vec<LogTableRow> {
  let log_entries = LogTableRow::new_table_data();

  log_entries.into()
}

fn main() {
  state::get_app_state(); // This initializes APP_STATE

  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_log_data])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
