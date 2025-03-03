use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::Mutex;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tauri::{State, Window};
use uuid::Uuid;
use crate::models::frontend::state::LogTableRow;
use crate::models::imaging_frames::LightFrame;
use crate::models::imaging_session_list::{ImagingSession, ImagingSessionList};
use crate::models::state::AppState;

#[tauri::command]
pub fn export_csv(path: PathBuf) {
    println!("{}", path.display());
} // TODO: implement

#[tauri::command]
pub fn open_imaging_session(state: State<Mutex<AppState>>, id: Uuid) -> Result<(), String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let path = app_state
        .imaging_sessions
        .get(&id)
        .ok_or("Imaging session not found.")?
        .folder_dir.clone();

    #[cfg(target_os = "windows")]
    let command = "explorer";

    #[cfg(target_os = "macos")]
    let command = "open";

    #[cfg(target_os = "linux")]
    let command = "xdg-open";

    {
        Command::new(command)
            .arg(&path)
            .status()
            .map_err(|e| e.to_string())
            .and_then(|status| {
                if status.success() {
                    Ok(())
                } else {
                    Err("There was an error opening the file explorer".to_string())
                }
            })?;
    }

    Ok(())
}

#[tauri::command]
pub fn get_image_frames_path(state: State<Mutex<AppState>>, id: Uuid) -> Result<Vec<PathBuf>, String> {
    let app_state = state.lock().map_err(|_| "Failed to acquire lock".to_string())?;
    let base_path = &app_state.local_config.root_directory;

    let session = app_state.imaging_sessions.get(&id)
        .ok_or_else(|| format!("Session with ID {} not found", id))?;

    let light_frames = app_state.imaging_frame_list.light_frames.get(&session.light_frame_id)
        .ok_or_else(|| format!("No light frames found for session ID {}", session.light_frame_id))?;

    let full_paths: Vec<PathBuf> = light_frames.frames_classified.iter()
        .map(|path| base_path.join(path))
        .collect();

    Ok(full_paths)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImagingSessionBase {
    pub id: Uuid,
    pub frames: Vec<PathBuf>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImagingSessionGeneral {
    pub date: DateTime<Utc>,
    pub target: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImagingSessionDetails {
    pub gain: u32,
    pub sub_length: f64,
    pub integrated_subs: Option<u32>,
    pub offset: Option<u32>,
    pub camera_temp: Option<f64>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImagingSessionEquipment {
    pub camera_id: Uuid,
    pub telescope_id: Uuid,
    pub flattener_id: Uuid,
    pub mount_id: Uuid,
    pub filter_id: Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImagingSessionWeather {
    pub outside_temp: Option<f64>,
    pub average_seeing: Option<f64>,
    pub average_cloud_cover: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImagingSessionCalibration {
    pub dark_frame_list_id: Option<Uuid>,
    pub bias_frame_list_id: Option<Uuid>,
    pub flat_frame_list_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImagingSessionEdit {
    pub base: ImagingSessionBase,
    pub general: ImagingSessionGeneral,
    pub details: ImagingSessionDetails,
    pub equipment: ImagingSessionEquipment,
    pub weather: ImagingSessionWeather,
    pub calibration: ImagingSessionCalibration,
}

#[tauri::command]
pub fn classify_imaging_session(
    window: Window,
    state: State<Mutex<AppState>>,
    session: ImagingSessionEdit
) -> Result<LogTableRow, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let root_directory = &app_state.local_config.root_directory.clone();
    drop(app_state);

    // create light_frame
    let mut light_frame = LightFrame::from(&session);

    // check for duplicates
    let path = ImagingSession::build_path(&light_frame);
    if path.exists() {
        let entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
        if entries.count() > 0 {
            return Err(
                return Err("Such an ImagingSession already exists.".to_string())
            );
        }
    }

    // create imaging_session and save it to .json
    let imaging_session = ImagingSessionList::add(state.clone(), &light_frame).map_err(|e| e.to_string())?;

    // classify the light_frames
    light_frame.classify(state.clone(), window, root_directory).map_err(|e| e.to_string())?;

    // TODO: classify flat frame

    // TODO: classify dark frames (if DSLR)

    // create a new log_table_row
    let log_table_row = LogTableRow::new(&imaging_session, &state.lock().unwrap()).ok_or("TODO")?;

    Ok(log_table_row)
}

#[tauri::command]
pub fn edit_imaging_session(
    window: Window,
    state: State<Mutex<AppState>>,
    session: ImagingSessionEdit
) -> Result<(), String> {
    Ok(())
}
