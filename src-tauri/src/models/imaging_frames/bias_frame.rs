use crate::models::equipment::{Camera, EquipmentItem};
use crate::models::frontend::state::CalibrationTableRow;
use crate::models::imaging_frames::calibration_type::CalibrationType;
use crate::models::imaging_frames::imaging_frame::ImagingSessionFrame;
use crate::models::imaging_frames::imaging_frame::{CalibrationFrame, ClassifiableFrame};
use crate::models::state::AppState;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::path::PathBuf;
use tauri::State;
use uuid::Uuid;
use crate::models::database::Database;

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

    fn add_to_database(&self, db: &mut Database) -> Result<(), Box<dyn Error>> {
        Ok(db.insert_bias_frame(&self)?)
    }

    fn remove_from_database(&self, db: &mut Database) -> Result<(), Box<dyn Error>> {
        Ok(db.remove_bias_frame(self.id)?)
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

    fn calibration_table_row(
        &self,
        state: &State<AppState>,
    ) -> Result<CalibrationTableRow, Box<dyn Error>> {
        let db = state.db.lock().map_err(|e| e.to_string())?;

        let camera_name = db
            .get_camera_by_id(self.camera_id)?
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

    fn get_field_value(&self, field: &str, camera: &Option<Camera>) -> String {
        match field {
            "CAMERA" => camera
                .clone()
                .map_or("None".to_string(), |c| c.view_name().to_string()),
            "TOTALSUBS" => self.total_subs.to_string(),
            "GAIN" => self.gain.to_string(),
            _ => field.to_string(),
        }
    }

    fn build_path(&self, state: &State<AppState>) -> Result<PathBuf, Box<dyn Error>> {
        let db = state.db.lock().map_err(|e| e.to_string())?;
        let config = state.config.lock().map_err(|e| e.to_string())?;

        let mut base = config
            .folder_paths
            .calibration_base_folder
            .clone();
        base.push("Bias");
        let pattern = config.folder_paths.bias_frame_pattern.clone();
        let camera = db.get_camera_by_id(self.camera_id)?;
        let get_field_value =
            |field_name: &str| self.get_field_value(field_name, &camera);

        crate::classify::build_path(&base, &pattern, get_field_value)
    }
}
