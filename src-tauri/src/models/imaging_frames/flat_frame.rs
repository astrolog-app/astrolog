use std::error::Error;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{State, Window};
use crate::models::frontend::process::Process;
use crate::models::imaging_frames::imaging_frame::ImagingFrame;
use crate::models::imaging_frames::imaging_frame_list::ImagingFrameList;
use crate::models::state::AppState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FlatFrame {
    pub id: Uuid,
    pub camera_id: Uuid,
    pub total_subs: u32,
    pub gain: u32,
    pub frames_to_classify: Vec<PathBuf>,
    pub frames_classified: Vec<PathBuf>,
}

impl ImagingFrame for FlatFrame {
    fn id(&self) -> Uuid {
        self.id
    }

    fn frames_to_classify(&self) -> &Vec<PathBuf> {
        &self.frames_to_classify
    }

    fn frames_to_classify_mut(&mut self) -> &mut Vec<PathBuf> {
        &mut self.frames_to_classify
    }

    fn frames_classified_mut(&mut self) -> &mut Vec<PathBuf> {
        &mut self.frames_classified
    }

    fn add_to_list(&self, list: &mut ImagingFrameList) {
        list.flat_frames.insert(self.id, self.clone());
    }

    fn remove_from_list(&self, list: &mut ImagingFrameList) {
        list.flat_frames.remove(&self.id);
    }

    fn build_path(&self, _state: &State<Mutex<AppState>>) -> Result<PathBuf, Box<dyn Error>> {
        Err("Not Supported!".into())
    }

    fn classify(&mut self, _state: &State<Mutex<AppState>>, _window: &Window, _process: &mut Process) -> Result<(), Box<dyn Error>> {
        Err("Not Supported!".into())
    }

    fn build_path_imaging_session(&self, base: &PathBuf) -> Result<PathBuf, Box<dyn Error>> {
        let mut path = base.clone();

        path.push("Flat");

        Ok(path)
    }
}
