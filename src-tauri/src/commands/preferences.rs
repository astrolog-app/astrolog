use crate::models::preferences::Preferences;
use crate::utils::file_system::{dir_contains_metadata, is_directory_empty};
use crate::utils::paths::APP_DATA_PATH;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use crate::models::state::AppState;

#[tauri::command]
pub fn setup_backup(_path: String) {}

#[tauri::command]
pub fn save_preferences(preferences: Preferences, state: State<Mutex<AppState>>) -> Result<(), String> {
    let mut app_state = state.lock().unwrap();
    app_state.preferences = preferences;
    Preferences::save(APP_DATA_PATH.clone(), &app_state.preferences).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_root_directory(root_directory: PathBuf, state: State<Mutex<AppState>>) -> Result<(), String> {
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
    Preferences::save(APP_DATA_PATH.clone(), &app_state.preferences).map_err(|e| e.to_string())
}
