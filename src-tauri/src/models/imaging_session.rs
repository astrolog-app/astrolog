use crate::commands::imaging_sessions::ImagingSessionCalibration;
use crate::models::frontend::process::Process;
use crate::models::imaging_frames::imaging_frame::{ClassifiableFrame, ImagingSessionFrame};
use crate::models::imaging_frames::light_frame::LightFrame;
use crate::models::state::AppState;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{State, Window};
use uuid::Uuid;
use crate::models::database::Database;
use crate::models::imaging_frames::calibration_type::CalibrationType;
use crate::models::imaging_frames::dark_frame::DarkFrame;
use crate::models::imaging_frames::flat_frame::FlatFrame;

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
    pub fn add_to_list( // TODO: add revert via transactions
        state: &State<Mutex<AppState>>,
        light_frame: &LightFrame,
        calibration: &ImagingSessionCalibration,
        id: &Uuid,
    ) -> Result<Self, Box<dyn Error>> {
        let mut imaging_session = ImagingSession::from(state, &light_frame, &calibration, id)?;
        let mut flat_frame = None;
        let mut dark_frame = None;

        if calibration.flat_frames_to_classify.len() > 0 {
            let id = Uuid::new_v4();

            let frame = FlatFrame {
                id,
                camera_id: light_frame.camera_id,
                total_subs: calibration.flat_frames_to_classify.len() as u32,
                gain: light_frame.gain,
                frames_to_classify: calibration.flat_frames_to_classify.clone(),
                frames_classified: vec![],
            };

            imaging_session.flat_frame_id = Some(id);
            flat_frame = Some(frame);
        }

        if calibration.dark_frames_to_classify.len() > 0 {
            let id = Uuid::new_v4();

            let frame = DarkFrame {
                id,
                camera_id: light_frame.camera_id,
                total_subs: calibration.dark_frames_to_classify.len() as u32,
                gain: 0,
                frames_to_classify: calibration.dark_frames_to_classify.clone(),
                frames_classified: vec![],
                in_imaging_session: true,
                calibration_type: CalibrationType::DARK,
                camera_temp: 0.0,
                sub_length: light_frame.sub_length,
            };

            imaging_session.dark_frame_id = Some(id);
            dark_frame = Some(frame);
        }

        // Step 1: imaging session
        if let Err(e) = imaging_session.add(state) {
            imaging_session.remove(state).ok();
            return Err(e);
        }

        // Step 2: light frame
        if let Err(e) = light_frame.add(state) {
            light_frame.remove(state).ok();
            imaging_session.remove(state).ok();
            return Err(e);
        }

        // Step 3: flat frame
        if let Some(ref flat) = flat_frame {
            if let Err(e) = flat.add(state) {
                flat.remove(state).ok();
                light_frame.remove(state).ok();
                imaging_session.remove(state).ok();
                return Err(e);
            }
        }

        // Step 4: dark frame
        if let Some(ref dark) = dark_frame {
            if let Err(e) = dark.add(state) {
                dark.remove(state).ok();
                if let Some(ref flat) = flat_frame {
                    flat.remove(state).ok();
                }
                light_frame.remove(state).ok();
                imaging_session.remove(state).ok();
                return Err(e);
            }
        }

        Ok(imaging_session)
    }

    pub fn add(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;
        let db = Database::new(&app_state.local_config.root_directory)?;

        db.insert_imaging_session(&self)?;

        Ok(())
    }

    pub fn remove(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;
        let mut db = Database::new(&app_state.local_config.root_directory)?;

        db.remove_imaging_session(self.id)?;

        Ok(())
    }

    // pub fn edit(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
    //     Ok(())
    // }

    pub fn from(
        state: &State<Mutex<AppState>>,
        light_frame: &LightFrame,
        calibration: &ImagingSessionCalibration,
        id: &Uuid,
    ) -> Result<ImagingSession, Box<dyn Error>> {
        let folder_dir = ImagingSession::build_path(light_frame, state)?;

        let imaging_session = ImagingSession {
            id: id.clone(),
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
        let db = Database::new(&app_state.local_config.root_directory)?;

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
        let equipment_list = db.get_equipment_list()?;

        let get_field_value =
            |field_name: &str| light_frame.get_field_value(field_name, &equipment_list);

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
            if let Err(e) = frame.classify(state, window, &mut process, &self.folder_dir) {
                errors.push(format!("Dark frame error: {}", e));
            }
        }

        if let Some(mut frame) = flat_frame {
            if let Err(e) = frame.classify(state, window, &mut process, &self.folder_dir) {
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
