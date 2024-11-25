use crate::utils::file_system::{is_directory_empty, rename_folder_with_overwrite};
use std::path::PathBuf;

#[tauri::command]
pub fn open_browser(url: &str) -> Result<(), String> {
    webbrowser::open(url).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_directory(origin: PathBuf, destination: PathBuf) -> Result<(), String> {
    // Check if the destination directory is empty
    match is_directory_empty(&destination) {
        Ok(true) => {
            // Attempt to rename the folder with overwrite
            match rename_folder_with_overwrite(&origin, &destination) {
                Ok(..) => Ok(()),
                Err(e) => Err(format!("Error renaming folder: {}", e)),
            }
        }
        Ok(false) => Err("Destination directory is not empty".to_string()),
        Err(e) => Err(format!("Error checking directory: {}", e)),
    }
}
