use std::sync::Mutex;
use tauri::State;
use crate::models::equipment::{EquipmentItem, Telescope};
use crate::models::state::AppState;

#[tauri::command]
pub fn check_equipment_duplicate(
    state: State<Mutex<AppState>>,
    view_name: String,
) -> Result<(), String> {
    let state = state.lock().unwrap();

    let mut equipment_items: Vec<&dyn EquipmentItem> = Vec::new();

    equipment_items.extend(state.equipment_list.telescopes.values().map(|t| t as &dyn EquipmentItem));
    equipment_items.extend(state.equipment_list.cameras.values().map(|c| c as &dyn EquipmentItem));
    equipment_items.extend(state.equipment_list.mounts.values().map(|m| m as &dyn EquipmentItem));
    equipment_items.extend(state.equipment_list.filters.values().map(|f| f as &dyn EquipmentItem));
    equipment_items.extend(state.equipment_list.flatteners.values().map(|fl| fl as &dyn EquipmentItem));

    if equipment_items.iter().any(|item| item.view_name() == view_name) {
        return Err(format!(
            "Duplicate equipment item found: {}",
            view_name
        ));
    }

    Ok(())
}

#[tauri::command]
pub fn save_telescope(
    state: State<Mutex<AppState>>,
    telescope: Telescope,
) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    let path = state.preferences.storage.root_directory.clone();

    let old_telescope: Option<Telescope> = state
        .equipment_list
        .telescopes
        .insert(telescope.id.clone(), telescope.clone());

    if let Err(err) = state.equipment_list.save(&path) {
        // Revert the change if save fails
        match old_telescope {
            Some(old) => {
                state.equipment_list.telescopes.insert(old.id, old);
            }
            None => {
                state.equipment_list.telescopes.remove(&telescope.id);
            }
        }
        return Err(err.to_string());
    }

    Ok(())
}
