mod commands;
mod db;
mod models;
mod state;
mod file_store;
mod preferences;

use tauri::Manager;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // init app_state
            let app_state = AppState::new(app.handle());

            // state management
            app.manage(app_state);

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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
