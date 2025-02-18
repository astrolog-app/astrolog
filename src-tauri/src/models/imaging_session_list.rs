use std::collections::HashMap;
use crate::file_store;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::error::Error;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
pub struct ImagingSessionList {
    pub imaging_session_list: HashMap<Uuid, ImagingSession>
}

impl ImagingSessionList {
    pub fn load(dir: PathBuf) -> Result<ImagingSessionList, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("imaging_session_list.json");
        Ok(file_store::load(&filename)?)
    }

    pub fn save(dir: PathBuf, imaging_session_list_map: &HashMap<Uuid, ImagingSession>) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push(".astrolog");
        filename.push("imaging_session_list.json");

        let imaging_session_list = ImagingSessionList {
            imaging_session_list: imaging_session_list_map.clone(),
        };

        Ok(file_store::save(
            &filename,
            &serde_json::to_string_pretty(&imaging_session_list)?,
        )?)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImagingSession {
    pub id: Uuid,
    pub folder_dir: String,
    pub light_frame_id: Uuid,
    pub flat_frame_id: Uuid,
    pub dark_frame_id: Uuid,
    pub bias_frame_id: Uuid,
}
