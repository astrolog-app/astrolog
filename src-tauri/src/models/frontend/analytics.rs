use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Analytics {
    total_imaging_sessions: i32
}

impl Analytics {
    pub fn new() -> Analytics {
        Analytics {
            total_imaging_sessions: 0
        }
    }
}
