use std::path::PathBuf;
use std::process::Command;
use uuid::Uuid;

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
