use std::error::Error;
use std::fs::{create_dir_all, File};
use std::io::{Read, Write};
use std::path::Path;
use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string_pretty};
use crate::paths::APP_DATA_PATH;
use crate::state::{get_app_state, get_readonly_app_state};

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
                activated: true,
                user_email: "".to_string(),
                license_key: "".to_string()
            }
        }
    }

    pub fn load() -> Result<Preferences, Box<dyn Error>> {
        let mut filename = APP_DATA_PATH.clone();
        filename.push("preferences.json");

        // Open the file in read-only mode
        let mut file = File::open(filename)?;

        // Read the file contents into a string
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;

        // Deserialize the JSON string into EquipmentList
        let preferences: Preferences = from_str(&contents)?;

        Ok(preferences)
    }

    pub fn save() -> Result<(), Box<dyn Error>> {
        let mut filename = APP_DATA_PATH.clone();
        filename.push("preferences.json");

        if let Some(parent) = Path::new(&filename).parent() {
            create_dir_all(parent)?;
        }

        let app_state = get_readonly_app_state();
        // Open the file in write-only mode, creating it if necessary
        let mut file = File::create(filename)?;

        // Serialize the EquipmentList to a JSON string
        let contents = to_string_pretty(&app_state.preferences)?;

        // Write the JSON string to the file
        file.write_all(contents.as_bytes())?;

        Ok(())
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

#[tauri::command]
pub fn save_preferences(preferences: Preferences) {
    get_app_state().preferences = preferences;
    Preferences::save().expect("TODO: panic message");
}
