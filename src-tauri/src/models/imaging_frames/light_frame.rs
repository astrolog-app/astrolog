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
use crate::models::imaging_frames::imaging_frame_list::ImagingFrameList;
use crate::models::imaging_session_list::ImagingSession;
use crate::models::state::AppState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LightFrame {
    pub id: Uuid,
    pub camera_id: Uuid,
    pub total_subs: u32,
    pub gain: u32,
    pub frames_to_classify: Vec<PathBuf>,
    pub frames_classified: Vec<PathBuf>,

    pub date: DateTime<Utc>,
    pub target: String,
    pub integrated_subs: Option<u32>,
    pub filter_id: Uuid,
    pub offset: Option<u32>,
    pub camera_temp: Option<f64>,
    pub outside_temp: Option<f64>,
    pub average_seeing: Option<f64>,
    pub average_cloud_cover: Option<f64>,
    pub average_moon: f64,
    pub telescope_id: Uuid,
    pub flattener_id: Uuid,
    pub mount_id: Uuid,
    pub notes: Option<String>,
    pub sub_length: f64,
    pub location_id: Uuid,
}

impl LightFrame {
    pub fn build_path(&self, state: &State<Mutex<AppState>>) -> Result<PathBuf, Box<dyn Error>> {
        let mut path = ImagingSession::build_path(self, state)?;

        path.push(PathBuf::from("Light"));

        Ok(path)
    }

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
            .light_frames
            .insert(self.id, self.clone());
        if let Err(e) = ImagingFrameList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_frame_list,
        ) {
            // revert
            app_state
                .imaging_frame_list
                .light_frames
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
