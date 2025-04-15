use crate::file_store;
use crate::models::state::AppState;
use serde::{Deserialize, Serialize};
use serde_json::to_string_pretty;
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
use tauri::State;
use uuid::Uuid;

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
        Ok(file_store::save(&filename, &to_string_pretty(self)?)?)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Config {
    pub folder_paths: FolderPaths,
    pub locations: HashMap<Uuid, Location>,
}

impl Config {
    pub fn default() -> Config {
        let folder_paths = FolderPaths {
            imaging_session_base_folder: PathBuf::new(),
            imaging_session_pattern: PathBuf::new(),
            calibration_base_folder: PathBuf::new(),
            dark_frame_pattern: PathBuf::new(),
            bias_frame_pattern: PathBuf::new(),
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
        Ok(file_store::save(&filename, &to_string_pretty(self)?)?)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FolderPaths {
    pub imaging_session_base_folder: PathBuf,
    pub imaging_session_pattern: PathBuf,

    pub calibration_base_folder: PathBuf,
    pub dark_frame_pattern: PathBuf,
    pub bias_frame_pattern: PathBuf,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Location {
    id: Uuid,
    pub name: String,
    x: f64,
    y: f64,
    height: f64,
    pub bortle: u32,
}

impl Location {
    pub fn save(&self, state: &State<AppState>) -> Result<(), Box<dyn Error>> {
        let mut config = state.config.lock().map_err(|e| e.to_string())?;

        for existing_location in config.locations.values() {
            if existing_location.name == self.name && existing_location.id != self.id {
                return Err("A location with the same name already exists.".into());
            }
        }

        let old_locations = config.locations.clone();

        config.locations.insert(self.id, self.clone());

        if let Err(e) = config
            .save(state.root_directory.clone())
        {
            config.locations = old_locations;
            return Err(e);
        }

        Ok(())
    }

    pub fn delete(&self, state: &State<AppState>) -> Result<(), Box<dyn Error>> {
        let mut config = state.config.lock().map_err(|e| e.to_string())?;
        let db = state.db.lock().map_err(|e| e.to_string())?;

        // Check if any frame is using this location
        if db
            .get_light_frames()
            .map_err(|e| e.to_string())?
            .values()
            .any(|frame| frame.location_id == self.id)
        {
            return Err(
                "Can't delete location: This location is used in an imaging session!".into(),
            );
        }

        let old_locations = config.locations.clone();

        config.locations.remove(&self.id);

        if let Err(e) = config
            .save(state.root_directory.clone())
        {
            config.locations = old_locations;
            return Err(e);
        }

        Ok(())
    }
}
