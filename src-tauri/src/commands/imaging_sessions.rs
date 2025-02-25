use std::path::PathBuf;
use std::process::Command;
use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use tauri::{State, Window};
use uuid::Uuid;
use crate::models::imaging_frames::{ImagingFrameList, LightFrame};
use crate::models::imaging_session_list::{ImagingSession, ImagingSessionList};
use crate::models::state::AppState;

#[tauri::command]
pub fn export_csv(path: PathBuf) {
    println!("{}", path.display());
} // TODO: implement

#[tauri::command]
pub fn open_imaging_session(_id: Uuid) -> Result<(), String> {
    let path = PathBuf::from(""); // TODO: finish

    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .status()
            .map_err(|e| e.to_string())
            .and_then(|status| {
                if status.success() {
                    Ok(())
                } else {
                    Err("Failed to open file explorer on Windows".to_string())
                }
            })?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .status()
            .map_err(|e| e.to_string())
            .and_then(|status| {
                if status.success() {
                    Ok(())
                } else {
                    Err("Failed to open file explorer on macOS".to_string())
                }
            })?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .status()
            .map_err(|e| e.to_string())
            .and_then(|status| {
                if status.success() {
                    Ok(())
                } else {
                    Err("Failed to open file explorer on Linux".to_string())
                }
            })?;
    }

    Ok(())
}

#[tauri::command]
pub fn get_image_frames_path(state: State<Mutex<AppState>>, id: Uuid) -> Result<Vec<PathBuf>, String> {
    let app_state = state.lock().map_err(|_| "Failed to acquire lock".to_string())?;
    let base_path = &app_state.preferences.storage.root_directory;

    let session = app_state.imaging_sessions.get(&id)
        .ok_or_else(|| format!("Session with ID {} not found", id))?;

    let light_frames = app_state.imaging_frame_list.light_frames.get(&session.light_frame_id)
        .ok_or_else(|| format!("No light frames found for session ID {}", session.light_frame_id))?;

    let full_paths: Vec<PathBuf> = light_frames.frames.iter()
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
    pub date: String,
    pub target: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImagingSessionDetails {
    pub total_subs: u32,
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
) -> Result<(), String> {
    let mut app_state = state.lock().map_err(|e| e.to_string())?;

    let light_frames = LightFrame::from(&session);
    let imaging_session = ImagingSession::from(&light_frames, &light_frames.id);

    // first TODO
    app_state.imaging_sessions.insert(imaging_session.id, imaging_session);
    ImagingSessionList::save(
        app_state.preferences.storage.root_directory.clone(),
        &app_state.imaging_sessions
    ).map_err(|e| e.to_string())?;

    // second
    app_state.imaging_frame_list.light_frames.insert(light_frames.id, light_frames.clone());
    ImagingFrameList::save(
        app_state.preferences.storage.root_directory.clone(),
        &app_state.imaging_frame_list
    ).map_err(|e| e.to_string())?;

    // classify
    light_frames.classify(window).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn edit_imaging_session(state: State<Mutex<AppState>>, session: ImagingSessionEdit) -> Result<(), String> {
    Ok(())
}
