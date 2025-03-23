use std::collections::HashMap;
use crate::file_store;
use serde::{Deserialize, Serialize};
use serde_json::to_string_pretty;
use std::error::Error;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;
use crate::models::state::AppState;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LocalConfig {
    pub root_directory: PathBuf,
    source_directory: PathBuf,
}

impl LocalConfig {
    pub fn default() -> LocalConfig {
        LocalConfig {
            root_directory: PathBuf::from(""),
            source_directory: PathBuf::from(""),
        }
    }

    pub fn load(dir: PathBuf) -> Result<LocalConfig, Box<dyn Error>> {
        let mut filename = dir;
        filename.push("local_config.json");
        Ok(file_store::load(&filename)?)
    }

    pub fn save(&self, dir: PathBuf) -> Result<(), Box<dyn Error>> {
        let mut filename = dir;
        filename.push("local_config.json");
        Ok(file_store::save(
            &filename,
            &to_string_pretty(self)?,
        )?)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Config {
    pub folder_paths: FolderPaths,
    pub locations: HashMap<Uuid, Location>,
}

impl Config {
    pub fn default() -> Config {
        let default = FolderPath {
            base_folder: PathBuf::new(),
            pattern: PathBuf::new(),
        };

        let folder_paths = FolderPaths {
            imaging_session_folder_path: default.clone(),
            calibration_frames_folder_path: default,
        };

        Config {
            folder_paths,
            locations: HashMap::new(),
        }
    }

    pub fn load(dir: PathBuf) -> Result<Config, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("config.json");
        Ok(file_store::load(&filename)?)
    }

    pub fn save(&self, dir: PathBuf) -> Result<(), Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("config.json");
        Ok(file_store::save(
            &filename,
            &to_string_pretty(self)?,
        )?)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FolderPaths {
    pub imaging_session_folder_path: FolderPath,
    calibration_frames_folder_path: FolderPath,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FolderPath {
    pub base_folder: PathBuf,
    pub pattern: PathBuf,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Location {
    id: Uuid,
    name: String,
    x: f64,
    y: f64,
    height: f64,
    bortle: u32,
}

impl Location {
    pub fn save(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;

        for existing_location in app_state.config.locations.values() {
            if existing_location.name == self.name && existing_location.id != self.id {
                return Err("A location with the same name already exists.".into());
            }
        }

        let old_locations = app_state.config.locations.clone();

        app_state.config.locations.insert(self.id, self.clone());

        if let Err(e) = app_state.config.save(app_state.local_config.root_directory.clone()) {
            app_state.config.locations = old_locations;
            return Err(e);
        }

        Ok(())
    }

    pub fn delete(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;

        // Check if any frame is using this location
        if app_state
            .imaging_frame_list
            .light_frames
            .values()
            .any(|frame| frame.location_id == self.id)
        {
            return Err("Can't delete location: This location is used in an imaging session!".into());
        }

        let old_locations = app_state.config.locations.clone();

        app_state.config.locations.remove(&self.id);

        if let Err(e) = app_state.config.save(app_state.local_config.root_directory.clone()) {
            app_state.config.locations = old_locations;
            return Err(e);
        }

        Ok(())
    }
}
