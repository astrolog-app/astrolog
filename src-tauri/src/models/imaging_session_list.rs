use crate::file_store;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
use std::sync::Mutex;
use regex::Regex;
use tauri::menu::NativeIcon::Path;
use tauri::State;
use uuid::Uuid;
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

    pub fn add(state: State<Mutex<AppState>>, light_frame: &LightFrame) -> Result<ImagingSession, Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;
        let imaging_session = ImagingSession::from(&light_frame, &light_frame.id);

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
    pub fn from(light_frame: &LightFrame, id: &Uuid) -> ImagingSession {
        let folder_dir = ImagingSession::build_path(light_frame);

        ImagingSession {
            id: id.clone(),
            folder_dir,
            light_frame_id: light_frame.id.clone(),
            flat_frame_id: None,
            dark_frame_id: None,
            bias_frame_id: None,
        }
    }

    // TODO
    fn get_field_value(light_frame: &LightFrame, field: &str) -> String {
        match field {
            "CAMERA" => light_frame.camera_id.to_string(),
            "GAIN" => light_frame.gain.to_string(),
            "DATE" => light_frame.date.to_string(),
            "TARGET" => light_frame.target.clone(),
            _ => "".to_string(),
        }
    }

    pub fn build_path(light_frame: &LightFrame) -> PathBuf {
        // TODO: what if path is invalid
        let mut path = PathBuf::from("Data");

        let template = "$$TARGET$$\\$$GAIN$$"; // TODO

        let segments = template.split('\\')
            .map(|segment| {
                // Use a regex to replace placeholders in the form $$FIELD$$.
                let re = Regex::new(r"\$\$(\w+)\$\$").unwrap();
                let replaced = re.replace_all(segment, |caps: &regex::Captures| {
                    let field_name = &caps[1];
                    // Only include a field if it exists (for Option fields, this means Some(_))
                    ImagingSession::get_field_value(light_frame, field_name)
                });
                replaced.to_string()
            })
            // Filter out segments that are empty (which might happen for None options)
            .filter(|s| !s.is_empty());

        // Push each segment into the final path
        for segment in segments {
            path.push(segment);
        }

        path
    }
}
