mod commands;
mod db;
mod models;
mod state;
mod file_store;
mod preferences;

use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // more verbose logging in debug builds, info-level in release
    #[cfg(debug_assertions)]
    let level = log::LevelFilter::Debug;
    #[cfg(not(debug_assertions))]
    let level = log::LevelFilter::Info;

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(level)
                .targets([
                    // terminal during development
                    Target::new(TargetKind::Stdout),
                    // rotating file in the platform log dir (e.g. %AppData%\..\logs)
                    Target::new(TargetKind::LogDir { file_name: None }),
                    // forwards rust logs into the webview console
                    Target::new(TargetKind::Webview),
                ])
                .build(),
        )
        .setup(|app| {
            // init app_state
            let app_state = AppState::new(app.handle());

            // state management
            app.manage(app_state);

            log::info!("astrolog started, app state initialized");

            Ok(())
        })
        .on_window_event(|_window, _event| {
            // if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            //     let state: tauri::State<AppState> = window.state();
            //     if *state.close_lock.lock().unwrap() {
            //         api.prevent_close();
            //         window.emit("close_lock", ()).unwrap();
            //     }
            // }
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_app_state,
            commands::save_telescope,
            commands::delete_telescope,
            commands::save_camera,
            commands::delete_camera,
            commands::save_mount,
            commands::delete_mount,
            commands::save_filter,
            commands::delete_filter,
            commands::save_flattener,
            commands::delete_flattener,
            commands::get_bias_frames,
            commands::get_dark_frames,
            commands::get_dark_flat_frames,
            commands::get_flat_frames,
            commands::get_light_frames,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
