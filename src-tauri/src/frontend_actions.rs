use std::path::PathBuf;
use crate::models::log::LogTableRow;
use crate::models::preferences::Preferences;
use crate::paths::APP_DATA_PATH;
use crate::state::{get_app_state, get_readonly_app_state};

#[tauri::command]
pub fn load_frontend_app_state() -> String {
    let app_state = get_readonly_app_state();
    let preferences = app_state.preferences.clone();
    let imaging_session_list = &app_state.imaging_session_list;
    let mut log_data: Vec<LogTableRow> = vec![];

    for imaging_session in imaging_session_list {
        log_data.push(LogTableRow::new(imaging_session));
    }

    let data = crate::state::FrontendAppState {
        preferences,
        log_data,
    };

    serde_json::to_string(&data).unwrap()
}

#[tauri::command]
pub fn save_preferences(preferences: Preferences) {
    get_app_state().preferences = preferences;
    Preferences::save(APP_DATA_PATH.clone()).expect("TODO: panic message");
}

#[tauri::command]
pub fn export_csv(path: PathBuf) {
    println!("{}", path.display());
} // TODO: implement
