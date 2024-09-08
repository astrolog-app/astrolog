use std::error::Error;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use serde_json::to_string_pretty;
use crate::file_store;
use crate::state::get_readonly_app_state;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Preferences {
    pub storage: Storage,
    user: User,
    license: License
}

impl Preferences {
    pub fn new() -> Preferences {
        Preferences {
            storage: Storage {
                root_directory: "".to_string(),
                backup_directory: "".to_string(),
                source_directory: "".to_string()
            },
            user: User {
                weather_api_key: "".to_string()
            },
            license: License {
                activated: false,
                user_email: "".to_string(),
                license_key: "".to_string()
            }
        }
    }

    pub fn load(dir: PathBuf) -> Result<Preferences, Box<dyn Error>> {
        let mut filename = dir;
        filename.push("preferences.json");
        Ok(file_store::load(filename)?)
    }

    pub fn save(dir: PathBuf) -> Result<(), Box<dyn Error>> {
        let mut filename = dir;
        filename.push("preferences.json");
        Ok(file_store::save(filename, to_string_pretty(&get_readonly_app_state().preferences)?)?)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Storage {
    pub root_directory: String,
    backup_directory: String,
    source_directory: String
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct User {
    weather_api_key: String
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct License {
    activated: bool,
    user_email: String,
    license_key: String
}
