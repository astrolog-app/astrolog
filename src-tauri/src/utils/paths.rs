use crate::state::get_readonly_app_state;
use once_cell::sync::Lazy;
use std::env;
use std::path::PathBuf;
use tauri::path;

pub static ROOT_DIRECTORY_PATH: Lazy<PathBuf> = Lazy::new(get_root_directory_path);
pub static APP_DATA_PATH: Lazy<PathBuf> = Lazy::new(get_app_data_path);


fn get_root_directory_path() -> PathBuf {
    PathBuf::from(&get_readonly_app_state().preferences.storage.root_directory)
}

fn get_app_data_path() -> PathBuf {
    PathBuf::from("C:\\Users\\rouve\\AppData\\Roaming\\AstroLog")
}