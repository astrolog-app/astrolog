mod commands;
mod db;
mod file_store;
mod models;
mod preferences;
mod state;

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
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
            // the welcome window is a fixed-size one-shot dialog — never
            // restore or persist geometry for it, only for the main window
            tauri_plugin_window_state::Builder::new()
                .with_denylist(&["welcome"])
                .build(),
        )
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
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // init app_state
            let app_state = AppState::new(app.handle());
            let is_configured = app_state.is_configured;

            // state management
            app.manage(app_state);

            // the window is built here instead of tauri.conf.json so the
            // backend decides the initial route: first run (no local config
            // yet) opens the welcome flow, every later start the main ui
            // distinct labels so window-state, capabilities and lookups can
            // tell the two windows apart (the denylist above matches on it)
            let (label, url) = if is_configured {
                ("main", "/")
            } else {
                ("welcome", "/welcome")
            };
            let builder = WebviewWindowBuilder::new(app, label, WebviewUrl::App(url.into()))
                .title("AstroLog");
            // the welcome flow runs in a fixed-size dialog-style window,
            // the main ui in a freely resizable one
            let builder = if is_configured {
                // the main ui draws its own titlebar: windows/linux run
                // frameless with custom caption buttons in the top bar,
                // macos keeps the native traffic lights overlaying it
                let builder = builder
                    .resizable(true)
                    .inner_size(900.0, 700.0)
                    .min_inner_size(900.0, 700.0);
                #[cfg(target_os = "macos")]
                let builder = builder
                    .title_bar_style(tauri::TitleBarStyle::Overlay)
                    .hidden_title(true);
                #[cfg(not(target_os = "macos"))]
                let builder = builder.decorations(false);
                builder
            } else {
                builder
                    .resizable(false)
                    .maximizable(false)
                    .decorations(false)
                    .inner_size(1000.0, 750.0)
                    .center()
            };
            #[cfg(any(windows, target_os = "android"))]
            let builder = builder.use_https_scheme(true);
            builder.build()?;

            log::info!("astrolog started, app state initialized (configured: {is_configured})");

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
            commands::pick_folder,
            commands::pick_library_folder,
            commands::finish_setup,
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
