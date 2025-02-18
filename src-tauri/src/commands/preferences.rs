use crate::file_system::{dir_contains_metadata, is_directory_empty};
use crate::models::preferences::Preferences;
use crate::models::state::AppState;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub fn setup_backup(_path: String) {}

#[tauri::command]
pub fn save_preferences(
    preferences: Preferences,
    state: State<Mutex<AppState>>,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut app_state = state.lock().unwrap();
    app_state.preferences = preferences;
    Preferences::save(
        app_handle.path().app_data_dir().unwrap(),
        &app_state.preferences,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_root_directory(
    app_handle: AppHandle,
    root_directory: PathBuf,
    state: State<Mutex<AppState>>,
) -> Result<(), String> {
    let mut app_state = state.lock().unwrap();
    let path = PathBuf::from(&root_directory);

    let dir_is_empty: bool = is_directory_empty(&path).map_err(|e| e.to_string())?;
    let dir_contains_metadata: bool = dir_contains_metadata(&path).map_err(|e| e.to_string())?;

    if !dir_is_empty && !dir_contains_metadata {
        return Err(
            "Your selected folder has to be either empty or contain the .astrolog folder."
                .to_owned(),
        );
    }

    app_state.preferences.storage.root_directory = root_directory;
    Preferences::save(
        app_handle.path().app_data_dir().unwrap(),
        &app_state.preferences,
    )
    .map_err(|e| e.to_string())
}
