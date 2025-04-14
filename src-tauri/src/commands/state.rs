use std::collections::HashMap;
use crate::models::frontend::analytics::Analytics;
use crate::models::frontend::state::{
    CalibrationTableRow, FrontendAppState, LogTableRow, TableData,
};
use crate::models::imaging_frames::imaging_frame::CalibrationFrame;
use crate::models::state::AppState;
use std::sync::Mutex;
use tauri::State;
use crate::models::database::Database;
use crate::models::equipment::EquipmentList;

#[tauri::command]
pub fn load_frontend_app_state(state: State<Mutex<AppState>>) -> Result<String, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = Database::new(&app_state.local_config.root_directory).map_err(|e| e.to_string())?;

    let local_config = app_state.local_config.clone();
    let config = app_state.config.clone();
    let image_list = app_state.gallery_image_list.values().cloned().collect();

    let dark_frames = db.get_dark_frames().map_err(|e| e.to_string())?;
    let bias_frames = db.get_bias_frames().map_err(|e| e.to_string())?;
    drop(app_state);

    // TODO: now skips if calibration_table_row() returns an error
    let mut calibration_data: Vec<CalibrationTableRow> = dark_frames
        .iter()
        .filter(|f| !f.1.in_imaging_session)
        .map(|f| f.1.calibration_table_row(&state))
        .filter_map(Result::ok) // keep only successful results
        .collect();
    calibration_data.extend(
        bias_frames
            .iter()
            .map(|f| f.1.calibration_table_row(&state))
            .filter_map(Result::ok),
    );

    let app_state = state.lock().map_err(|e| e.to_string())?;
    let db = Database::new(&app_state.local_config.root_directory).map_err(|e| e.to_string())?;
    let sessions_data: Vec<LogTableRow> = db
        .get_imaging_sessions()
        .map_err(|e| e.to_string())?
        .iter()
        .filter_map(|i| LogTableRow::new(i.1, &app_state))
        .collect();

    drop(app_state);

    let table_data = TableData {
        sessions: sessions_data,
        calibration: calibration_data,
    };

    // If you want to build a full EquipmentList:
    let equipment_list = EquipmentList {
        cameras: db.get_cameras().map_err(|e| e.to_string())?,
        telescopes: db.get_telescopes().map_err(|e| e.to_string())?,
        mounts: db.get_mounts().map_err(|e| e.to_string())?,
        filters: db.get_filters().map_err(|e| e.to_string())?,
        flatteners: db.get_flatteners().map_err(|e| e.to_string())?,
    };

    let analytics = Analytics::new(&state).map_err(|e| e.to_string())?;

    let data = FrontendAppState {
        local_config,
        config,
        table_data,
        equipment_list,
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
