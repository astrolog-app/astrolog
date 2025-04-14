use crate::models::gallery_image_list::{GalleryImage, GalleryImageList};
use crate::models::imaging_frames::imaging_frame_list::ImagingFrameList;
use crate::models::preferences::{Config, LocalConfig};
use std::collections::HashMap;
use tauri::{AppHandle, Manager};
use uuid::Uuid;

pub struct AppState {
    pub local_config: LocalConfig,
    pub config: Config,
    pub gallery_image_list: HashMap<Uuid, GalleryImage>,
    pub close_lock: bool,
}

impl AppState {
    pub fn new(app_handle: &AppHandle) -> Self {
        let mut local_config = LocalConfig::default();
        let mut config = Config::default();
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
            gallery_image_list: image_list,
            close_lock: false,
        }
    }
}
