// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod file_stores;
mod state;

use serde::{Deserialize, Serialize};
use models::log::LogTableRow;
use crate::models::configuration::Configuration;

#[derive(Debug, Serialize, Deserialize)]
struct FrontendData {
  preferences: Configuration,
  log_data: Vec<LogTableRow>
}

#[tauri::command]
fn get_frontend_data() -> String {
  let app_state = state::get_readonly_app_state();
  let preferences = app_state.configuration.clone();
  let imaging_session_list = &app_state.imaging_session_list;
  let mut log_data: Vec<LogTableRow> = vec![];

  for imaging_session in imaging_session_list {
    log_data.push(LogTableRow::new(imaging_session));
  }

  let data = FrontendData {
    preferences,
    log_data
  };

  serde_json::to_string(&data).unwrap()
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_frontend_data])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
