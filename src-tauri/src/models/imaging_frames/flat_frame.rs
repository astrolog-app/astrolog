use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct FlatFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32,
    frames: Vec<PathBuf>,
}