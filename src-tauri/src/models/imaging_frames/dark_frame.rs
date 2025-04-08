use crate::models::equipment::{EquipmentItem, EquipmentList};
use crate::models::frontend::state::CalibrationTableRow;
use crate::models::imaging_frames::calibration_type::CalibrationType;
use crate::models::imaging_frames::dark_frame;
use crate::models::imaging_frames::imaging_frame::ImagingSessionFrame;
use crate::models::imaging_frames::imaging_frame::{CalibrationFrame, ClassifiableFrame};
use crate::models::imaging_frames::imaging_frame_list::ImagingFrameList;
use crate::models::state::AppState;
use serde::{Deserialize, Serialize};
use std::any::Any;
use std::error::Error;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DarkFrame {
    pub id: Uuid,
    pub camera_id: Uuid,
    pub total_subs: u32,
    pub gain: u32,
    pub frames_to_classify: Vec<PathBuf>,
    pub frames_classified: Vec<PathBuf>,
    pub in_imaging_session: bool,

    #[serde(skip_serializing, skip_deserializing)]
    pub calibration_type: CalibrationType,

    pub camera_temp: f64,
    pub sub_length: f64,
}

impl ClassifiableFrame for DarkFrame {
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
        list.dark_frames.insert(self.id, self.clone());
    }

    fn remove_from_list(&self, list: &mut ImagingFrameList) {
        list.dark_frames.remove(&self.id);
    }
}

impl ImagingSessionFrame for DarkFrame {
    fn build_path(&self, base: &PathBuf) -> Result<PathBuf, Box<dyn Error>> {
        let mut path = base.clone();

        path.push("Dark");

        Ok(path)
    }
}

impl CalibrationFrame for DarkFrame {
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
        CalibrationType::DARK
    }

    fn calibration_table_row(
        &self,
        state: &State<Mutex<AppState>>,
    ) -> Result<CalibrationTableRow, Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;

        let camera_name = app_state
            .equipment_list
            .cameras
            .get(&self.camera_id)
            .map_or("N/A".to_string(), |camera| camera.view_name().clone());

        let row = CalibrationTableRow {
            id: self.id,
            camera: camera_name,
            calibration_type: CalibrationType::DARK,
            gain: self.gain,
            sub_length: Some(self.sub_length),
            camera_temp: Some(self.camera_temp),
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
            "SUBLENGTH" => self.sub_length.to_string(),
            "TOTALSUBS" => self.total_subs.to_string(),
            "GAIN" => self.gain.to_string(),
            "CAMERATEMP" => self.camera_temp.to_string(),
            _ => field.to_string(),
        }
    }

    fn build_path(&self, state: &State<Mutex<AppState>>) -> Result<PathBuf, Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;

        let mut base = app_state
            .config
            .folder_paths
            .calibration_base_folder
            .clone();
        base.push("Dark");
        let pattern = app_state.config.folder_paths.dark_frame_pattern.clone();
        let get_field_value =
            |field_name: &str| self.get_field_value(field_name, &app_state.equipment_list);

        crate::classify::build_path(&base, &pattern, get_field_value)
    }
}
