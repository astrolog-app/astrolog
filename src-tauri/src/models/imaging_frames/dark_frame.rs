use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::path::PathBuf;
use std::any::Any;
use crate::models::imaging_frames::imaging_frame_list::{CalibrationFrame, CalibrationType};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DarkFrame {
    pub id: Uuid,
    pub camera_id: Uuid,
    pub total_subs: i32,
    pub gain: i32,
    pub frames: Vec<PathBuf>,

    #[serde(skip_serializing, skip_deserializing)]
    pub calibration_type: CalibrationType,

    pub camera_temp: f64,
    pub sub_length: f64,
}

impl CalibrationFrame for DarkFrame {
    fn id(&self) -> &Uuid {
        &self.id
    }

    fn camera_id(&self) -> &Uuid {
        &self.camera_id
    }

    fn total_subs(&self) -> &i32 {
        &self.total_subs
    }

    fn gain(&self) -> &i32 {
        &self.gain
    }
    fn calibration_type(&self) -> CalibrationType {
        CalibrationType::DARK
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}