use std::error::Error;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::models::equipment::EquipmentList;
use crate::{file_store, state};
use crate::state::get_readonly_app_state;

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
        filename.push("imaging_frame_list.json");
        Ok(file_store::load(filename)?)
    }

    pub fn save(dir: PathBuf) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push("imaging_frame_list.json");
        Ok(file_store::save(dir, serde_json::to_string_pretty(&get_readonly_app_state().imaging_frame_list)?)?)
    }
}

trait ImagingFrame {
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
struct DarkFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32,

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

#[derive(Debug, Serialize, Deserialize)]
struct BiasFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32
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
