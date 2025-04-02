use crate::models::frontend::analytics::Analytics;
use crate::models::frontend::state::{
    CalibrationTableRow, FrontendAppState, LogTableRow, TableData,
};
use crate::models::state::AppState;
use std::sync::Mutex;
use tauri::State;
use crate::models::imaging_frames::imaging_frame::CalibrationFrame;

#[tauri::command]
pub fn load_frontend_app_state(state: State<Mutex<AppState>>) -> Result<String, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    let local_config = app_state.local_config.clone();
    let config = app_state.config.clone();
    let image_list = app_state.gallery_image_list.values().cloned().collect();

    let dark_frames = app_state.imaging_frame_list.dark_frames.clone();
    let bias_frames = app_state.imaging_frame_list.bias_frames.clone();
    drop(app_state);

    // TODO: now skips if calibration_table_row() returns an error
    let mut calibration_data: Vec<CalibrationTableRow> = dark_frames
        .iter()
        .map(|f| f.1.calibration_table_row(&state))
        .filter_map(Result::ok) // keep only successful results
        .collect();
    calibration_data.extend(
        bias_frames
            .iter()
            .map(|f| f.1.calibration_table_row(&state))
            .filter_map(Result::ok)
    );

    let app_state = state.lock().map_err(|e| e.to_string())?;
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
        local_config,
        config,
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
