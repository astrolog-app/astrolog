use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct ImagingSession {
    pub id: Uuid,
    pub folder_dir: String,
    pub light_frame_id: Uuid,
    pub flat_frame_id: Uuid,
    pub dark_frame_id: Uuid,
    pub bias_frame_id: Uuid,
}
