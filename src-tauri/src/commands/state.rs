use crate::models::frontend::analytics::Analytics;
use crate::models::frontend::state::{
    CalibrationTableRow, FrontendAppState, LogTableRow, TableData,
};
use crate::models::imaging_frames::ImagingFrameList;
use crate::models::state::AppState;
use std::sync::Mutex;
use tauri::State;

#[tauri::command]
pub fn load_frontend_app_state(state: State<Mutex<AppState>>) -> Result<String, String> {
    let app_state = state.lock().unwrap();

    let preferences = app_state.preferences.clone();
    let image_list = app_state.gallery_image_list.values().cloned().collect();

    let calibration_frames = ImagingFrameList::get_calibration_frames(&app_state);
    let calibration_data: Vec<CalibrationTableRow> = calibration_frames
        .into_iter()
        .map(|c| CalibrationTableRow::new(c, &app_state))
        .collect();

    let sessions_data: Vec<LogTableRow> = app_state
        .imaging_sessions
        .iter()
        .filter_map(|i| LogTableRow::new(i.1, &app_state))
        .collect();

    let table_data = TableData {
        sessions: sessions_data,
        calibration: calibration_data,
    };

    let analytics = Analytics::new();

    let data = FrontendAppState {
        preferences,
        table_data,
        equipment_list: app_state.equipment_list.clone(),
        image_list,
        analytics,
    };

    serde_json::to_string(&data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_close_lock(state: State<Mutex<AppState>>) -> Result<(), String> {
    let mut app_state = state.lock().unwrap();

    app_state.close_lock = true;

    Ok(())
}

#[tauri::command]
pub fn remove_close_lock(state: State<Mutex<AppState>>) -> Result<(), String> {
    let mut app_state = state.lock().unwrap();

    app_state.close_lock = false;

    Ok(())
}
