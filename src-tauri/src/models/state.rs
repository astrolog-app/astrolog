use std::collections::HashMap;
use crate::models::equipment::EquipmentList;
use crate::models::image::Image;
use crate::models::imaging_frames::ImagingFrameList;
use crate::models::imaging_session_list::{ImagingSession, ImagingSessionList};
use crate::models::preferences::Preferences;
use crate::utils::paths::APP_DATA_PATH;
use std::path::PathBuf;
use uuid::Uuid;

pub struct AppState {
    pub preferences: Preferences,
    pub equipment_list: EquipmentList,
    pub imaging_frame_list: ImagingFrameList,
    pub imaging_sessions: HashMap<Uuid, ImagingSession>,
    pub image_list: Vec<Image>,
}

impl AppState {
    pub fn new() -> Self {
        let mut preferences = Preferences::new();
        let mut equipment_list = EquipmentList::new();
        let mut imaging_frame_list = ImagingFrameList::new();
        let mut imaging_sessions: HashMap<Uuid, ImagingSession> = HashMap::new();
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

        match ImagingSessionList::load(PathBuf::from(&preferences.storage.root_directory)) {
            Ok(data) => {
                imaging_sessions = data.imaging_sessions;
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
            imaging_sessions,
            image_list,
        }
    }
}
