use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::SortDir;

// one physical flat frame on disk (storage model, one row per file)
// flats depend on the optical train, so they mirror BiasFrame plus exposure
// and the telescope + filter they were taken through (both optional)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlatFrame {
    pub id: Uuid,
    pub hash: Option<String>,
    pub rel_path: String,

    pub camera_id: Uuid,
    pub telescope_id: Option<Uuid>,
    pub filter_id: Option<Uuid>,
    pub captured_at: DateTime<Utc>,

    pub gain: u32,
    pub binning: u32,
    pub offset: Option<u32>,
    pub exposure: f64,
}

// one aggregated table row: flat frames sharing optics + settings + night
// this is a view model produced by GROUP BY, never stored
#[derive(Debug, Clone, Serialize)]
pub struct FlatFrameRow {
    pub camera_id: Uuid,
    pub telescope_id: Option<Uuid>,
    pub filter_id: Option<Uuid>,
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

// whitelisted sortable columns for the grouped flat-frame view
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FlatFrameSortKey {
    Night,
    TotalFrames,
    Gain,
    Binning,
    Exposure,
    FirstCaptured,
    LastCaptured,
}

// query params for the grouped flat-frame view
#[derive(Debug, Clone, Deserialize)]
pub struct FlatFrameQuery {
    // optional regex applied across the row's visible columns
    pub search: Option<String>,
    pub sort_by: FlatFrameSortKey,
    pub sort_dir: SortDir,
    pub limit: u32,
    pub offset: u32,
}

// a page of grouped rows plus the total group count for pagination
#[derive(Debug, Clone, Serialize)]
pub struct FlatFramePage {
    pub rows: Vec<FlatFrameRow>,
    pub total: u32,
}
