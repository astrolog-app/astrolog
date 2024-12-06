// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::commands::calibration::{analyze_calibration_frames, classify_calibration_frames};
use crate::commands::gallery::{add_new_image, open_image};
use crate::commands::image::get_date;
use crate::commands::imaging_sessions::{export_csv, open_imaging_session};
use crate::commands::preferences::{save_preferences, set_root_directory, setup_backup};
use crate::commands::state::{add_close_lock, load_frontend_app_state, remove_close_lock, update_app_state_from_json};
use crate::commands::utils::{open_browser, rename_directory};
use std::env;
use std::sync::Mutex;
use tauri::{Emitter, Manager};
use models::state::AppState;

mod commands;
pub mod file_store;
mod image;
mod models;
pub mod setup;
mod utils;

use std::thread;
use uuid::Uuid;

#[derive(serde::Serialize)]
struct Process {
    id: Uuid,
    name: String,
    modal: bool,
    step: Option<u32>,
    max: Option<u32>,
}

#[tauri::command]
fn start_process(window: tauri::Window) {
    let id = Uuid::new_v4();

    // Spawn a new thread for the long-running process
    thread::spawn(move || {
        for i in 0..=100 {
            // Simulate work
            std::thread::sleep(std::time::Duration::from_millis(50));

            // Emit progress update
            let process = Process {
                id,
                name: String::from("Classifying Imaging Session"),
                modal: true,
                step: Some(i),
                max: Some(100),
            };

            // Clone window handle to emit events from the thread
            if let Err(e) = window.emit("process", &process) {
                eprintln!("Failed to emit event: {}", e);
            }
        }
    });
}

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
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let state: tauri::State<Mutex<AppState>> = window.state();
                let lock_state = state.lock().unwrap();
                if lock_state.close_lock {
                    api.prevent_close();
                    window.emit("close-blocked", "There are active locks!").unwrap();
                }
            }
        })
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_keygen::Builder::new(&account_id, &verify_key).build())
        .invoke_handler(tauri::generate_handler![
            add_close_lock,
            remove_close_lock,
            start_process,
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
