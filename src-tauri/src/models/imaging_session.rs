use crate::commands::imaging_sessions::ImagingSessionCalibration;
use crate::models::frontend::process::Process;
use crate::models::imaging_frames::light_frame::LightFrame;
use crate::models::imaging_session_list::ImagingSessionList;
use crate::models::state::AppState;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::path::{Component, PathBuf};
use std::sync::Mutex;
use tauri::{State, Window};
use uuid::Uuid;
use crate::models::imaging_frames::imaging_frame::{ClassifiableFrame, ImagingSessionFrame};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImagingSession {
    pub id: Uuid,
    pub folder_dir: PathBuf,
    pub light_frame_id: Uuid,
    pub flat_frame_id: Option<Uuid>,
    pub dark_frame_id: Option<Uuid>,
    pub bias_frame_id: Option<Uuid>,
}

impl ImagingSession {
    pub fn add(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;

        app_state.imaging_sessions.insert(self.id, self.clone());

        ImagingSessionList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_sessions,
        )
    }

    pub fn remove(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;

        app_state.imaging_sessions.remove(&self.id);

        ImagingSessionList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_sessions,
        )
    }

    pub fn edit(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        Ok(())
    }

    pub fn from(
        state: &State<Mutex<AppState>>,
        light_frame: &LightFrame,
        calibration: &ImagingSessionCalibration,
    ) -> Result<ImagingSession, Box<dyn Error>> {
        let folder_dir = ImagingSession::build_path(light_frame, state)?;

        let imaging_session = ImagingSession {
            id: light_frame.id.clone(),
            folder_dir,
            light_frame_id: light_frame.id.clone(),
            flat_frame_id: None,
            dark_frame_id: calibration.dark_frame_list_id,
            bias_frame_id: calibration.bias_frame_list_id,
        };

        Ok(imaging_session)
    }

    pub fn build_path(
        light_frame: &LightFrame,
        state: &State<Mutex<AppState>>,
    ) -> Result<PathBuf, Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;

        let base_folder = app_state
            .config
            .folder_paths
            .imaging_session_base_folder
            .clone();
        let pattern_path = app_state
            .config
            .folder_paths
            .imaging_session_pattern
            .clone();

        let get_field_value =
            |field_name: &str| light_frame.get_field_value(field_name, &app_state.equipment_list);

        let path = crate::classify::build_path(&base_folder, &pattern_path, get_field_value)?;

        Ok(path)
    }

    pub fn classify(
        &self,
        state: &State<Mutex<AppState>>,
        window: &Window,
    ) -> Result<(), Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;

        let mut light_frame = app_state
            .imaging_frame_list
            .light_frames
            .get(&self.light_frame_id)
            .ok_or("light_frame_id not found")?
            .clone();
        let dark_frame = self
            .dark_frame_id
            .as_ref()
            .and_then(|id| app_state.imaging_frame_list.dark_frames.get(id).cloned());
        let flat_frame = self
            .flat_frame_id
            .as_ref()
            .and_then(|id| app_state.imaging_frame_list.flat_frames.get(id).cloned());

        let mut len = light_frame.total_subs();
        if let Some(ref frame) = dark_frame {
            len += frame.total_subs;
        }
        if let Some(ref frame) = flat_frame {
            len += frame.total_subs;
        }

        drop(app_state);

        let mut process = Process::spawn(
            &window,
            "Classifying Imaging Session",
            true,
            Some(0),
            Some(len),
        );

        let mut errors = Vec::new();

        let base = ImagingSession::build_path(&light_frame, state)?;
        if let Err(e) = light_frame.classify(state, window, &mut process, &base) {
            errors.push(format!("Light frame error: {}", e));
        }

        if let Some(mut frame) = dark_frame {
            if let Err(e) =
                frame.classify(state, window, &mut process, &self.folder_dir)
            {
                errors.push(format!("Dark frame error: {}", e));
            }
        }

        if let Some(mut frame) = flat_frame {
            if let Err(e) =
                frame.classify(state, window, &mut process, &self.folder_dir)
            {
                errors.push(format!("Flat frame error: {}", e));
            }
        }

        if errors.is_empty() {
            process.finish(window);
            Ok(())
        } else {
            let message = format!("Classification failed:\n{}", errors.join("\n"));
            process.kill(window, message.clone());
            Err(message.into())
        }
    }
}
