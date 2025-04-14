use crate::models::imaging_frames::bias_frame::BiasFrame;
use crate::models::imaging_frames::dark_frame::DarkFrame;
use crate::models::imaging_frames::flat_frame::FlatFrame;
use crate::models::imaging_frames::light_frame::LightFrame;
use serde::ser::SerializeStruct;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::HashMap;
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
}
