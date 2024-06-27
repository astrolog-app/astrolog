use serde::{Deserialize, Serialize};
use uuid::Uuid;

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
}

trait ImagingFrame {
    fn id(&self) -> &Uuid;
    fn camera_id(&self) -> &Uuid;
    fn total_subs(&self) -> &i32;
    fn gain(&self) -> &i32;
}

#[derive(Debug, Serialize, Deserialize)]
struct LightFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32,

    date: String,
    target: String,
    integrated_subs: i32,
    filter_id: Uuid,
    offset: i32,
    camera_temp: f64,
    outside_temp: f64,
    average_seeing: f64,
    average_cloud_cover: f64,
    average_moon: f64,
    telescope_id: Uuid,
    flattener_id: Uuid,
    mount_id: Uuid,
    notes: String,
    sub_length: f64
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
