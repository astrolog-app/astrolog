// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::commands::equipment::{
    check_equipment_duplicate, save_camera, save_filter, save_flattener, save_mount, save_telescope,
};
use crate::commands::preferences::{
    change_bias_frames_folder_path, change_dark_frames_folder_path, delete_location, save_location,
};
use crate::file_system::set_folder_invisible;
use commands::calibration::{analyze_calibration_frames, classify_bias_frame, classify_dark_frame};
use commands::gallery::{add_new_image, open_image};
use commands::image::get_date;
use commands::imaging_sessions::{
    classify_imaging_session, edit_imaging_session, export_csv, get_image_frames_path,
    open_imaging_session,
};
use commands::preferences::{
    change_imaging_session_folder_path, save_preferences, set_root_directory, setup_backup,
};
use commands::state::{add_close_lock, load_frontend_app_state, remove_close_lock};
use commands::utils::{open_browser, rename_directory};
use models::frontend::process::Process;
use models::state::AppState;
use std::env;
use std::sync::Mutex;
use tauri::{Emitter, Manager};
use tauri_plugin_updater::UpdaterExt;

mod classify;
mod commands;
mod file_store;
mod file_system;
mod image;
mod models;

fn main() {
    let account_id = option_env!("ACCOUNT_ID")
        .expect("ACCOUNT_ID is not embedded in the binary")
        .to_string();
    let verify_key = option_env!("VERIFY_KEY")
        .expect("VERIFY_KEY is not embedded in the binary")
        .to_string();

    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_keygen::Builder::new(&account_id, &verify_key).build())
        .setup(|app| {
            // update
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                update(handle).await.unwrap();
            });

            // init app_state
            let app_state = AppState::new(app.handle());

            // set .astrolog folder invisible on windows
            let mut dir = app_state
                .local_config
                .lock()
                .unwrap()
                .root_directory
                .clone();
            dir.push(".astrolog");
            set_folder_invisible(&dir);

            // state management
            app.manage(app_state);

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let state: tauri::State<AppState> = window.state();
                if *state.close_lock.lock().unwrap() {
                    api.prevent_close();
                    window.emit("close_lock", ()).unwrap();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            add_close_lock,
            add_new_image,
            analyze_calibration_frames,
            change_bias_frames_folder_path,
            change_dark_frames_folder_path,
            change_imaging_session_folder_path,
            check_equipment_duplicate,
            classify_bias_frame,
            classify_dark_frame,
            classify_imaging_session,
            delete_location,
            edit_imaging_session,
            export_csv,
            get_date,
            get_image_frames_path,
            load_frontend_app_state,
            open_browser,
            open_image,
            open_imaging_session,
            remove_close_lock,
            rename_directory,
            save_camera,
            save_filter,
            save_flattener,
            save_location,
            save_mount,
            save_preferences,
            save_telescope,
            set_root_directory,
            setup_backup,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded = 0;

        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("downloaded {downloaded} from {content_length:?}");
                },
                || {
                    println!("download finished");
                },
            )
            .await?;

        println!("update installed");
        app.restart();
    }

    Ok(())
}
