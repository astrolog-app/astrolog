use crate::file_store;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::HashMap;
use std::error::Error;
use std::path::{Component, PathBuf};
use std::sync::Mutex;
use regex::Regex;
use tauri::{State, Window};
use uuid::Uuid;
use crate::commands::imaging_sessions::ImagingSessionCalibration;
use crate::models::frontend::process::Process;
use crate::models::imaging_frames::dark_frame::DarkFrame;
use crate::models::imaging_frames::flat_frame::FlatFrame;
use crate::models::imaging_frames::imaging_frame_list::{CalibrationType, ImagingFrameList};
use crate::models::imaging_frames::light_frame::LightFrame;
use crate::models::state::AppState;

#[derive(Debug, Deserialize, Serialize)]
pub struct ImagingSessionList {
    pub imaging_session_list: HashMap<Uuid, ImagingSession>,
}

impl ImagingSessionList {
    pub fn load(dir: PathBuf) -> Result<ImagingSessionList, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("imaging_session_list.json");
        Ok(file_store::load(&filename)?)
    }

    pub fn save(
        dir: PathBuf,
        imaging_session_list_map: &HashMap<Uuid, ImagingSession>,
    ) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push(".astrolog");
        filename.push("imaging_session_list.json");

        let imaging_session_list = ImagingSessionList {
            imaging_session_list: imaging_session_list_map.clone(),
        };

        Ok(file_store::save(
            &filename,
            &serde_json::to_string_pretty(&imaging_session_list)?,
        )?)
    }

    pub fn add(
        state: &State<Mutex<AppState>>,
        light_frame: &LightFrame,
        calibration: &ImagingSessionCalibration
    ) -> Result<ImagingSession, Box<dyn Error>> {
        let mut imaging_session = ImagingSession::from(state, &light_frame, &calibration)?;
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
}

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
    fn add(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;

        app_state.imaging_sessions.insert(self.id, self.clone());

        ImagingSessionList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_sessions,
        )
    }

    fn remove(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;

        app_state.imaging_sessions.remove(&self.id);

        ImagingSessionList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_sessions,
        )
    }

    pub fn classify(
        &self,
        state: &State<Mutex<AppState>>,
        window: &Window,
    ) -> Result<(), Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;

        let mut light_frame = app_state.imaging_frame_list.light_frames.get(&self.light_frame_id).ok_or("light_frame_id not found")?.clone();
        let dark_frame = self.dark_frame_id
            .as_ref()
            .and_then(|id| app_state.imaging_frame_list.dark_frames.get(id).cloned());
        let flat_frame = self.flat_frame_id
            .as_ref()
            .and_then(|id| app_state.imaging_frame_list.flat_frames.get(id).cloned());

        let mut len = light_frame.total_subs;
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
            Some(len)
        );

        let mut errors = Vec::new();

        if let Err(e) = light_frame.classify(state, window, &mut process) {
            errors.push(format!("Light frame error: {}", e));
        }

        if let Some(mut frame) = dark_frame {
            if let Err(e) = frame.classify(state, window, &mut process) {
                errors.push(format!("Dark frame error: {}", e));
            }
        }

        if let Some(mut frame) = flat_frame {
            if let Err(e) = frame.classify(state, window, &mut process) {
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

    pub fn from(
        state: &State<Mutex<AppState>>,
        light_frame: &LightFrame,
        calibration: &ImagingSessionCalibration
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

    pub fn build_path(light_frame: &LightFrame, state: &State<Mutex<AppState>>) -> Result<PathBuf, Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;

        let base_folder = app_state.config.folder_paths.imaging_session_folder_path.base_folder.clone();
        let pattern_path = app_state.config.folder_paths.imaging_session_folder_path.pattern.clone();

        let re = Regex::new(r"\$\$(\w+)\$\$")?;
        let mut path = PathBuf::from(base_folder);

        for component in pattern_path.components() {
            if let Component::Normal(segment_osstr) = component {
                let segment = segment_osstr.to_string_lossy();
                let replaced = re.replace_all(&segment, |caps: &regex::Captures| {
                    let field_name = &caps[1];
                    light_frame.get_field_value(field_name, &app_state.equipment_list)
                });
                let replaced_str = replaced.to_string();
                if !replaced_str.is_empty() {
                    path.push(replaced_str);
                }
            }
        }

        Ok(path)
    }
}
