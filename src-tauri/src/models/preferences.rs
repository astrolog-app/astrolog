use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Preferences {
    storage: Storage,
    user: User,
    license: License
}

impl Preferences {
    pub fn new() -> Preferences {
        Preferences {
            storage: Storage {
                root_directory: "".to_string()
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
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct Storage {
    root_directory: String
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
