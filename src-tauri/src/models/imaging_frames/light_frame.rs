use tauri::{State, Window};
use std::sync::Mutex;
use std::path::PathBuf;
use std::error::Error;
use uuid::Uuid;
use std::fs;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use crate::commands::imaging_sessions::ImagingSessionEdit;
use crate::models::equipment::{EquipmentItem, EquipmentList};
use crate::models::frontend::process::Process;
use crate::models::imaging_frames::imaging_frame::{ClassifiableFrame, ImagingSessionFrame};
use crate::models::imaging_frames::imaging_frame_list::ImagingFrameList;
use crate::models::imaging_session::ImagingSession;
use crate::models::state::AppState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LightFrame {
    pub id: Uuid,
    pub frames_to_classify: Vec<PathBuf>,
    pub frames_classified: Vec<PathBuf>,

    pub date: DateTime<Utc>,
    pub target: String,
    pub location_id: Uuid,

    pub total_subs: u32,
    pub gain: u32,
    pub integrated_subs: Option<u32>,
    pub offset: Option<u32>,
    pub camera_temp: Option<f64>,
    pub notes: Option<String>,
    pub sub_length: f64,

    pub camera_id: Uuid,
    pub filter_id: Uuid,
    pub telescope_id: Uuid,
    pub flattener_id: Uuid,
    pub mount_id: Uuid,

    pub outside_temp: Option<f64>,
    pub average_seeing: Option<f64>,
    pub average_cloud_cover: Option<f64>,

    pub average_moon: f64,
}

impl LightFrame {
    pub fn from(session: &ImagingSessionEdit) -> LightFrame {
        LightFrame {
            id: Uuid::new_v4(),
            frames_to_classify: session.base.frames.clone(),
            frames_classified: vec![],

            date: session.general.date.clone(),
            target: session.general.target.clone(),
            location_id: session.general.location_id.clone(),

            total_subs: session.base.frames.len() as u32,
            gain: session.details.gain,
            integrated_subs: session.details.integrated_subs,
            offset: session.details.offset,
            camera_temp: session.details.camera_temp,
            notes: session.details.notes.clone(),
            sub_length: session.details.sub_length,

            telescope_id: session.equipment.telescope_id,
            flattener_id: session.equipment.flattener_id,
            mount_id: session.equipment.mount_id,
            camera_id: session.equipment.camera_id,
            filter_id: session.equipment.filter_id,

            outside_temp: session.weather.outside_temp,
            average_seeing: session.weather.average_seeing,
            average_cloud_cover: session.weather.average_cloud_cover,

            average_moon: 0.0, // TODO
        }
    }

    pub fn get_field_value(&self, field: &str, equipment_list: &EquipmentList) -> String {
        match field {
            "DATE" => self.date.format("%Y-%m-%d").to_string(),
            "TARGET" => self.target.clone(),
            "SITE" => "site".to_string(),
            "CAMERA" => equipment_list
                .cameras
                .get(&self.camera_id)
                .map_or("None".to_string(), |c| c.view_name().to_string()),
            "TELESCOPE" => equipment_list
                .telescopes
                .get(&self.telescope_id)
                .map_or("None".to_string(), |t| t.view_name().to_string()),
            "FILTER" => equipment_list
                .filters
                .get(&self.filter_id)
                .map_or("None".to_string(), |f| f.view_name().to_string()),
            "FILTERTYPE" => equipment_list
                .filters
                .get(&self.filter_id)
                .map_or("None".to_string(), |f| f.filter_type.to_string()),
            "SUBLENGTH" => self.sub_length.to_string(),
            "TOTALSUBS" => self.total_subs.to_string(),
            "GAIN" => self.gain.to_string(),
            _ => field.to_string(),
        }
    }
}

impl ClassifiableFrame for LightFrame {
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
        list.light_frames.insert(self.id, self.clone());
    }

    fn remove_from_list(&self, list: &mut ImagingFrameList) {
        list.light_frames.remove(&self.id);
    }
}

impl ImagingSessionFrame for LightFrame {
    fn build_path(&self, _state: &State<Mutex<AppState>>) -> Result<PathBuf, Box<dyn Error>> {
        Err("Not Supported!".into())
    }

    fn classify(&mut self, _state: &State<Mutex<AppState>>, _window: &Window, _process: &mut Process) -> Result<(), Box<dyn Error>> {
        Err("Not Supported!".into())
    }

    fn build_path_imaging_session(&self, base: &PathBuf) -> Result<PathBuf, Box<dyn Error>> {
        let mut path = base.clone();

        path.push("Light");

        Ok(path)
    }
}
