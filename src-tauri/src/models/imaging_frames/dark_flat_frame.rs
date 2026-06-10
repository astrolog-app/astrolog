use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::SortDir;

// one physical dark-flat frame on disk (storage model, one row per file)
// a dark flat is physically a dark matched to the flats' exposure, so it
// mirrors BiasFrame plus exposure (temperature is not tracked separately here)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DarkFlatFrame {
    pub id: Uuid,
    pub hash: Option<String>,
    pub rel_path: String,

    pub camera_id: Uuid,
    pub captured_at: DateTime<Utc>,

    pub gain: u32,
    pub binning: u32,
    pub offset: Option<u32>,
    pub exposure: f64,
}

// one aggregated table row: dark-flat frames sharing camera + settings + night
// this is a view model produced by GROUP BY, never stored
#[derive(Debug, Clone, Serialize)]
pub struct DarkFlatFrameRow {
    pub camera_id: Uuid,
    pub gain: u32,
    pub binning: u32,
    pub offset: Option<u32>,
    pub exposure: f64,
    // noon-to-noon night, "YYYY-MM-DD"
    pub night: String,

    pub total_frames: u32,
    pub first_captured: DateTime<Utc>,
    pub last_captured: DateTime<Utc>,
}

// whitelisted sortable columns for the grouped dark-flat-frame view
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DarkFlatFrameSortKey {
    Night,
    TotalFrames,
    Gain,
    Binning,
    Exposure,
    FirstCaptured,
    LastCaptured,
}

// query params for the grouped dark-flat-frame view
#[derive(Debug, Clone, Deserialize)]
pub struct DarkFlatFrameQuery {
    // optional regex applied across the row's visible columns
    pub search: Option<String>,
    pub sort_by: DarkFlatFrameSortKey,
    pub sort_dir: SortDir,
    pub limit: u32,
    pub offset: u32,
}

// a page of grouped rows plus the total group count for pagination
#[derive(Debug, Clone, Serialize)]
pub struct DarkFlatFramePage {
    pub rows: Vec<DarkFlatFrameRow>,
    pub total: u32,
}
