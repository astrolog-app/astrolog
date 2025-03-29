use crate::models::equipment::EquipmentList;
use crate::models::gallery_image_list::{GalleryImage, GalleryImageList};
use crate::models::imaging_frames::imaging_frame_list::ImagingFrameList;
use crate::models::imaging_session_list::ImagingSessionList;
use crate::models::preferences::{Config, LocalConfig};
use std::collections::HashMap;
use tauri::{AppHandle, Manager};
use uuid::Uuid;
use crate::models::imaging_session::ImagingSession;

pub struct AppState {
    pub local_config: LocalConfig,
    pub config: Config,
    pub equipment_list: EquipmentList,
    pub imaging_frame_list: ImagingFrameList,
    pub imaging_sessions: HashMap<Uuid, ImagingSession>,
    pub gallery_image_list: HashMap<Uuid, GalleryImage>,
    pub close_lock: bool,
}

impl AppState {
    pub fn new(app_handle: &AppHandle) -> Self {
        let mut local_config = LocalConfig::default();
        let mut config = Config::default();
        let mut equipment_list = EquipmentList::new();
        let mut imaging_frame_list = ImagingFrameList::new();
        let mut imaging_sessions: HashMap<Uuid, ImagingSession> = HashMap::new();
        let mut image_list: HashMap<Uuid, GalleryImage> = HashMap::new();

        match LocalConfig::load(app_handle.path().app_data_dir().unwrap()) {
            Ok(data) => {
                local_config = data;
            }
            Err(err) => {
                eprintln!("Error loading local_config {}: {}", "", err);
            }
        }

        match Config::load(local_config.root_directory.clone()) {
            Ok(data) => {
                config = data;
            }
            Err(err) => {
                eprintln!("Error loading config {}: {}", "", err);
            }
        }

        match EquipmentList::load(local_config.root_directory.clone()) {
            Ok(data) => {
                equipment_list = data;
            }
            Err(err) => {
                eprintln!("Error loading equipment_list {}: {}", "", err);
            }
        }

        match ImagingFrameList::load(local_config.root_directory.clone()) {
            Ok(data) => {
                imaging_frame_list = data;
            }
            Err(err) => {
                eprintln!("Error loading imaging_frame_list {}: {}", "", err);
            }
        }

        match ImagingSessionList::load(local_config.root_directory.clone()) {
            Ok(data) => {
                imaging_sessions = data.imaging_session_list;
            }
            Err(err) => {
                eprintln!("Error loading imaging_session_list {}: {}", "", err);
            }
        }

        match GalleryImageList::load(local_config.root_directory.clone()) {
            Ok(data) => {
                image_list = data.gallery_image_list;
            }
            Err(err) => {
                eprintln!("Error loading gallery_image_list {}: {}", "", err);
            }
        }

        AppState {
            local_config,
            config,
            equipment_list,
            imaging_frame_list,
            imaging_sessions,
            gallery_image_list: image_list,
            close_lock: false,
        }
    }
}
