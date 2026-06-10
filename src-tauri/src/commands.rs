use serde::Serialize;
use tauri::State;
use uuid::Uuid;

use crate::models::equipment::{Camera, EquipmentList, Filter, Flattener, Mount, Telescope};
use crate::models::imaging_frames::bias_frame::{BiasFramePage, BiasFrameQuery};
use crate::models::imaging_frames::dark_flat_frame::{DarkFlatFramePage, DarkFlatFrameQuery};
use crate::models::imaging_frames::dark_frame::{DarkFramePage, DarkFrameQuery};
use crate::models::imaging_frames::flat_frame::{FlatFramePage, FlatFrameQuery};
use crate::models::imaging_frames::light_frame::{LightFramePage, LightFrameQuery};
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
        .map_err(|e| {
            log::error!("get_app_state: failed to load equipment list: {e}");
            e.to_string()
        })?;

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
    log::debug!("save_telescope: {}", telescope.id);
    state
        .db
        .lock()
        .unwrap()
        .insert_telescope(&telescope)
        .map_err(|e| {
            log::error!("save_telescope {} failed: {e}", telescope.id);
            e.to_string()
        })
}

#[tauri::command]
pub fn delete_telescope(state: State<AppState>, id: Uuid) -> Result<(), String> {
    log::debug!("delete_telescope: {id}");
    state
        .db
        .lock()
        .unwrap()
        .remove_telescope(id)
        .map_err(|e| {
            log::error!("delete_telescope {id} failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn save_camera(state: State<AppState>, camera: Camera) -> Result<(), String> {
    log::debug!("save_camera: {}", camera.id);
    state
        .db
        .lock()
        .unwrap()
        .insert_camera(&camera)
        .map_err(|e| {
            log::error!("save_camera {} failed: {e}", camera.id);
            e.to_string()
        })
}

#[tauri::command]
pub fn delete_camera(state: State<AppState>, id: Uuid) -> Result<(), String> {
    log::debug!("delete_camera: {id}");
    state
        .db
        .lock()
        .unwrap()
        .remove_camera(id)
        .map_err(|e| {
            log::error!("delete_camera {id} failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn save_mount(state: State<AppState>, mount: Mount) -> Result<(), String> {
    log::debug!("save_mount: {}", mount.id);
    state
        .db
        .lock()
        .unwrap()
        .insert_mount(&mount)
        .map_err(|e| {
            log::error!("save_mount {} failed: {e}", mount.id);
            e.to_string()
        })
}

#[tauri::command]
pub fn delete_mount(state: State<AppState>, id: Uuid) -> Result<(), String> {
    log::debug!("delete_mount: {id}");
    state
        .db
        .lock()
        .unwrap()
        .remove_mount(id)
        .map_err(|e| {
            log::error!("delete_mount {id} failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn save_filter(state: State<AppState>, filter: Filter) -> Result<(), String> {
    log::debug!("save_filter: {}", filter.id);
    state
        .db
        .lock()
        .unwrap()
        .insert_filter(&filter)
        .map_err(|e| {
            log::error!("save_filter {} failed: {e}", filter.id);
            e.to_string()
        })
}

#[tauri::command]
pub fn delete_filter(state: State<AppState>, id: Uuid) -> Result<(), String> {
    log::debug!("delete_filter: {id}");
    state
        .db
        .lock()
        .unwrap()
        .remove_filter(id)
        .map_err(|e| {
            log::error!("delete_filter {id} failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn save_flattener(state: State<AppState>, flattener: Flattener) -> Result<(), String> {
    log::debug!("save_flattener: {}", flattener.id);
    state
        .db
        .lock()
        .unwrap()
        .insert_flattener(&flattener)
        .map_err(|e| {
            log::error!("save_flattener {} failed: {e}", flattener.id);
            e.to_string()
        })
}

#[tauri::command]
pub fn delete_flattener(state: State<AppState>, id: Uuid) -> Result<(), String> {
    log::debug!("delete_flattener: {id}");
    state
        .db
        .lock()
        .unwrap()
        .remove_flattener(id)
        .map_err(|e| {
            log::error!("delete_flattener {id} failed: {e}");
            e.to_string()
        })
}

// ------------ imaging frames ------------

#[tauri::command]
pub fn get_bias_frames(
    state: State<AppState>,
    query: BiasFrameQuery,
) -> Result<BiasFramePage, String> {
    log::debug!("get_bias_frames");
    state
        .db
        .lock()
        .unwrap()
        .get_bias_frames(&query)
        .map_err(|e| {
            log::error!("get_bias_frames failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn get_dark_frames(
    state: State<AppState>,
    query: DarkFrameQuery,
) -> Result<DarkFramePage, String> {
    log::debug!("get_dark_frames");
    state
        .db
        .lock()
        .unwrap()
        .get_dark_frames(&query)
        .map_err(|e| {
            log::error!("get_dark_frames failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn get_dark_flat_frames(
    state: State<AppState>,
    query: DarkFlatFrameQuery,
) -> Result<DarkFlatFramePage, String> {
    log::debug!("get_dark_flat_frames");
    state
        .db
        .lock()
        .unwrap()
        .get_dark_flat_frames(&query)
        .map_err(|e| {
            log::error!("get_dark_flat_frames failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn get_flat_frames(
    state: State<AppState>,
    query: FlatFrameQuery,
) -> Result<FlatFramePage, String> {
    log::debug!("get_flat_frames");
    state
        .db
        .lock()
        .unwrap()
        .get_flat_frames(&query)
        .map_err(|e| {
            log::error!("get_flat_frames failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn get_light_frames(
    state: State<AppState>,
    query: LightFrameQuery,
) -> Result<LightFramePage, String> {
    log::debug!("get_light_frames");
    state
        .db
        .lock()
        .unwrap()
        .get_light_frames(&query)
        .map_err(|e| {
            log::error!("get_light_frames failed: {e}");
            e.to_string()
        })
}
