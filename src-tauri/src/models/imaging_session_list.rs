use crate::file_store;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
use std::sync::Mutex;
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

    pub fn add(state: State<Mutex<AppState>>, light_frame: &LightFrame) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;
        let imaging_session = ImagingSession::from(&light_frame, &light_frame.id, &app_state.preferences.storage.root_directory.clone());

        // Step 1: Insert imaging session and save
        app_state.imaging_sessions.insert(imaging_session.id, imaging_session.clone());
        if let Err(e) = ImagingSessionList::save(
            app_state.preferences.storage.root_directory.clone(),
            &app_state.imaging_sessions
        ) {
            // Roll back: remove the inserted imaging session
            app_state.imaging_sessions.remove(&imaging_session.id);
            return Err(e);
        }

        // Step 2: Insert light frame and save
        app_state.imaging_frame_list.light_frames.insert(light_frame.id, light_frame.clone());
        if let Err(e) = ImagingFrameList::save(
            app_state.preferences.storage.root_directory.clone(),
            &app_state.imaging_frame_list
        ) {
            // Roll back both: remove light frame and imaging session
            app_state.imaging_frame_list.light_frames.remove(&light_frame.id);
            app_state.imaging_sessions.remove(&imaging_session.id);
            // Attempt to update the saved imaging session list after rollback
            let _ = ImagingSessionList::save(
                app_state.preferences.storage.root_directory.clone(),
                &app_state.imaging_sessions
            );
            return Err(e);
        }

        Ok(())
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
    pub fn from(light_frame: &LightFrame, id: &Uuid, root_directory: &PathBuf) -> ImagingSession {
        let folder_dir = light_frame.build_path(root_directory);

        ImagingSession {
            id: id.clone(),
            folder_dir,
            light_frame_id: light_frame.id.clone(),
            flat_frame_id: None,
            dark_frame_id: None,
            bias_frame_id: None,
        }
    }
}
