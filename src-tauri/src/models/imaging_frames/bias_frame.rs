use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::SortDir;

// one physical bias frame on disk (storage model, one row per file)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BiasFrame {
    pub id: Uuid,
    pub hash: Option<String>,
    pub rel_path: String,

    pub camera_id: Uuid,
    pub captured_at: DateTime<Utc>,

    pub gain: u32,
    pub binning: u32,
    pub offset: Option<u32>,
}

// one aggregated table row: all bias frames sharing camera + settings + night
// this is a view model produced by GROUP BY, never stored
#[derive(Debug, Clone, Serialize)]
pub struct BiasFrameRow {
    pub camera_id: Uuid,
    pub gain: u32,
    pub binning: u32,
    pub offset: Option<u32>,
    // noon-to-noon night, "YYYY-MM-DD"
    pub night: String,

    pub total_frames: u32,
    pub first_captured: DateTime<Utc>,
    pub last_captured: DateTime<Utc>,
}

// whitelisted sortable columns for the grouped bias-frame view
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BiasFrameSortKey {
    Night,
    TotalFrames,
    Gain,
    Binning,
    FirstCaptured,
    LastCaptured,
}

// query params for the grouped bias-frame view
#[derive(Debug, Clone, Deserialize)]
pub struct BiasFrameQuery {
    // optional regex applied across the row's visible columns
    pub search: Option<String>,
    pub sort_by: BiasFrameSortKey,
    pub sort_dir: SortDir,
    pub limit: u32,
    pub offset: u32,
}

// a page of grouped rows plus the total group count for pagination
#[derive(Debug, Clone, Serialize)]
pub struct BiasFramePage {
    pub rows: Vec<BiasFrameRow>,
    pub total: u32,
}
