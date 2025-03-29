use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::path::PathBuf;
use std::any::Any;
use std::error::Error;
use std::sync::Mutex;
use tauri::State;
use crate::models::imaging_frames::imaging_frame_list::{CalibrationFrame, CalibrationType, ImagingFrameList};
use crate::models::state::AppState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BiasFrame {
    pub id: Uuid,
    pub camera_id: Uuid,
    pub total_subs: u32,
    pub gain: u32,
    pub frames: Vec<PathBuf>,

    #[serde(skip_serializing, skip_deserializing)]
    pub calibration_type: CalibrationType,
}

impl CalibrationFrame for BiasFrame {
    fn id(&self) -> &Uuid {
        &self.id
    }

    fn camera_id(&self) -> &Uuid {
        &self.camera_id
    }

    fn total_subs(&self) -> &u32 {
        &self.total_subs
    }

    fn gain(&self) -> &u32 {
        &self.gain
    }
    fn calibration_type(&self) -> CalibrationType {
        CalibrationType::BIAS
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}

impl BiasFrame {
    pub fn add(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;

        app_state.imaging_frame_list.bias_frames.insert(self.id, self.clone());

        ImagingFrameList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_frame_list,
        )
    }

    pub fn remove(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;

        app_state.imaging_frame_list.bias_frames.remove(&self.id);

        ImagingFrameList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_frame_list,
        )
    }

}
