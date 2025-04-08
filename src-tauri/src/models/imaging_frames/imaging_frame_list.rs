use crate::file_store;
use crate::models::imaging_frames::bias_frame::BiasFrame;
use crate::models::imaging_frames::dark_frame::DarkFrame;
use crate::models::imaging_frames::flat_frame::FlatFrame;
use crate::models::imaging_frames::light_frame::LightFrame;
use crate::models::state::AppState;
use serde::ser::SerializeStruct;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
pub struct ImagingFrameList {
    pub light_frames: HashMap<Uuid, LightFrame>,
    pub dark_frames: HashMap<Uuid, DarkFrame>,
    pub bias_frames: HashMap<Uuid, BiasFrame>,
    pub flat_frames: HashMap<Uuid, FlatFrame>,
}

impl ImagingFrameList {
    pub fn new() -> Self {
        ImagingFrameList {
            light_frames: HashMap::new(),
            dark_frames: HashMap::new(),
            bias_frames: HashMap::new(),
            flat_frames: HashMap::new(),
        }
    }

    pub fn load(dir: PathBuf) -> Result<ImagingFrameList, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("imaging_frame_list.json");
        Ok(file_store::load(&filename)?)
    }

    pub fn save(dir: PathBuf, imaging_frame_list: &ImagingFrameList) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push(".astrolog");
        filename.push("imaging_frame_list.json");
        Ok(file_store::save(
            &filename,
            &serde_json::to_string_pretty(imaging_frame_list)?,
        )?)
    }
}
