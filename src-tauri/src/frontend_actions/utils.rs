use std::path::PathBuf;
use crate::utils::file_system::{is_directory_empty, rename_folder_with_overwrite};

#[tauri::command]
pub fn open_browser(url: &str) -> bool {
    webbrowser::open(url).is_ok()
}
#[tauri::command]
pub fn rename_directory(origin: PathBuf, destination: PathBuf) -> bool {
    return match is_directory_empty(&destination) {
        Ok(true) => {
            return match rename_folder_with_overwrite(&origin, &destination) {
                Ok(..) => {
                    println!("ok");
                    true
                }
                Err(e) => {
                    println!("Error renaming folder: {}", e);
                    false
                }
            }
        }
        Ok(false) => {
            println!("dir not empty");
            false
        }
        Err(e) => {
            println!("error: {}", e);
            false
        }
    };
}
