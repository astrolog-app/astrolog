use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::SortDir;

// one physical light frame on disk (storage model, one row per file)
// the richest frame type: a target plus the optical train and the sensor temp,
// otherwise mirroring the bias storage shape
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightFrame {
    pub id: Uuid,
    pub hash: Option<String>,
    pub rel_path: String,

    pub camera_id: Uuid,
    pub telescope_id: Option<Uuid>,
    pub filter_id: Option<Uuid>,
    pub captured_at: DateTime<Utc>,

    pub target: String,
    pub gain: u32,
    pub binning: u32,
    pub offset: Option<u32>,
    pub exposure: f64,
    pub sensor_temp: Option<f64>,
}

// one aggregated table row: light frames sharing target + optics + settings + night
// this is a view model produced by GROUP BY, never stored
#[derive(Debug, Clone, Serialize)]
pub struct LightFrameRow {
    pub camera_id: Uuid,
    pub telescope_id: Option<Uuid>,
    pub filter_id: Option<Uuid>,
    pub target: String,
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

// whitelisted sortable columns for the grouped light-frame view
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LightFrameSortKey {
    Night,
    Target,
    TotalFrames,
    Gain,
    Binning,
    Exposure,
    FirstCaptured,
    LastCaptured,
}

// query params for the grouped light-frame view
#[derive(Debug, Clone, Deserialize)]
pub struct LightFrameQuery {
    // optional regex applied across the row's visible columns
    pub search: Option<String>,
    pub sort_by: LightFrameSortKey,
    pub sort_dir: SortDir,
    pub limit: u32,
    pub offset: u32,
}

// a page of grouped rows plus the total group count for pagination
#[derive(Debug, Clone, Serialize)]
pub struct LightFramePage {
    pub rows: Vec<LightFrameRow>,
    pub total: u32,
}
