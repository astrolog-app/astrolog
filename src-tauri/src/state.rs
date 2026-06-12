use crate::db::Database;
use crate::preferences::{Config, LocalConfig};
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

pub struct AppState {
    // false until first-run setup has persisted a local config with a root directory
    pub is_configured: bool,
    pub local_config: Mutex<LocalConfig>,
    pub config: Mutex<Config>,
    pub db: Mutex<Database>,
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

        let is_configured = !local_config.root_directory.as_os_str().is_empty();

        let db = if is_configured {
            match Config::load(local_config.root_directory.clone()) {
                Ok(data) => {
                    config = data;
                }
                Err(err) => {
                    eprintln!("Error loading config {}: {}", "", err);
                }
            }

            Database::new(&local_config.root_directory).unwrap()
        } else {
            // no library yet (first run) — use a throwaway in-memory db so every
            // command stays callable while the welcome flow is on screen
            Database::new_in_memory().unwrap()
        };

        AppState {
            is_configured,
            local_config: Mutex::new(local_config),
            config: Mutex::new(config),
            db: Mutex::new(db),
        }
    }
}
