use std::error::Error;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::services::file_store;
use crate::services::state::get_readonly_app_state;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Image {
    pub title: String,
    pub path: PathBuf,
    pub total_exposure: i32
}

impl Image {
    pub fn load_list(dir: PathBuf) -> Result<Vec<Image>, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("image_list.json");
        Ok(file_store::load(filename)?)
    }

    pub fn save_list(dir: PathBuf) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push(".astrolog");
        filename.push("image_list.json");
        Ok(file_store::save(filename, serde_json::to_string_pretty(&get_readonly_app_state().image_list)?)?)
    }
}
