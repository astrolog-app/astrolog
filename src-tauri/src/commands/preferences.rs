use crate::file_system::{dir_contains_metadata, is_directory_empty};
use crate::models::preferences::{LocalConfig, Location, Unit};
use crate::models::state::AppState;
use std::path::PathBuf;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub fn setup_backup(_path: String) {}

#[tauri::command]
pub fn save_preferences(
    local_config: LocalConfig,
    state: State<AppState>,
    app_handle: AppHandle,
) -> Result<(), String> {
    let mut l_config = state.local_config.lock().unwrap();
    *l_config = local_config;
    l_config
        .save(app_handle.path().app_data_dir().unwrap())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn setup_astrolog(
    app_handle: AppHandle,
    unit: Unit,
    root_directory: PathBuf,
    state: State<AppState>,
) -> Result<(), String> {
    let mut local_config = state.local_config.lock().unwrap();
    let path = PathBuf::from(&root_directory);

    let dir_is_empty: bool = is_directory_empty(&path).map_err(|e| e.to_string())?;
    let dir_contains_metadata: bool = dir_contains_metadata(&path).map_err(|e| e.to_string())?;

    if !dir_is_empty && !dir_contains_metadata {
        return Err(
            "Your selected folder has to be either empty or contain the .astrolog folder."
                .to_owned(),
        );
    }

    local_config.unit = unit;
    local_config.root_directory = root_directory;
    local_config
        .save(app_handle.path().app_data_dir().unwrap())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn change_imaging_session_folder_path(
    state: State<AppState>,
    base_folder: PathBuf,
    pattern: PathBuf,
) -> Result<(), String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    let local_config = state.local_config.lock().map_err(|e| e.to_string())?;
    let db = state.db.lock().map_err(|e| e.to_string())?;

    if !db.get_light_frames().map_err(|e| e.to_string())?.is_empty() {
        return Err("Feature not implemented: Can't change folder structure of already added imaging sessions in this version.".to_string());
    }

    let old_base = config
        .folder_paths
        .imaging_session_base_folder
        .clone();
    let old_pattern = config
        .folder_paths
        .imaging_session_pattern
        .clone();

    config.folder_paths.imaging_session_base_folder = base_folder;
    config.folder_paths.imaging_session_pattern = pattern;

    if let Err(e) = config
        .save(local_config.root_directory.clone())
    {
        // revert to old values on failure
        config.folder_paths.imaging_session_base_folder = old_base;
        config.folder_paths.imaging_session_pattern = old_pattern;
        return Err(e.to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn change_dark_frames_folder_path(
    state: State<AppState>,
    base_folder: PathBuf,
    pattern: PathBuf,
) -> Result<(), String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    let db = state.db.lock().map_err(|e| e.to_string())?;

    for dark_frame in db.get_dark_frames().map_err(|e| e.to_string())? {
        if !dark_frame.1.in_imaging_session {
            return Err("Feature not implemented: Can't change folder structure of already added dark frames in this version.".to_string());
        }
    }

    let old_base = config
        .folder_paths
        .calibration_base_folder
        .clone();
    let old_pattern = config.folder_paths.dark_frame_pattern.clone();

    config.folder_paths.calibration_base_folder = base_folder;
    config.folder_paths.dark_frame_pattern = pattern;

    if let Err(e) = config
        .save(state.root_directory.clone())
    {
        // revert to old values on failure
        config.folder_paths.calibration_base_folder = old_base;
        config.folder_paths.dark_frame_pattern = old_pattern;
        return Err(e.to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn change_bias_frames_folder_path(
    state: State<AppState>,
    base_folder: PathBuf,
    pattern: PathBuf,
) -> Result<(), String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    let db = state.db.lock().map_err(|e| e.to_string())?;

    if !db.get_bias_frames().map_err(|e| e.to_string())?.is_empty() {
        return Err("Feature not implemented: Can't change folder structure of already added bias frames in this version.".to_string());
    }

    let old_base = config
        .folder_paths
        .calibration_base_folder
        .clone();
    let old_pattern = config.folder_paths.bias_frame_pattern.clone();

    config.folder_paths.calibration_base_folder = base_folder;
    config.folder_paths.bias_frame_pattern = pattern;

    if let Err(e) = config
        .save(state.root_directory.clone())
    {
        // revert to old values on failure
        config.folder_paths.calibration_base_folder = old_base;
        config.folder_paths.bias_frame_pattern = old_pattern;
        return Err(e.to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn save_location(state: State<AppState>, location: Location) -> Result<(), String> {
    location.save(&state).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_location(state: State<AppState>, location: Location) -> Result<(), String> {
    location.delete(&state).map_err(|e| e.to_string())
}