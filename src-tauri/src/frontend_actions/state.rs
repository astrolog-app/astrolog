use crate::models::equipment::EquipmentItem;
use crate::services::state::get_readonly_app_state;
use crate::models::imaging_frames::ImagingFrameList;
use crate::models::frontend::state::{CalibrationTableRow, EquipmentList, FrontendAppState, LogTableRow, TableData};

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
        .map(LogTableRow::new)
        .collect();

    let table_data = TableData {
        sessions: sessions_data,
        calibration: calibration_data,
    };

    let camera_list: Vec<String> = app_state.equipment_list.cameras.iter()
        .map(|e| e.view_name())
        .rev()
        .collect();

    let telescope_list: Vec<String> = app_state.equipment_list.telescopes.iter()
        .map(|e| e.view_name())
        .rev()
        .collect();

    let filter_list: Vec<String> = app_state.equipment_list.filters.iter()
        .map(|e| e.view_name())
        .rev()
        .collect();

    let flattener_list: Vec<String> = app_state.equipment_list.flatteners.iter()
        .map(|e| e.view_name())
        .rev()
        .collect();

    let mount_list: Vec<String> = app_state.equipment_list.mounts.iter()
        .map(|e| e.view_name())
        .rev()
        .collect();

    let equipment_list = EquipmentList {
        camera_list,
        telescope_list,
        filter_list,
        flattener_list,
        mount_list,
    };

    let data = FrontendAppState {
        preferences,
        table_data,
        equipment_list,
        image_list,
    };

    serde_json::to_string(&data).map_err(|e| e.to_string())
}
