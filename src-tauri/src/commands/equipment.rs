use std::sync::Mutex;
use tauri::State;
use crate::models::equipment::{Camera, EquipmentItem, Filter, Flattener, Mount, Telescope};
use crate::models::state::AppState;

#[tauri::command]
pub fn check_equipment_duplicate(
    state: State<Mutex<AppState>>,
    view_name: String,
    is_edit: bool,
) -> Result<(), String> {
    let state = state.lock().unwrap();

    let mut equipment_items: Vec<&dyn EquipmentItem> = Vec::new();

    equipment_items.extend(state.equipment_list.telescopes.values().map(|t| t as &dyn EquipmentItem));
    equipment_items.extend(state.equipment_list.cameras.values().map(|c| c as &dyn EquipmentItem));
    equipment_items.extend(state.equipment_list.mounts.values().map(|m| m as &dyn EquipmentItem));
    equipment_items.extend(state.equipment_list.filters.values().map(|f| f as &dyn EquipmentItem));
    equipment_items.extend(state.equipment_list.flatteners.values().map(|fl| fl as &dyn EquipmentItem));

    if equipment_items.iter().any(|item| {
        if item.view_name() == view_name {
            if is_edit {
                return false;
            }
            return true;
        }
        false
    }) {
        return Err(format!("Duplicate equipment item found: {}", view_name));
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

#[tauri::command]
pub fn save_camera(
    state: State<Mutex<AppState>>,
    camera: Camera,
) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    let path = state.preferences.storage.root_directory.clone();

    let old_camera: Option<Camera> = state
        .equipment_list
        .cameras
        .insert(camera.id.clone(), camera.clone());

    if let Err(err) = state.equipment_list.save(&path) {
        // Revert the change if save fails
        match old_camera {
            Some(old) => {
                state.equipment_list.cameras.insert(old.id, old);
            }
            None => {
                state.equipment_list.cameras.remove(&camera.id);
            }
        }
        return Err(err.to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn save_mount(
    state: State<Mutex<AppState>>,
    mount: Mount,
) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    let path = state.preferences.storage.root_directory.clone();

    let old_mount: Option<Mount> = state
        .equipment_list
        .mounts
        .insert(mount.id.clone(), mount.clone());

    if let Err(err) = state.equipment_list.save(&path) {
        // Revert the change if save fails
        match old_mount {
            Some(old) => {
                state.equipment_list.mounts.insert(old.id, old);
            }
            None => {
                state.equipment_list.mounts.remove(&mount.id);
            }
        }
        return Err(err.to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn save_filter(
    state: State<Mutex<AppState>>,
    filter: Filter,
) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    let path = state.preferences.storage.root_directory.clone();

    let old_filter: Option<Filter> = state
        .equipment_list
        .filters
        .insert(filter.id.clone(), filter.clone());

    if let Err(err) = state.equipment_list.save(&path) {
        // Revert the change if save fails
        match old_filter {
            Some(old) => {
                state.equipment_list.filters.insert(old.id, old);
            }
            None => {
                state.equipment_list.filters.remove(&filter.id);
            }
        }
        return Err(err.to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn save_flattener(
    state: State<Mutex<AppState>>,
    flattener: Flattener,
) -> Result<(), String> {
    let mut state = state.lock().unwrap();
    let path = state.preferences.storage.root_directory.clone();

    let old_flattener: Option<Flattener> = state
        .equipment_list
        .flatteners
        .insert(flattener.id.clone(), flattener.clone());

    if let Err(err) = state.equipment_list.save(&path) {
        // Revert the change if save fails
        match old_flattener {
            Some(old) => {
                state.equipment_list.flatteners.insert(old.id, old);
            }
            None => {
                state.equipment_list.flatteners.remove(&flattener.id);
            }
        }
        return Err(err.to_string());
    }

    Ok(())
}
