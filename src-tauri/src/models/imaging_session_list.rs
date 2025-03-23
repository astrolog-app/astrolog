use crate::file_store;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::HashMap;
use std::error::Error;
use std::path::{Component, PathBuf};
use std::sync::Mutex;
use regex::Regex;
use tauri::{State, Window};
use uuid::Uuid;
use crate::models::equipment::{EquipmentItem, EquipmentList};
use crate::models::imaging_frames::{ImagingFrameList, LightFrame};
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

    pub fn add(state: &State<Mutex<AppState>>, light_frame: &LightFrame) -> Result<ImagingSession, Box<dyn Error>> {
        let imaging_session = ImagingSession::from(&light_frame, &light_frame.id, state);

        let mut app_state = state.lock().map_err(|e| e.to_string())?;

        // Step 1: Insert imaging session and save
        app_state.imaging_sessions.insert(imaging_session.id, imaging_session.clone());
        if let Err(e) = ImagingSessionList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_sessions
        ) {
            // Roll back: remove the inserted imaging session
            app_state.imaging_sessions.remove(&imaging_session.id);
            return Err(e);
        }

        // Step 2: Insert light frame and save
        app_state.imaging_frame_list.light_frames.insert(light_frame.id, light_frame.clone());
        if let Err(e) = ImagingFrameList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_frame_list
        ) {
            // Roll back both: remove light frame and imaging session
            app_state.imaging_frame_list.light_frames.remove(&light_frame.id);
            app_state.imaging_sessions.remove(&imaging_session.id);
            // Attempt to update the saved imaging session list after rollback
            let _ = ImagingSessionList::save(
                app_state.local_config.root_directory.clone(),
                &app_state.imaging_sessions
            );
            return Err(e);
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
    pub fn classify(&self, state: &State<Mutex<AppState>>, window: &Window) -> Result<(), Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;
        let mut light_frame = app_state.imaging_frame_list.light_frames.get(&self.light_frame_id).ok_or("light_frame_id not found")?.clone();
        drop(app_state);

        light_frame.classify(state, window)?;

        Ok(())
    }

    pub fn from(light_frame: &LightFrame, id: &Uuid, state: &State<Mutex<AppState>>) -> ImagingSession {
        let folder_dir = ImagingSession::build_path(light_frame, state);

        ImagingSession {
            id: id.clone(),
            folder_dir,
            light_frame_id: light_frame.id.clone(),
            flat_frame_id: None,
            dark_frame_id: None,
            bias_frame_id: None,
        }
    }

    fn get_field_value(
        light_frame: &LightFrame,
        field: &str,
        equipment_list: &EquipmentList,
    ) -> String {
        match field {
            "DATE" => light_frame.date.format("%Y-%m-%d").to_string(),
            "TARGET" => light_frame.target.clone(),
            "SITE" => "site".to_string(),
            "CAMERA" => equipment_list.cameras.get(&light_frame.camera_id)
                .map_or("None".to_string(), |c| c.view_name().to_string()),
            "TELESCOPE" => equipment_list.telescopes.get(&light_frame.telescope_id)
                .map_or("None".to_string(), |t| t.view_name().to_string()),
            "FILTER" => equipment_list.filters.get(&light_frame.filter_id)
                .map_or("None".to_string(), |f| f.view_name().to_string()),
            "FILTERTYPE" => equipment_list.filters.get(&light_frame.filter_id)
                .map_or("None".to_string(), |f| f.filter_type.to_string()),
            "SUBLENGTH" => light_frame.sub_length.to_string(),
            "TOTALSUBS" => light_frame.total_subs.to_string(),
            "GAIN" => light_frame.gain.to_string(),
            _ => field.to_string(),
        }
    }

    pub fn build_path(light_frame: &LightFrame, state: &State<Mutex<AppState>>) -> PathBuf {
        let app_state = state.lock().unwrap();

        let base_folder = app_state.config.folder_paths.imaging_session_folder_path.base_folder.clone();
        let pattern_path = app_state.config.folder_paths.imaging_session_folder_path.pattern.clone();

        let re = Regex::new(r"\$\$(\w+)\$\$").unwrap();
        let mut path = PathBuf::from(base_folder);

        for component in pattern_path.components() {
            if let Component::Normal(segment_osstr) = component {
                let segment = segment_osstr.to_string_lossy();
                let replaced = re.replace_all(&segment, |caps: &regex::Captures| {
                    let field_name = &caps[1];
                    ImagingSession::get_field_value(light_frame, field_name, &app_state.equipment_list)
                });
                let replaced_str = replaced.to_string();
                if !replaced_str.is_empty() {
                    path.push(replaced_str);
                }
            }
        }

        path
    }
}
