use std::sync::{RwLock, RwLockReadGuard, RwLockWriteGuard};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use crate::models::equipment::EquipmentList;
use crate::models::imaging_frames::ImagingFrameList;
use crate::models::imaging_session::ImagingSession;
use crate::file_stores::preferences_store;
use crate::file_stores::equipment_store;
use crate::file_stores::imaging_frames_store;
use crate::file_stores::imaging_sessions_store;
use crate::models::preferences::Preferences;
use crate::models::log::LogTableRow;
use crate::paths::{APP_DATA_PATH, CACHE_PATH, ROOT_DIRECTORY_PATH};

pub struct AppState {
    pub preferences: Preferences,
    pub equipment_list: EquipmentList,
    pub imaging_frame_list: ImagingFrameList,
    pub imaging_session_list: Vec<ImagingSession>,
}

#[derive(Debug, Serialize, Deserialize)]
struct FrontendAppState {
    preferences: Preferences,
    log_data: Vec<LogTableRow>,
}

impl AppState {
    fn new() -> Self {
        let mut preferences = Preferences::new();
        let mut equipment_list = EquipmentList::new();
        let mut imaging_frame_list = ImagingFrameList::new();
        let mut imaging_session_list = vec![];

        match preferences_store::load("C:/Users/rouve/Documents/Programming/astrolog/example_jsons/preferences.json") {
            Ok(data) => {
                preferences = data;
            }
            Err(err) => {
                eprintln!("Error loading {}: {}", "", err);
            }
        }

        match equipment_store::load("C:/Users/rouve/Documents/Programming/astrolog/example_jsons/equipment.json") {
            Ok(data) => {
                equipment_list = data;
            }
            Err(err) => {
                eprintln!("Error loading {}: {}", "", err);
            }
        }

        match imaging_frames_store::load("C:/Users/rouve/Documents/Programming/astrolog/example_jsons/imaging_frames.json") {
            Ok(data) => {
                imaging_frame_list = data;
            }
            Err(err) => {
                eprintln!("Error loading {}: {}", "", err);
            }
        }

        match imaging_sessions_store::load("C:/Users/rouve/Documents/Programming/astrolog/example_jsons/imaging_sessions.json") {
            Ok(data) => {
                imaging_session_list = data;
            }
            Err(err) => {
                eprintln!("Error loading {}: {}", "", err);
            }
        }

        AppState {
            preferences,
            equipment_list,
            imaging_frame_list,
            imaging_session_list,
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

#[tauri::command]
pub fn load_app_state() {}

fn save_app_state(cache: bool) { // TODO: don't panic
    let mut e_path = if cache { CACHE_PATH.clone() } else { APP_DATA_PATH.clone() };
    e_path.push("equipment.json");
    let mut is_path = if cache { CACHE_PATH.clone() } else { ROOT_DIRECTORY_PATH.clone() };
    is_path.push("imaging_sessions.json");
    let mut if_path = if cache { CACHE_PATH.clone() } else { ROOT_DIRECTORY_PATH.clone() };
    if_path.push("imaging_frames.json");
    let mut p_path = if cache { CACHE_PATH.clone() } else { APP_DATA_PATH.clone() };
    p_path.push("preferences.json");

    equipment_store::save(e_path).expect("Failed to save equipment.json");
    imaging_sessions_store::save(is_path).expect("Failed to save imaging_sessions.json");
    imaging_frames_store::save(if_path).expect("Failed to save imaging_frames.json");
    preferences_store::save(p_path).expect("Failed to save preferences.json");
}

#[tauri::command]
pub fn load_frontend_app_state() -> String {
    let app_state = get_readonly_app_state();
    let preferences = app_state.preferences.clone();
    let imaging_session_list = &app_state.imaging_session_list;
    let mut log_data: Vec<LogTableRow> = vec![];

    for imaging_session in imaging_session_list {
        log_data.push(LogTableRow::new(imaging_session));
    }

    let data = FrontendAppState {
        preferences,
        log_data,
    };

    serde_json::to_string(&data).unwrap()
}

#[tauri::command]
pub fn save_frontend_app_state() {
    // save old app_state to cache
    save_app_state(true);

    // sync the backend with the frontend
    // ...

    // save app_state
    save_app_state(false);

    // push new state to frontend
    // ...
}
