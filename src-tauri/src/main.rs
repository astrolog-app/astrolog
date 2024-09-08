// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::frontend_actions::gallery::{add_new_image, open_image};
use crate::frontend_actions::imaging_sessions::{analyze_images, export_csv, open_imaging_session};
use crate::frontend_actions::preferences::{check_meta_data_directory, save_preferences, setup_backup};
use crate::frontend_actions::state::load_frontend_app_state;
use crate::frontend_actions::utils::{open_browser, rename_directory};
use crate::frontend_actions::calibration::{analyze_calibration_frames, classify_bias_frames, classify_dark_frames};
use crate::services::setup::setup;

mod models;
mod frontend_actions;
mod utils;
mod services;
mod image;

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
      open_image,
      open_imaging_session,
      analyze_images,
      analyze_calibration_frames,
      classify_dark_frames,
      classify_bias_frames
    ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
