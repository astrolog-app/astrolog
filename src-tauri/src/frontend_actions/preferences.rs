use crate::models::preferences::Preferences;
use crate::services::state::get_app_state;
use crate::utils::paths::APP_DATA_PATH;

#[tauri::command]
pub fn check_meta_data_directory(path: String) {}

#[tauri::command]
pub fn setup_backup(path: String) {}

#[tauri::command]
pub fn save_preferences(preferences: Preferences) -> bool {
    get_app_state().preferences = preferences;
    return match Preferences::save(APP_DATA_PATH.clone()) {
        Ok(..) => {
            true
        }
        Err(e) => {
            // TODO: trigger modal
            false
        }
    };
}
