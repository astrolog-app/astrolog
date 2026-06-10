use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::SortDir;

// one physical dark frame on disk (storage model, one row per file)
// mirrors BiasFrame, plus exposure and the set sensor temperature that
// distinguish a dark set (darks must match the lights' exposure and temp)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DarkFrame {
    pub id: Uuid,
    pub hash: Option<String>,
    pub rel_path: String,

    pub camera_id: Uuid,
    pub captured_at: DateTime<Utc>,

    pub gain: u32,
    pub binning: u32,
    pub offset: Option<u32>,
    pub exposure: f64,
    pub sensor_temp: Option<f64>,
}

// one aggregated table row: all dark frames sharing camera + settings + night
// this is a view model produced by GROUP BY, never stored
#[derive(Debug, Clone, Serialize)]
pub struct DarkFrameRow {
    pub camera_id: Uuid,
    pub gain: u32,
    pub binning: u32,
    pub offset: Option<u32>,
    pub exposure: f64,
    pub sensor_temp: Option<f64>,
    // noon-to-noon night, "YYYY-MM-DD"
    pub night: String,

    pub total_frames: u32,
    pub first_captured: DateTime<Utc>,
    pub last_captured: DateTime<Utc>,
}

// whitelisted sortable columns for the grouped dark-frame view
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DarkFrameSortKey {
    Night,
    TotalFrames,
    Gain,
    Binning,
    Exposure,
    FirstCaptured,
    LastCaptured,
}

// query params for the grouped dark-frame view
#[derive(Debug, Clone, Deserialize)]
pub struct DarkFrameQuery {
    // optional regex applied across the row's visible columns
    pub search: Option<String>,
    pub sort_by: DarkFrameSortKey,
    pub sort_dir: SortDir,
    pub limit: u32,
    pub offset: u32,
}

// a page of grouped rows plus the total group count for pagination
#[derive(Debug, Clone, Serialize)]
pub struct DarkFramePage {
    pub rows: Vec<DarkFrameRow>,
    pub total: u32,
}
