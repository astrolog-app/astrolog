use crate::file_store;
use crate::models::state::AppState;
use serde::ser::SerializeStruct;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::any::Any;
use std::collections::HashMap;
use std::error::Error;
use std::fmt;
use std::path::PathBuf;
use std::sync::{Mutex, MutexGuard};
use tauri::State;
use uuid::Uuid;

#[derive(Debug)]
pub struct ImagingFrameList {
    pub light_frames: HashMap<Uuid, LightFrame>,
    pub dark_frames: HashMap<Uuid, DarkFrame>,
    pub bias_frames: HashMap<Uuid, BiasFrame>,
    flat_frames: HashMap<Uuid, FlatFrame>,
}

impl<'de> Deserialize<'de> for ImagingFrameList {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        #[derive(Deserialize)]
        struct TempImagingFrameList {
            light_frames: Vec<LightFrame>,
            dark_frames: Vec<DarkFrame>,
            bias_frames: Vec<BiasFrame>,
            flat_frames: Vec<FlatFrame>,
        }

        let TempImagingFrameList {
            light_frames,
            dark_frames,
            bias_frames,
            flat_frames,
        } = TempImagingFrameList::deserialize(deserializer)?;

        let light_frames_map: HashMap<Uuid, LightFrame> = light_frames
            .into_iter()
            .map(|frame| (frame.id, frame))
            .collect();

        let dark_frames_map: HashMap<Uuid, DarkFrame> = dark_frames
            .into_iter()
            .map(|frame| (frame.id, frame))
            .collect();

        let bias_frames_map: HashMap<Uuid, BiasFrame> = bias_frames
            .into_iter()
            .map(|frame| (frame.id, frame))
            .collect();

        let flat_frames_map: HashMap<Uuid, FlatFrame> = flat_frames
            .into_iter()
            .map(|frame| (frame.id, frame))
            .collect();

        Ok(ImagingFrameList {
            light_frames: light_frames_map,
            dark_frames: dark_frames_map,
            bias_frames: bias_frames_map,
            flat_frames: flat_frames_map,
        })
    }
}

impl Serialize for ImagingFrameList {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let light_frames: Vec<&LightFrame> = self.light_frames.values().collect();
        let dark_frames: Vec<&DarkFrame> = self.dark_frames.values().collect();
        let bias_frames: Vec<&BiasFrame> = self.bias_frames.values().collect();
        let flat_frames: Vec<&FlatFrame> = self.flat_frames.values().collect();

        let mut state = serializer.serialize_struct("ImagingFrameList", 4)?;
        state.serialize_field("light_frames", &light_frames)?;
        state.serialize_field("dark_frames", &dark_frames)?;
        state.serialize_field("bias_frames", &bias_frames)?;
        state.serialize_field("flat_frames", &flat_frames)?;
        state.end()
    }
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
        Ok(file_store::load(filename)?)
    }

    pub fn save(dir: PathBuf, imaging_frame_list: &ImagingFrameList) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push(".astrolog");
        filename.push("imaging_frame_list.json");
        Ok(file_store::save(
            filename,
            serde_json::to_string_pretty(imaging_frame_list)?,
        )?)
    }

    pub fn get_calibration_frames(app_state: &AppState) -> Vec<Box<dyn CalibrationFrame>> {
        // Clone the frames into vectors to own the data and avoid lifetime issues
        let dark_frames: Vec<_> = app_state
            .imaging_frame_list
            .dark_frames
            .values()
            .cloned()
            .collect();
        let bias_frames: Vec<_> = app_state
            .imaging_frame_list
            .bias_frames
            .values()
            .cloned()
            .collect();

        // Now process the cloned data
        dark_frames
            .into_iter()
            .map(|frame| Box::new(frame) as Box<dyn CalibrationFrame>)
            .chain(
                bias_frames
                    .into_iter()
                    .map(|frame| Box::new(frame) as Box<dyn CalibrationFrame>),
            )
            .collect()
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
    pub sub_length: f64,
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

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
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

impl fmt::Display for CalibrationType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CalibrationType::DARK => write!(f, "DARK"),
            CalibrationType::BIAS => write!(f, "BIAS"),
            CalibrationType::DEFAULT => write!(f, "DEFAULT"),
        }
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
    pub id: Uuid,
    pub camera_id: Uuid,
    pub total_subs: i32,
    pub gain: i32,
    pub frames: Vec<String>,

    #[serde(skip_serializing, skip_deserializing)]
    pub calibration_type: CalibrationType,

    pub camera_temp: f64,
    pub sub_length: f64,
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
    pub id: Uuid,
    pub camera_id: Uuid,
    pub total_subs: i32,
    pub gain: i32,
    pub frames: Vec<String>,

    #[serde(skip_serializing, skip_deserializing)]
    pub calibration_type: CalibrationType,
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
