use std::collections::HashMap;
use crate::file_store;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::error::Error;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug)]
pub struct ImagingSessionList {
    pub imaging_sessions: HashMap<Uuid, ImagingSession>
}

impl<'de> Deserialize<'de> for ImagingSessionList {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let imaging_sessions: Vec<ImagingSession> = Vec::deserialize(deserializer)?;

        let imaging_session_map: HashMap<Uuid, ImagingSession> = imaging_sessions
            .into_iter()
            .map(|session| (session.id, session))
            .collect();

        Ok(ImagingSessionList {
            imaging_sessions: imaging_session_map,
        })
    }
}

impl Serialize for ImagingSessionList {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let imaging_sessions: Vec<&ImagingSession> = self.imaging_sessions.values().collect();
        imaging_sessions.serialize(serializer)
    }
}

impl ImagingSessionList {
    pub fn load(dir: PathBuf) -> Result<ImagingSessionList, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("imaging_session_list.json");
        Ok(file_store::load(filename)?)
    }

    pub fn save(dir: PathBuf, imaging_session_list: &ImagingSessionList) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push(".astrolog");
        filename.push("imaging_session_list.json");
        Ok(file_store::save(
            filename,
            serde_json::to_string_pretty(imaging_session_list)?,
        )?)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImagingSession {
    pub id: Uuid,
    pub folder_dir: String,
    pub light_frame_id: Uuid,
    pub flat_frame_id: Uuid,
    pub dark_frame_id: Uuid,
    pub bias_frame_id: Uuid,
}
