use std::collections::HashMap;
use crate::models::equipment::EquipmentList;
use crate::models::image_list::{Image, ImageList};
use crate::models::imaging_frames::ImagingFrameList;
use crate::models::imaging_session_list::{ImagingSession, ImagingSessionList};
use crate::models::preferences::Preferences;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use uuid::Uuid;

pub struct AppState {
    pub preferences: Preferences,
    pub equipment_list: EquipmentList,
    pub imaging_frame_list: ImagingFrameList,
    pub imaging_sessions: HashMap<Uuid, ImagingSession>,
    pub image_list: HashMap<Uuid, Image>,
    pub close_lock: bool,
}

impl AppState {
    pub fn new(app_handle: &AppHandle) -> Self {
        let mut preferences = Preferences::new();
        let mut equipment_list = EquipmentList::new();
        let mut imaging_frame_list = ImagingFrameList::new();
        let mut imaging_sessions: HashMap<Uuid, ImagingSession> = HashMap::new();
        let mut image_list: HashMap<Uuid, Image> = HashMap::new();

        match Preferences::load(app_handle.path().app_data_dir().unwrap()) {
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

        match ImagingSessionList::load(PathBuf::from(&preferences.storage.root_directory)) {
            Ok(data) => {
                imaging_sessions = data.imaging_session_list;
            }
            Err(err) => {
                eprintln!("Error loading imaging_session_list {}: {}", "", err);
            }
        }

        match ImageList::load(PathBuf::from(&preferences.storage.root_directory)) {
            Ok(data) => {
                image_list = data.image_list;
            }
            Err(err) => {
                eprintln!("Error loading image_list {}: {}", "", err);
            }
        }

        AppState {
            preferences,
            equipment_list,
            imaging_frame_list,
            imaging_sessions,
            image_list,
            close_lock: false,
        }
    }
}
