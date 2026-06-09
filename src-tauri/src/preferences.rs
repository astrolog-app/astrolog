use crate::file_store;
use serde::{Deserialize, Serialize};
use serde_json::to_string_pretty;
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
use tauri::State;
use uuid::Uuid;
use crate::state::AppState;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum Unit {
    METRIC,
    IMPERIAL,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LocalConfig {
    pub schema_version: u32,
    pub root_directory: PathBuf,
    source_directory: PathBuf,
    pub unit: Unit,
}

impl LocalConfig {
    pub const CURRENT_SCHEMA_VERSION: u32 = 0;

    pub fn default() -> LocalConfig {
        LocalConfig {
            schema_version: Self::CURRENT_SCHEMA_VERSION,
            root_directory: PathBuf::new(),
            source_directory: PathBuf::new(),
            unit: Unit::METRIC,
        }
    }

    pub fn load(dir: PathBuf) -> Result<LocalConfig, Box<dyn Error>> {
        let mut filename = dir;
        filename.push("local_config.json");
        Ok(file_store::load(filename.as_path())?)
    }

    pub fn save(&self, dir: PathBuf) -> Result<(), Box<dyn Error>> {
        let mut filename = dir;
        filename.push("local_config.json");

        Ok(file_store::save(filename.as_path(), &to_string_pretty(self)?)?)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Config {
    pub schema_version: u32,
    pub folder_paths: FolderPaths
}

impl Config {
    pub const CURRENT_SCHEMA_VERSION: u32 = 0;

    pub fn default() -> Config {
        let folder_paths = FolderPaths {
            imaging_session_pattern: PathBuf::new(),
            dark_frame_pattern: PathBuf::new(),
            bias_frame_pattern: PathBuf::new(),
        };

        Config {
            schema_version: 1,
            folder_paths,
        }
    }

    pub fn load(dir: PathBuf) -> Result<Config, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("config.json");
        Ok(file_store::load(filename.as_path())?)
    }

    pub fn save(&self, dir: PathBuf) -> Result<(), Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("config.json");
        Ok(file_store::save(filename.as_path(), &to_string_pretty(self)?)?)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FolderPaths {
    pub imaging_session_pattern: PathBuf,

    pub dark_frame_pattern: PathBuf,
    pub bias_frame_pattern: PathBuf,
}
