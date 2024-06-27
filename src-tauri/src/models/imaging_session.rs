use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct ImagingSession {
    id: Uuid,
    folder_dir: String,
    light_frame_id: Uuid,
    flat_frame_id: Uuid,
    dark_frame_id: Uuid,
    bias_frame_id: Uuid,
}
