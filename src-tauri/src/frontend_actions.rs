use std::{fs, io};
use std::path::PathBuf;
use crate::models::log::LogTableRow;
use crate::models::preferences::Preferences;
use crate::services::state::{FrontendAppState, get_app_state, get_readonly_app_state};
use crate::utils::paths::APP_DATA_PATH;
use webbrowser;
use crate::models::image::Image;

#[tauri::command]
pub fn load_frontend_app_state() -> String {
    let app_state = get_readonly_app_state();
    let preferences = app_state.preferences.clone();
    let imaging_session_list = &app_state.imaging_session_list;
    let image_list: Vec<Image> = app_state.image_list.clone();
    let mut log_data: Vec<LogTableRow> = vec![];
    println!("{:?}", app_state.image_list.clone().into_iter().nth(0));

    for imaging_session in imaging_session_list {
        log_data.push(LogTableRow::new(imaging_session));
    }

    let data = FrontendAppState {
        preferences,
        log_data,
        image_list,
    };

    serde_json::to_string(&data).unwrap()
}

fn is_directory_empty(path: &PathBuf) -> io::Result<bool> {
    let mut entries = fs::read_dir(path)?;
    Ok(entries.next().is_none())
}

fn rename_folder_with_overwrite(old_path: &PathBuf, new_path: &PathBuf) -> io::Result<()> {
    if fs::metadata(new_path).is_ok() {
        fs::remove_dir_all(new_path)?;
    }
    fs::rename(old_path, new_path)
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
    }
}

#[tauri::command]
pub fn check_meta_data_directory(path: String) {}

#[tauri::command]
pub fn setup_backup(path: String) {}

#[tauri::command]
pub fn save_preferences(preferences: Preferences) -> bool {
    get_app_state().preferences = preferences;
    return match Preferences::save(APP_DATA_PATH.clone()) {
        Ok(..) => {
            true
        }
        Err(e) => {
            // TODO: trigger modal
            false
        }
    };
}

#[tauri::command]
pub fn export_csv(path: PathBuf) {
    println!("{}", path.display());
} // TODO: implement

#[tauri::command]
pub fn open_browser(url: &str) -> bool {
    webbrowser::open(url).is_ok()
}
