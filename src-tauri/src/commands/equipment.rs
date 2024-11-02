use crate::models::equipment::{Camera, EquipmentList, Filter, Flattener, Mount, Telescope};

#[tauri::command]
pub fn get_telescope_details(view_name: String) -> Result<Telescope, String> {
    EquipmentList::get_telescope(&view_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_camera_details(view_name: String) -> Result<Camera, String> {
    EquipmentList::get_camera(&view_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_mount_details(view_name: String) -> Result<Mount, String> {
    EquipmentList::get_mount(&view_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_filter_details(view_name: String) -> Result<Filter, String> {
    EquipmentList::get_filter(&view_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_flattener_details(view_name: String) -> Result<Flattener, String> {
    EquipmentList::get_flattener(&view_name).map_err(|e| e.to_string())
}
