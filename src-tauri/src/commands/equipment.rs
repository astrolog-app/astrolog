use std::sync::Mutex;
use tauri::State;
use crate::models::equipment::{EquipmentItem, Telescope};
use crate::models::state::AppState;

#[tauri::command]
pub fn check_equipment_duplicate(
    state: State<Mutex<AppState>>,
    brand: String,
    name: String
) -> Result<(), String> {
    // let state = state.lock().map_err(|_| "Failed to acquire state lock.")?;
    //
    // let equipment_items: Vec<&dyn EquipmentItem> = [
    //     state.equipment_list.telescopes.values().collect::<Vec<_>>().as_slice(),
    //     state.equipment_list.cameras.values().collect::<Vec<_>>().as_slice(),
    //     state.equipment_list.mounts.values().collect::<Vec<_>>().as_slice(),
    //     state.equipment_list.filters.values().collect::<Vec<_>>().as_slice(),
    //     state.equipment_list.flatteners.values().collect::<Vec<_>>().as_slice(),
    // ]
    // .into_iter()
    //     .flatten()
    //     .collect();
    //
    // if equipment_items.iter().any(|item| item.brand() == brand && item.name() == name) {
    //     return Err(format!("Duplicate equipment found for brand '{}' and name '{}'", brand, name));
    // }

    Ok(())
}

#[tauri::command]
pub fn add_telescope(
    state: State<Mutex<AppState>>,
    telescope: Telescope
) -> Result<(), String> {
    Ok(())
}
