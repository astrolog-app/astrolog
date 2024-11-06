use uuid::Uuid;
use crate::models::equipment::{Camera, Filter, Flattener, Mount, Telescope};

#[tauri::command]
pub fn get_telescope_details(id: Uuid) -> Result<Telescope, String> {
    Err("Not implemented".to_string())
}

#[tauri::command]
pub fn get_camera_details(id: Uuid) -> Result<Camera, String> {
    Err("Not implemented".to_string())
}

#[tauri::command]
pub fn get_mount_details(id: Uuid) -> Result<Mount, String> {
    Err("Not implemented".to_string())
}

#[tauri::command]
pub fn get_filter_details(id: Uuid) -> Result<Filter, String> {
    Err("Not implemented".to_string())
}

#[tauri::command]
pub fn get_flattener_details(id: Uuid) -> Result<Flattener, String> {
    Err("Not implemented".to_string())
}
