use std::sync::{Mutex, RwLock, RwLockReadGuard, RwLockWriteGuard};
use once_cell::sync::Lazy;
use crate::models::equipment::EquipmentList;
use crate::models::imaging_frames::ImagingFrameList;
use crate::models::imaging_session::ImagingSession;
use crate::file_stores::equipment_store;
use crate::file_stores::imaging_frames_store;
use crate::file_stores::imaging_sessions_store;

pub struct AppState {
    pub equipment_list: EquipmentList,
    pub imaging_frame_list: ImagingFrameList,
    pub imaging_session_list: Vec<ImagingSession>
}

impl AppState {
    fn new() -> Self {
        let mut equipment_list = EquipmentList::new();
        let mut imaging_frame_list = ImagingFrameList::new();
        let mut imaging_session_list = vec![];

        match equipment_store::load("C:/Users/rouve/Documents/Programming/astrolog/example_jsons/equipment.json") {
            Ok(data) => {
                equipment_list = data;
            },
            Err(err) => {
                eprintln!("Error loading {}: {}", "", err);
            }
        }

        match imaging_frames_store::load("C:/Users/rouve/Documents/Programming/astrolog/example_jsons/imagingFrames.json") {
            Ok(data) => {
                imaging_frame_list = data;
            },
            Err(err) => {
                eprintln!("Error loading {}: {}", "", err);
            }
        }

        match imaging_sessions_store::load("C:/Users/rouve/Documents/Programming/astrolog/example_jsons/imagingSessions.json") {
            Ok(data) => {
                imaging_session_list = data;
            },
            Err(err) => {
                eprintln!("Error loading {}: {}", "", err);
            }
        }

        AppState {
            equipment_list,
            imaging_frame_list,
            imaging_session_list
        }
    }
}

static APP_STATE: Lazy<RwLock<AppState>> = Lazy::new(|| {
    RwLock::new(AppState::new())
});

// Function to get a mutable reference to the AppState using RwLock
pub fn get_app_state() -> RwLockWriteGuard<'static, AppState> {
    APP_STATE.write().unwrap()
}

// Function to get a read-only reference to the AppState using RwLock
pub fn get_readonly_app_state() -> RwLockReadGuard<'static, AppState> {
    APP_STATE.read().unwrap()
}
