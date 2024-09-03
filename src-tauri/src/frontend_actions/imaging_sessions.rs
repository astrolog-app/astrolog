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
pub fn open_imaging_session(id: Uuid) {
    let path = PathBuf::from(""); // TODO: finish

    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("explorer")
            .arg(path)
            .status()
            .expect("Failed to open file explorer on Windows"); // TODO: error handling
    }

    #[cfg(target_os = "macos")]
    {
        let _ = Command::new("open")
            .arg(path)
            .status()
            .expect("Failed to open file explorer on macOS");
    }

    #[cfg(target_os = "linux")]
    {
        let _ = Command::new("xdg-open")
            .arg(path)
            .status()
            .expect("Failed to open file explorer on Linux");
    }

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
