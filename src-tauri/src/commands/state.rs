use crate::models::frontend::analytics::Analytics;
use crate::models::frontend::state::{
    CalibrationTableRow, FrontendAppState, LogTableRow, TableData,
};
use crate::models::imaging_frames::imaging_frame::CalibrationFrame;
use crate::models::state::AppState;
use tauri::State;
use crate::models::equipment::EquipmentList;

#[tauri::command]
pub fn load_frontend_app_state(state: State<AppState>) -> Result<String, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let image_list = Vec::new();

    let dark_frames = db.get_dark_frames().map_err(|e| e.to_string())?;
    let bias_frames = db.get_bias_frames().map_err(|e| e.to_string())?;
    let imaging_sessions = db.get_imaging_sessions().map_err(|e| e.to_string())?;

    let equipment_list = EquipmentList {
        cameras: db.get_cameras().map_err(|e| e.to_string())?,
        telescopes: db.get_telescopes().map_err(|e| e.to_string())?,
        mounts: db.get_mounts().map_err(|e| e.to_string())?,
        filters: db.get_filters().map_err(|e| e.to_string())?,
        flatteners: db.get_flatteners().map_err(|e| e.to_string())?,
    };

    drop(db);

    let sessions_data: Vec<LogTableRow> = imaging_sessions
        .iter()
        .filter_map(|i| LogTableRow::new(i.1, &state))
        .collect();

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

    let table_data = TableData {
        sessions: sessions_data,
        calibration: calibration_data,
    };

    let analytics = Analytics::new(&state).map_err(|e| e.to_string())?;
    let config = state.config.lock().map_err(|e| e.to_string())?;
    let local_config = state.local_config.lock().map_err(|e| e.to_string())?;

    let data = FrontendAppState {
        local_config: local_config.clone(),
        config: config.clone(),
        table_data,
        equipment_list,
        image_list,
        analytics,
    };

    serde_json::to_string(&data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_close_lock(state: State<AppState>) -> Result<(), String> {
    let mut close_lock = state.close_lock.lock().unwrap();

    *close_lock = true;

    Ok(())
}

#[tauri::command]
pub fn remove_close_lock(state: State<AppState>) -> Result<(), String> {
    let mut close_lock = state.close_lock.lock().unwrap();

    *close_lock = false;

    Ok(())
}
