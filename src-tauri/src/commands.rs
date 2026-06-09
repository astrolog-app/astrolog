use serde::Serialize;
use tauri::State;

use crate::models::equipment::EquipmentList;
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
