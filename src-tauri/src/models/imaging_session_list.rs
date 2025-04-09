use crate::commands::imaging_sessions::ImagingSessionCalibration;
use crate::file_store;
use crate::models::imaging_frames::calibration_type::CalibrationType;
use crate::models::imaging_frames::dark_frame::DarkFrame;
use crate::models::imaging_frames::flat_frame::FlatFrame;
use crate::models::imaging_frames::imaging_frame::{ClassifiableFrame, ImagingSessionFrame};
use crate::models::imaging_frames::light_frame::LightFrame;
use crate::models::imaging_session::ImagingSession;
use crate::models::state::AppState;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

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
        calibration: &ImagingSessionCalibration,
        id: &Uuid,
    ) -> Result<ImagingSession, Box<dyn Error>> {
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
}
