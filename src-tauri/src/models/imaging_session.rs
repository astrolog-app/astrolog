use std::error::Error;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::file_store;
use crate::state::get_readonly_app_state;

#[derive(Debug, Serialize, Deserialize)]
pub struct ImagingSession {
    pub id: Uuid,
    pub folder_dir: String,
    pub light_frame_id: Uuid,
    pub flat_frame_id: Uuid,
    pub dark_frame_id: Uuid,
    pub bias_frame_id: Uuid,
}

impl ImagingSession {
    pub fn load_list(dir: PathBuf) -> Result<Vec<ImagingSession>, Box<dyn Error>> {
        let mut filename = dir;
        filename.push("imaging_session_list.json");
        Ok(file_store::load(filename)?)
    }

    pub fn save_list(dir: PathBuf) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push("imaging_session_list.json");
        Ok(file_store::save(dir, serde_json::to_string_pretty(&get_readonly_app_state().imaging_session_list)?)?)
    }
}
