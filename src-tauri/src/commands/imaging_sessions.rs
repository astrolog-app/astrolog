use crate::models::database::Database;
use crate::models::frontend::state::LogTableRow;
use crate::models::imaging_frames::light_frame::LightFrame;
use crate::models::imaging_session::ImagingSession;
use crate::models::state::AppState;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::Mutex;
use tauri::{State, Window};
use uuid::Uuid;

#[tauri::command]
pub fn export_csv(path: PathBuf) {
    println!("{}", path.display());
} // TODO: implement

#[tauri::command]
pub fn open_imaging_session(state: State<AppState>, id: Uuid) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let mut path = state.root_directory.clone();
    path.push(
        db.get_imaging_session_by_id(id)
            .map_err(|e| e.to_string())?
            .ok_or("Imaging session not found.")?
            .folder_dir
            .clone(),
    );

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
pub fn get_image_frames_path(
    state: State<AppState>,
    id: Uuid,
) -> Result<Vec<PathBuf>, String> {
    let base_path = state.root_directory.clone();
    let db = state.db.lock().map_err(|e| e.to_string())?;

    let session = db
        .get_imaging_session_by_id(id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Session with ID {} not found", id))?;

    let light_frames = db
        .get_light_frame_by_id(session.light_frame_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| {
            format!(
                "No light frames found for session ID {}",
                session.light_frame_id
            )
        })?;

    let full_paths: Vec<PathBuf> = light_frames
        .frames_classified
        .iter()
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
    pub location_id: Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImagingSessionDetails {
    pub gain: u32,
    pub sub_length: f64,
    pub offset: Option<u32>,
    pub camera_temp: Option<f64>,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImagingSessionEquipment {
    pub camera_id: Uuid,
    pub telescope_id: Uuid,
    pub mount_id: Uuid,
    pub filter_id: Option<Uuid>,
    pub flattener_id: Option<Uuid>,
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
    pub flat_frames_to_classify: Vec<PathBuf>,
    pub dark_frames_to_classify: Vec<PathBuf>,
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
    state: State<AppState>,
    session: ImagingSessionEdit,
) -> Result<LogTableRow, String> {
    // create light_frame
    let light_frame = LightFrame::from(&session);

    // check for duplicates
    let mut path = state.root_directory.clone();
    path.push(ImagingSession::build_path(&light_frame, &state).map_err(|e| e.to_string())?);
    if path.exists() {
        let entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
        if entries.count() > 0 {
            return Err("Such an ImagingSession already exists.".to_string());
        }
    }

    // create imaging_session and save it to .json
    let imaging_session =
        ImagingSession::add_to_list(&state, &light_frame, &session.calibration, &session.base.id)
            .map_err(|e| e.to_string())?;

    let mut errors = Vec::new();

    // classify imaging session
    if let Err(e) = imaging_session.classify(&state, &window) {
        errors.push(format!("Error classifying frames: {}", e));
    }

    // create new log_table_row
    let log_table_row = match LogTableRow::new(&imaging_session, &state) {
        Some(row) => row,
        None => {
            errors.push("Failed to create LogTableRow".to_string()); // TODO
            return Err(errors.join("; "));
        }
    };

    if !errors.is_empty() {
        return Err(errors.join("; "));
    }

    Ok(log_table_row)
}

#[tauri::command]
pub fn edit_imaging_session(
    window: Window,
    state: State<Mutex<AppState>>,
    session: ImagingSessionEdit,
) -> Result<(), String> {
    Ok(())
}
