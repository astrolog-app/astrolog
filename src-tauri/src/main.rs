// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod file_stores;
mod state;

use models::log::LogTableRow;

#[tauri::command]
fn get_log_data() -> Vec<LogTableRow> {
  let app_state = state::get_readonly_app_state();
  let imaging_session_list = &app_state.imaging_session_list;
  let mut data: Vec<LogTableRow> = vec![];

  for imaging_session in imaging_session_list {
    data.push(LogTableRow::new(imaging_session));
  }

  data
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_log_data])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
