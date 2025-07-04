use std::env::temp_dir;
use std::path::PathBuf;
use crate::models::preferences::{Config, LocalConfig};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager};
use crate::models::database::Database;

pub struct AppState {
    pub root_directory: PathBuf,
    pub local_config: Arc<Mutex<LocalConfig>>,
    pub config: Arc<Mutex<Config>>,
    pub db: Arc<Mutex<Database>>,
    pub close_lock: Arc<Mutex<bool>>,
}

impl AppState {
    pub fn new(app_handle: &AppHandle) -> Self {
        let mut local_config = LocalConfig::default();
        let mut config = Config::default();

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

        let root_directory: PathBuf = if local_config.root_directory.as_os_str().is_empty() {
            temp_dir().join("astrolog_temp")
        } else {
            local_config.root_directory.clone()
        };

        let db = Database::new(&root_directory).unwrap();

        AppState {
            root_directory: local_config.root_directory.clone(),
            local_config: Arc::new(Mutex::new(local_config)),
            config: Arc::new(Mutex::new(config)),
            db: Arc::new(Mutex::new(db)),
            close_lock: Arc::new(Mutex::new(false)),
        }
    }
}
