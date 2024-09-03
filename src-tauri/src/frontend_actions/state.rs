use crate::models::image::Image;
use crate::models::log::LogTableRow;
use crate::services::state::{FrontendAppState, get_readonly_app_state};

#[tauri::command]
pub fn load_frontend_app_state() -> String {
    let app_state = get_readonly_app_state();
    let preferences = app_state.preferences.clone();
    let imaging_session_list = &app_state.imaging_session_list;
    let image_list: Vec<Image> = app_state.image_list.clone();
    let mut log_data: Vec<LogTableRow> = vec![];

    for imaging_session in imaging_session_list {
        log_data.push(LogTableRow::new(imaging_session));
    }

    let data = FrontendAppState {
        preferences,
        log_data,
        image_list,
    };

    serde_json::to_string(&data).unwrap()
}
