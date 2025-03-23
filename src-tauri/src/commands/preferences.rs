use crate::file_system::{dir_contains_metadata, is_directory_empty};
use crate::models::preferences::{FolderPath, LocalConfig, Location};
use crate::models::state::AppState;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub fn setup_backup(_path: String) {}

#[tauri::command]
pub fn save_preferences(
    local_config: LocalConfig,
    state: State<Mutex<AppState>>,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut app_state = state.lock().unwrap();
    app_state.local_config = local_config;
    app_state.local_config.save(app_handle.path().app_data_dir().unwrap())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_root_directory(
    app_handle: AppHandle,
    root_directory: PathBuf,
    state: State<Mutex<AppState>>,
) -> Result<(), String> {
    let mut app_state = state.lock().unwrap();
    let path = PathBuf::from(&root_directory);

    let dir_is_empty: bool = is_directory_empty(&path).map_err(|e| e.to_string())?;
    let dir_contains_metadata: bool = dir_contains_metadata(&path).map_err(|e| e.to_string())?;

    if !dir_is_empty && !dir_contains_metadata {
        return Err(
            "Your selected folder has to be either empty or contain the .astrolog folder."
                .to_owned(),
        );
    }

    app_state.local_config.root_directory = root_directory;
    app_state.local_config.save(app_handle.path().app_data_dir().unwrap())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn change_imaging_session_folder_path(state: State<Mutex<AppState>>, base_folder: PathBuf, pattern: PathBuf) -> Result<(), String> {
    let mut app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.imaging_frame_list.light_frames.is_empty() {
        return Err("Feature not implemented: Can't change folder structure of already added imaging sessions in this version.".to_string())
    }

    let old = app_state.config.folder_paths.imaging_session_folder_path.clone();

    let new = FolderPath {
        base_folder,
        pattern
    };
    app_state.config.folder_paths.imaging_session_folder_path = new;

    if let Err(e) = app_state.config.save(app_state.local_config.root_directory.clone()) {
        app_state.config.folder_paths.imaging_session_folder_path = old;
        return Err(e.to_string())
    }

    Ok(())
}

#[tauri::command]
pub fn save_location(state: State<Mutex<AppState>>, location: Location) -> Result<(), String> {
    location.save(&state).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_location(state: State<Mutex<AppState>>, location: Location) -> Result<(), String> {
    location.delete(&state).map_err(|e| e.to_string())
}
