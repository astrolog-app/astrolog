use crate::models::equipment::{Camera, EquipmentItem, Filter, Flattener, Mount, Telescope};
use crate::models::state::AppState;
use tauri::State;

// TODO: when editing
#[tauri::command]
pub fn check_equipment_duplicate(
    state: State<AppState>,
    view_name: String,
    is_edit: bool,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let mut equipment_items: Vec<Box<dyn EquipmentItem>> = Vec::new();

    let telescopes = db.get_telescopes().map_err(|e| e.to_string())?;
    let cameras = db.get_cameras().map_err(|e| e.to_string())?;
    let mounts = db.get_mounts().map_err(|e| e.to_string())?;
    let filters = db.get_filters().map_err(|e| e.to_string())?;
    let flatteners = db.get_flatteners().map_err(|e| e.to_string())?;

    equipment_items.extend(
        telescopes
            .values()
            .map(|t| Box::new(t.clone()) as Box<dyn EquipmentItem>),
    );
    equipment_items.extend(
        cameras
            .values()
            .map(|c| Box::new(c.clone()) as Box<dyn EquipmentItem>),
    );
    equipment_items.extend(
        mounts
            .values()
            .map(|m| Box::new(m.clone()) as Box<dyn EquipmentItem>),
    );
    equipment_items.extend(
        filters
            .values()
            .map(|f| Box::new(f.clone()) as Box<dyn EquipmentItem>),
    );
    equipment_items.extend(
        flatteners
            .values()
            .map(|fl| Box::new(fl.clone()) as Box<dyn EquipmentItem>),
    );

    if equipment_items
        .iter()
        .any(|item| item.view_name() == view_name && !is_edit)
    {
        return Err(format!("Duplicate equipment item found: {}", view_name));
    }

    Ok(())
}

#[tauri::command]
pub fn save_telescope(state: State<AppState>, telescope: Telescope) -> Result<(), String> {
    let mut db = state.db.lock().map_err(|e| e.to_string())?;
    db.insert_telescope(&telescope).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn save_camera(state: State<AppState>, camera: Camera) -> Result<(), String> {
    let mut db = state.db.lock().map_err(|e| e.to_string())?;
    db.insert_camera(&camera).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn save_mount(state: State<AppState>, mount: Mount) -> Result<(), String> {
    let mut db = state.db.lock().map_err(|e| e.to_string())?;
    db.insert_mount(&mount).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn save_filter(state: State<AppState>, filter: Filter) -> Result<(), String> {
    let mut db = state.db.lock().map_err(|e| e.to_string())?;
    db.insert_filter(&filter).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn save_flattener(state: State<AppState>, flattener: Flattener) -> Result<(), String> {
    let mut db = state.db.lock().map_err(|e| e.to_string())?;
    db.insert_flattener(&flattener).map_err(|e| e.to_string())?;
    Ok(())
}
