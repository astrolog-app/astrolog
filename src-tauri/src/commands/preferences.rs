use std::path::PathBuf;
use crate::models::preferences::Preferences;
use crate::state::get_app_state;
use crate::utils::paths::APP_DATA_PATH;

#[tauri::command]
pub fn check_meta_data_directory(path: String) {}

#[tauri::command]
pub fn setup_backup(path: String) {}

#[tauri::command]
pub fn save_preferences(preferences: Preferences) -> Result<(), String> {
    get_app_state().preferences = preferences;
    Preferences::save(APP_DATA_PATH.clone()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_root_directory(root_directory: String) -> Result<(), String> {
    get_app_state().preferences.storage.root_directory = root_directory;
    Preferences::save(APP_DATA_PATH.clone()).map_err(|e| e.to_string())
}
