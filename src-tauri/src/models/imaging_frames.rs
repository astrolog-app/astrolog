use std::error::Error;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::services::{file_store, state};
use crate::services::state::get_readonly_app_state;

#[derive(Debug, Serialize, Deserialize)]
pub struct ImagingFrameList {
    light_frames: Vec<LightFrame>,
    dark_frames: Vec<DarkFrame>,
    bias_frames: Vec<BiasFrame>,
    flat_frames: Vec<FlatFrame>
}

impl ImagingFrameList {
    pub fn new() -> Self {
        ImagingFrameList {
            light_frames: vec![],
            dark_frames: vec![],
            bias_frames: vec![],
            flat_frames: vec![],
        }
    }

    pub fn load(dir: PathBuf) -> Result<ImagingFrameList, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("imaging_frame_list.json");
        Ok(file_store::load(filename)?)
    }

    pub fn save(dir: PathBuf) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push(".astrolog");
        filename.push("imaging_frame_list.json");
        Ok(file_store::save(filename, serde_json::to_string_pretty(&get_readonly_app_state().imaging_frame_list)?)?)
    }
}

pub trait ImagingFrame {
    fn id(&self) -> &Uuid;
    fn camera_id(&self) -> &Uuid;
    fn total_subs(&self) -> &i32;
    fn gain(&self) -> &i32;
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LightFrame {
    pub id: Uuid,
    pub camera_id: Uuid,
    pub total_subs: i32,
    pub gain: i32,

    pub date: String,
    pub target: String,
    pub integrated_subs: i32,
    pub filter_id: Uuid,
    pub offset: i32,
    pub camera_temp: f64,
    pub outside_temp: f64,
    pub average_seeing: f64,
    pub average_cloud_cover: f64,
    pub average_moon: f64,
    pub telescope_id: Uuid,
    pub flattener_id: Uuid,
    pub mount_id: Uuid,
    pub notes: String,
    pub sub_length: f64
}

impl ImagingFrame for LightFrame {
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
}

pub fn get_light_frame(id: &Uuid) -> LightFrame {
    let app_state = state::get_readonly_app_state();
    let light_frame_list = &app_state.imaging_frame_list.light_frames;

    light_frame_list.iter()
        .find(|&light_frame| &light_frame.id == id)
        .cloned()
        .expect("LightFrame not found")
}

#[derive(Debug, Serialize, Deserialize)]
enum CalibrationType {
    DEFAULT,
    DARK,
    BIAS,
}

impl Default for CalibrationType {
    fn default() -> Self {
        CalibrationType::DEFAULT
    }
}

pub trait CalibrationFrame {
    fn id(&self) -> &Uuid;
    fn camera_id(&self) -> &Uuid;
    fn total_subs(&self) -> &i32;
    fn gain(&self) -> &i32;

    fn calibration_type(&self) -> CalibrationType;
    fn path(&self) -> &str;
}

#[derive(Debug, Serialize, Deserialize)]
struct DarkFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32,

    #[serde(skip_serializing, skip_deserializing)]
    calibration_type: CalibrationType,
    path: String,

    camera_temp: f64,
    sub_length: f64
}

impl ImagingFrame for DarkFrame {
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
    fn path(&self) -> &str {
        &self.path
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct BiasFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32,

    #[serde(skip_serializing, skip_deserializing)]
    calibration_type: CalibrationType,
    path: String,
}

impl ImagingFrame for BiasFrame {
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
}

impl CalibrationFrame for BiasFrame {
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
        CalibrationType::BIAS
    }
    fn path(&self) -> &str {
        &self.path
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct FlatFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32
}

impl ImagingFrame for FlatFrame {
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
}
