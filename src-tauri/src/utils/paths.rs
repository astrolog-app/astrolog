use std::env;
use std::path::{PathBuf};
use once_cell::sync::Lazy;
use tauri::api::path;
use crate::services::state::get_readonly_app_state;

pub static PROJECT_PATH: Lazy<PathBuf> = Lazy::new(get_project_path);
pub static CACHE_PATH: Lazy<PathBuf> = Lazy::new(get_cache_path);
pub static ROOT_DIRECTORY_PATH: Lazy<PathBuf> = Lazy::new(get_root_directory_path);
pub static APP_DATA_PATH: Lazy<PathBuf> = Lazy::new(get_app_data_path);


fn get_project_path() -> PathBuf {
    let current_dir = env::current_dir();
    match current_dir {
        Ok(v) => {
            let mut project_path = v;
            if project_path.pop() {
                project_path
            } else {
                PathBuf::from("")
            }
        }
        Err(e) => PathBuf::from("")
    }
}

fn get_cache_path() -> PathBuf {
    if let Some(mut cache_path) = path::cache_dir() {
        cache_path.push("AstroLog");
        cache_path
    } else {
        let mut project_path = get_project_path();
        project_path.push("cache");
        project_path
    }
}

fn get_root_directory_path() -> PathBuf {
    PathBuf::from(&get_readonly_app_state().preferences.storage.root_directory)
}

fn get_app_data_path() -> PathBuf {
    let path = path::data_dir();
    let mut path = path.unwrap_or_else(|| PathBuf::from(""));
    path.push("AstroLog");

    path
}
