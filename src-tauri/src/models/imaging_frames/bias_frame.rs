use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::path::PathBuf;
use std::error::Error;
use std::fs;
use std::sync::Mutex;
use tauri::{State, Window};
use crate::models::equipment::{EquipmentItem, EquipmentList};
use crate::models::frontend::process::Process;
use crate::models::imaging_frames::calibration_frame::CalibrationFrame;
use crate::models::imaging_frames::calibration_type::CalibrationType;
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

    pub fn edit(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        Ok(())
    }

    pub fn build_path(&self, state: &State<Mutex<AppState>>) -> Result<PathBuf, Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;

        let mut base = app_state.config.folder_paths.dark_frame_folder_path.base_folder.clone();
        base.push("Bias");
        let pattern = app_state.config.folder_paths.bias_frame_folder_path.pattern.clone();
        let get_field_value = |field_name: &str| {
            self.get_field_value(field_name, &app_state.equipment_list)
        };

        crate::classify::build_path(&base, &pattern, get_field_value)
    }

    pub fn get_field_value(&self, field: &str, equipment_list: &EquipmentList) -> String {
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

    fn classify_helper(
        &mut self,
        base: &PathBuf,
        file_name: &PathBuf,
        frame: &PathBuf,
        destination: &PathBuf,
        state: &State<Mutex<AppState>>,
    ) -> Result<(), Box<dyn Error>> {
        // adjust self and save to .json
        let old = self.clone();

        let mut classify_path = base.clone();
        classify_path.push(file_name);
        self.frames_classified.push(classify_path);

        // remove file_to_classify
        self.frames_to_classify.retain(|path| path != frame);
        let mut app_state = state.lock().map_err(|e| e.to_string())?;
        app_state
            .imaging_frame_list
            .bias_frames
            .insert(self.id, self.clone());
        if let Err(e) = ImagingFrameList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_frame_list,
        ) {
            // revert
            app_state
                .imaging_frame_list
                .bias_frames
                .insert(old.id, old);
            fs::remove_file(&destination).ok();
        };
        drop(app_state);

        Ok(())
    }

    pub fn classify(
        &mut self,
        state: &State<Mutex<AppState>>,
        window: &Window,
        process: &mut Process,
    ) -> Result<(), Box<dyn Error>> {
        let base = self.build_path(state)?;
        let frames = self.frames_to_classify.clone();
        let helper = |base: &PathBuf,
                      file_name: &PathBuf,
                      frame: &PathBuf,
                      destination: &PathBuf,
                      state: &State<Mutex<AppState>>| {
            self.classify_helper(base, file_name, frame, destination, state)
        };

        crate::classify::classify(
            &base,
            &frames,
            state,
            helper,
            window,
            process,
        )?;

        Ok(())
    }
}
