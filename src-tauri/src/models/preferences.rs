use crate::file_store;
use serde::{Deserialize, Serialize};
use serde_json::to_string_pretty;
use std::error::Error;
use std::path::PathBuf;

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
}

impl Config {
    pub fn default() -> Config {
        let default = FolderPath {
            base_folder: "".to_string(),
            pattern: "".to_string(),
        };

        let folder_paths = FolderPaths {
            imaging_session_folder_path: default.clone(),
            calibration_frames_folder_path: default,
        };

        Config {
            folder_paths
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
    pub base_folder: String,
    pub pattern: String,
}
