use std::path::PathBuf;
use crate::models::preferences::Preferences;
use crate::state::get_app_state;
use crate::utils::file_system::{dir_contains_metadata, is_directory_empty};
use crate::utils::paths::APP_DATA_PATH;

#[tauri::command]
pub fn setup_backup(path: String) {}

#[tauri::command]
pub fn save_preferences(preferences: Preferences) -> Result<(), String> {
    get_app_state().preferences = preferences;
    Preferences::save(APP_DATA_PATH.clone()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_root_directory(root_directory: String) -> Result<(), String> {
    let path = PathBuf::from(&root_directory);

    let dir_is_empty: bool = is_directory_empty(&path).map_err(|e| e.to_string())?;
    let dir_contains_metadata: bool = dir_contains_metadata(&path).map_err(|e| e.to_string())?;

    if !dir_is_empty && !dir_contains_metadata {
        return Err("Your selected folder has to be either empty or contain the .astrolog folder."
            .to_owned());
    }

    get_app_state().preferences.storage.root_directory = root_directory;
    Preferences::save(APP_DATA_PATH.clone()).map_err(|e| e.to_string())
}
