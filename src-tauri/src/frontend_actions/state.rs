use crate::models::log::{CalibrationTableRow, LogTableRow, TableData};
use crate::services::state::{FrontendAppState, get_readonly_app_state};
use crate::models::imaging_frames::ImagingFrameList;

#[tauri::command]
pub fn load_frontend_app_state() -> Result<String, String> {
    let app_state = get_readonly_app_state();

    let preferences = app_state.preferences.clone();

    let imaging_session_list = &app_state.imaging_session_list;

    let image_list = app_state.image_list.clone();

    let mut calibration_data: Vec<CalibrationTableRow> = vec![];
    for calibration_frame in ImagingFrameList::get_calibration_frames() {
        calibration_data.push(CalibrationTableRow::new(calibration_frame));
    }

    let mut sessions_data: Vec<LogTableRow> = vec![];
    for imaging_session in imaging_session_list {
        sessions_data.push(LogTableRow::new(imaging_session));
    }

    let table_data = TableData {
        sessions: sessions_data,
        calibration: calibration_data
    };

    let data = FrontendAppState {
        preferences,
        table_data,
        image_list,
    };

    serde_json::to_string(&data).map_err(|e| e.to_string())
}
