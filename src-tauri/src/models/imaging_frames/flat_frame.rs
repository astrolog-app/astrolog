use crate::models::imaging_frames::imaging_frame::{ClassifiableFrame, ImagingSessionFrame};
use crate::models::imaging_frames::imaging_frame_list::ImagingFrameList;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FlatFrame {
    pub id: Uuid,
    pub camera_id: Uuid,
    pub total_subs: u32,
    pub gain: u32,
    pub frames_to_classify: Vec<PathBuf>,
    pub frames_classified: Vec<PathBuf>,
}

impl ClassifiableFrame for FlatFrame {
    fn id(&self) -> Uuid {
        self.id
    }

    fn frames_to_classify(&self) -> &Vec<PathBuf> {
        &self.frames_to_classify
    }

    fn frames_to_classify_mut(&mut self) -> &mut Vec<PathBuf> {
        &mut self.frames_to_classify
    }

    fn frames_classified(&self) -> &Vec<PathBuf> {
        &self.frames_classified
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
}

impl ImagingSessionFrame for FlatFrame {
    fn build_path(&self, base: &PathBuf) -> Result<PathBuf, Box<dyn Error>> {
        let mut path = base.clone();

        path.push("Flat");

        Ok(path)
    }
}
