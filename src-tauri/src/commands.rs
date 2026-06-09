use serde::Serialize;
use tauri::State;
use uuid::Uuid;

use crate::models::equipment::{Camera, EquipmentList, Filter, Flattener, Mount, Telescope};
use crate::preferences::{Config, LocalConfig};
use crate::state::AppState;

// serializable snapshot of the app state sent to the frontend
#[derive(Serialize)]
pub struct AppStateDto {
    pub local_config: LocalConfig,
    pub config: Config,
    pub equipment: EquipmentList,
}

#[tauri::command]
pub fn get_app_state(state: State<AppState>) -> Result<AppStateDto, String> {
    let equipment = state
        .db
        .lock()
        .unwrap()
        .get_equipment_list()
        .map_err(|e| e.to_string())?;

    let local_config = state.local_config.lock().unwrap().clone();
    let config = state.config.lock().unwrap().clone();

    Ok(AppStateDto {
        local_config,
        config,
        equipment,
    })
}

// ------------ equipment: save (upsert) + delete ------------
// save_* use INSERT OR REPLACE under the hood, so they handle both add and edit

#[tauri::command]
pub fn save_telescope(state: State<AppState>, telescope: Telescope) -> Result<(), String> {
    state
        .db
        .lock()
        .unwrap()
        .insert_telescope(&telescope)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_telescope(state: State<AppState>, id: Uuid) -> Result<(), String> {
    state
        .db
        .lock()
        .unwrap()
        .remove_telescope(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_camera(state: State<AppState>, camera: Camera) -> Result<(), String> {
    state
        .db
        .lock()
        .unwrap()
        .insert_camera(&camera)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_camera(state: State<AppState>, id: Uuid) -> Result<(), String> {
    state
        .db
        .lock()
        .unwrap()
        .remove_camera(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_mount(state: State<AppState>, mount: Mount) -> Result<(), String> {
    state
        .db
        .lock()
        .unwrap()
        .insert_mount(&mount)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_mount(state: State<AppState>, id: Uuid) -> Result<(), String> {
    state
        .db
        .lock()
        .unwrap()
        .remove_mount(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_filter(state: State<AppState>, filter: Filter) -> Result<(), String> {
    state
        .db
        .lock()
        .unwrap()
        .insert_filter(&filter)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_filter(state: State<AppState>, id: Uuid) -> Result<(), String> {
    state
        .db
        .lock()
        .unwrap()
        .remove_filter(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_flattener(state: State<AppState>, flattener: Flattener) -> Result<(), String> {
    state
        .db
        .lock()
        .unwrap()
        .insert_flattener(&flattener)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_flattener(state: State<AppState>, id: Uuid) -> Result<(), String> {
    state
        .db
        .lock()
        .unwrap()
        .remove_flattener(id)
        .map_err(|e| e.to_string())
}
