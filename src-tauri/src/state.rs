use crate::models::equipment::EquipmentList;
use crate::models::image::Image;
use crate::models::imaging_frames::ImagingFrameList;
use crate::models::imaging_session::ImagingSession;
use crate::models::preferences::Preferences;
use crate::utils::paths::APP_DATA_PATH;
use once_cell::sync::Lazy;
use std::path::PathBuf;
use std::sync::{RwLock, RwLockReadGuard, RwLockWriteGuard};

pub struct AppState {
    pub preferences: Preferences,
    pub equipment_list: EquipmentList,
    pub imaging_frame_list: ImagingFrameList,
    pub imaging_session_list: Vec<ImagingSession>,
    pub image_list: Vec<Image>,
}

impl AppState {
    fn new() -> Self {
        let mut preferences = Preferences::new();
        let mut equipment_list = EquipmentList::new();
        let mut imaging_frame_list = ImagingFrameList::new();
        let mut imaging_session_list = vec![];
        let mut image_list = vec![];

        match Preferences::load(APP_DATA_PATH.clone()) {
            Ok(data) => {
                preferences = data;
            }
            Err(err) => {
                eprintln!("Error loading preferences {}: {}", "", err);
            }
        }

        match EquipmentList::load(PathBuf::from(&preferences.storage.root_directory)) {
            Ok(data) => {
                equipment_list = data;
            }
            Err(err) => {
                eprintln!("Error loading equipment_list {}: {}", "", err);
            }
        }

        match ImagingFrameList::load(PathBuf::from(&preferences.storage.root_directory)) {
            Ok(data) => {
                imaging_frame_list = data;
            }
            Err(err) => {
                eprintln!("Error loading imaging_frame_list {}: {}", "", err);
            }
        }

        match ImagingSession::load_list(PathBuf::from(&preferences.storage.root_directory)) {
            Ok(data) => {
                imaging_session_list = data;
            }
            Err(err) => {
                eprintln!("Error loading imaging_session_list {}: {}", "", err);
            }
        }

        match Image::load_list(PathBuf::from(&preferences.storage.root_directory)) {
            Ok(data) => {
                image_list = data;
            }
            Err(err) => {
                eprintln!("Error loading image_list {}: {}", "", err);
            }
        }

        AppState {
            preferences,
            equipment_list,
            imaging_frame_list,
            imaging_session_list,
            image_list,
        }
    }
}

static APP_STATE: Lazy<RwLock<AppState>> = Lazy::new(|| RwLock::new(AppState::new()));

// Function to get a mutable reference to the AppState using RwLock
pub fn get_app_state() -> RwLockWriteGuard<'static, AppState> {
    APP_STATE.write().unwrap()
}

// Function to get a read-only reference to the AppState using RwLock
pub fn get_readonly_app_state() -> RwLockReadGuard<'static, AppState> {
    APP_STATE.read().unwrap()
}
