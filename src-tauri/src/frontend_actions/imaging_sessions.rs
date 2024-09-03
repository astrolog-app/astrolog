use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::time::UNIX_EPOCH;
use chrono::{DateTime, Local};
use uuid::Uuid;

#[tauri::command]
pub fn export_csv(path: PathBuf) {
    println!("{}", path.display());
} // TODO: implement

#[tauri::command]
pub fn open_imaging_session(id: Uuid) -> Result<(), String> {
    let path = PathBuf::from(""); // TODO: finish

    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .status()
            .map_err(|e| e.to_string())
            .and_then(|status| if status.success() {
                Ok(())
            } else {
                Err("Failed to open file explorer on Windows".to_string())
            })?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .status()
            .map_err(|e| e.to_string())
            .and_then(|status| if status.success() {
                Ok(())
            } else {
                Err("Failed to open file explorer on macOS".to_string())
            })?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .status()
            .map_err(|e| e.to_string())
            .and_then(|status| if status.success() {
                Ok(())
            } else {
                Err("Failed to open file explorer on Linux".to_string())
            })?;
    }

    Ok(())
}

#[tauri::command]
pub fn analyze_images(paths: Vec<PathBuf>) -> String {
    let metadata = fs::metadata("D:\\2024-08-29\\LIGHT\\2024-08-29_23-50-07___300.00s_0000.nef").expect("errorrr");

    return if let Ok(creation_time) = metadata.created() {
        let duration_since_epoch = creation_time.duration_since(UNIX_EPOCH).unwrap();
        let datetime = DateTime::<Local>::from(UNIX_EPOCH + duration_since_epoch);
        datetime.to_rfc3339()
    } else {
        String::from("")
    }
}
