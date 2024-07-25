use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Configuration {
    license: License
}

impl Configuration {
    pub fn new() -> Configuration {
        Configuration {
            license: License {
                activated: true,
                user_email: "".to_string(),
                license_key: "".to_string()
            }
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct License {
    activated: bool,
    user_email: String,
    license_key: String
}
