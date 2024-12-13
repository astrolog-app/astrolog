use crate::file_store;
use serde::{Deserialize, Serialize};
use serde_json::to_string_pretty;
use std::error::Error;
use std::path::PathBuf;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Preferences {
    pub storage: Storage,
    user: User,
}

impl Preferences {
    pub fn new() -> Preferences {
        Preferences {
            storage: Storage {
                root_directory: PathBuf::from(""),
                backup_directory: PathBuf::from(""),
                source_directory: PathBuf::from(""),
            },
            user: User {
                weather_api_key: "".to_string(),
            },
        }
    }

    pub fn load(dir: PathBuf) -> Result<Preferences, Box<dyn Error>> {
        let mut filename = dir;
        filename.push("preferences.json");
        Ok(file_store::load(&filename)?)
    }

    pub fn save(dir: PathBuf, preferences: &Preferences) -> Result<(), Box<dyn Error>> {
        let mut filename = dir;
        filename.push("preferences.json");
        Ok(file_store::save(
            &filename,
            &to_string_pretty(preferences)?,
        )?)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Storage {
    pub root_directory: PathBuf,
    backup_directory: PathBuf,
    source_directory: PathBuf,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct User {
    weather_api_key: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct License {
    activated: bool,
    user_email: String,
    license_key: String,
}
