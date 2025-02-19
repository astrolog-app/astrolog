use std::path::PathBuf;
use std::process::Command;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;
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
