use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::path::PathBuf;
use std::error::Error;
use std::sync::Mutex;
use tauri::State;
use std::any::Any;
use crate::models::equipment::{EquipmentItem, EquipmentList};
use crate::models::frontend::state::CalibrationTableRow;
use crate::models::imaging_frames::imaging_frame::{CalibrationFrame, ClassifiableFrame};
use crate::models::imaging_frames::calibration_type::CalibrationType;
use crate::models::imaging_frames::imaging_frame::ImagingSessionFrame;
use crate::models::imaging_frames::imaging_frame_list::ImagingFrameList;
use crate::models::state::AppState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BiasFrame {
    pub id: Uuid,
    pub camera_id: Uuid,
    pub total_subs: u32,
    pub gain: u32,
    pub frames_to_classify: Vec<PathBuf>,
    pub frames_classified: Vec<PathBuf>,

    #[serde(skip_serializing, skip_deserializing)]
    pub calibration_type: CalibrationType,
}

impl ClassifiableFrame for BiasFrame {
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
        list.bias_frames.insert(self.id, self.clone());
    }

    fn remove_from_list(&self, list: &mut ImagingFrameList) {
        list.bias_frames.remove(&self.id);
    }
}

impl CalibrationFrame for BiasFrame {

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

    fn calibration_table_row(&self, state: &State<Mutex<AppState>>) -> Result<CalibrationTableRow, Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;

        let camera_name = app_state
            .equipment_list
            .cameras
            .get(&self.camera_id)
            .map_or("N/A".to_string(), |camera| camera.view_name().clone());

        let row = CalibrationTableRow {
            id: self.id,
            camera: camera_name,
            calibration_type: CalibrationType::BIAS,
            gain: self.gain,
            sub_length: None,
            camera_temp: None,
            total_subs: self.total_subs,
        };

        Ok(row)
    }

    fn get_field_value(&self, field: &str, equipment_list: &EquipmentList) -> String {
        match field {
            "CAMERA" => equipment_list
                .cameras
                .get(&self.camera_id)
                .map_or("None".to_string(), |c| c.view_name().to_string()),
            "TOTALSUBS" => self.total_subs.to_string(),
            "GAIN" => self.gain.to_string(),
            _ => field.to_string(),
        }
    }

    fn build_path(&self, state: &State<Mutex<AppState>>) -> Result<PathBuf, Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;

        let mut base = app_state.config.folder_paths.calibration_base_folder.clone();
        base.push("Bias");
        let pattern = app_state.config.folder_paths.bias_frame_pattern.clone();
        let get_field_value = |field_name: &str| {
            self.get_field_value(field_name, &app_state.equipment_list)
        };

        crate::classify::build_path(&base, &pattern, get_field_value)
    }
}
