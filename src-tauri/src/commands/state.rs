use crate::models::equipment::Camera;
use crate::models::frontend::analytics::Analytics;
use crate::models::frontend::state::{
    CalibrationTableRow, EquipmentList, FrontendAppState, LogTableRow, TableData,
};
use crate::models::imaging_frames::ImagingFrameList;
use crate::state::get_readonly_app_state;

#[tauri::command]
pub fn load_frontend_app_state() -> Result<String, String> {
    let app_state = get_readonly_app_state();

    let preferences = app_state.preferences.clone();
    let image_list = app_state.image_list.clone();

    let calibration_frames = ImagingFrameList::get_calibration_frames();
    let calibration_data: Vec<CalibrationTableRow> = calibration_frames
        .into_iter()
        .map(CalibrationTableRow::new)
        .collect();

    let sessions_data: Vec<LogTableRow> = app_state
        .imaging_session_list
        .iter()
        .filter_map(LogTableRow::new)
        .collect();

    let table_data = TableData {
        sessions: sessions_data,
        calibration: calibration_data,
    };

    let telescope_list = app_state
        .equipment_list
        .telescopes
        .values()
        .cloned()
        .collect();
    let camera_list = app_state.equipment_list.cameras.values().cloned().collect();
    let filter_list = app_state.equipment_list.filters.values().cloned().collect();
    let flattener_list = app_state
        .equipment_list
        .flatteners
        .values()
        .cloned()
        .collect();
    let mount_list = app_state.equipment_list.mounts.values().cloned().collect();

    let equipment_list = EquipmentList {
        telescope_list,
        camera_list,
        mount_list,
        filter_list,
        flattener_list,
    };

    let analytics = Analytics::new();

    let data = FrontendAppState {
        preferences,
        table_data,
        equipment_list,
        image_list,
        analytics,
    };

    serde_json::to_string(&data).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_app_state_from_json() -> Result<(), String> {
    //
    Ok(())
}
