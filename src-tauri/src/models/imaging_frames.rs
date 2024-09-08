use std::any::Any;
use std::error::Error;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::file_store;
use crate::state;
use crate::state::get_readonly_app_state;

#[derive(Debug, Serialize, Deserialize)]
pub struct ImagingFrameList {
    light_frames: Vec<LightFrame>,
    pub dark_frames: Vec<DarkFrame>,
    pub bias_frames: Vec<BiasFrame>,
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

    pub fn get_calibration_frames() -> impl Iterator<Item = Box<dyn CalibrationFrame>> {
        let app_state = get_readonly_app_state();
        let dark_frames = app_state.imaging_frame_list.dark_frames.clone();
        let bias_frames = app_state.imaging_frame_list.bias_frames.clone();

        dark_frames.into_iter()
            .map(|frame| Box::new(frame) as Box<dyn CalibrationFrame>)
            .chain(
                bias_frames.into_iter()
                    .map(|frame| Box::new(frame) as Box<dyn CalibrationFrame>)
            )
    }
}

pub trait ImagingFrame {
    fn id(&self) -> &Uuid;
    fn camera_id(&self) -> &Uuid;
    fn total_subs(&self) -> &i32;
    fn gain(&self) -> &i32;
    fn frames(&self) -> &Vec<String>;
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LightFrame {
    pub id: Uuid,
    pub camera_id: Uuid,
    pub total_subs: i32,
    pub gain: i32,
    pub frames: Vec<String>,

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
    fn frames(&self) -> &Vec<String> {
        &self.frames
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum CalibrationType {
    DEFAULT,
    DARK,
    BIAS,
}

impl Default for CalibrationType {
    fn default() -> Self {
        CalibrationType::DEFAULT
    }
}

pub trait CalibrationFrame: Any {
    fn id(&self) -> &Uuid;
    fn camera_id(&self) -> &Uuid;
    fn total_subs(&self) -> &i32;
    fn gain(&self) -> &i32;

    fn calibration_type(&self) -> CalibrationType;
    fn as_any(&self) -> &dyn Any;
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DarkFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32,
    frames: Vec<String>,

    #[serde(skip_serializing, skip_deserializing)]
    calibration_type: CalibrationType,

    pub camera_temp: f64,
    pub sub_length: f64
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
    fn frames(&self) -> &Vec<String> {
        &self.frames
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
    fn as_any(&self) -> &dyn Any {
        self
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BiasFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32,
    frames: Vec<String>,

    #[serde(skip_serializing, skip_deserializing)]
    calibration_type: CalibrationType,
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
    fn frames(&self) -> &Vec<String> {
        &self.frames
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
    fn as_any(&self) -> &dyn Any {
        self
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct FlatFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32,
    frames: Vec<String>,
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
    fn frames(&self) -> &Vec<String> {
        &self.frames
    }
}
