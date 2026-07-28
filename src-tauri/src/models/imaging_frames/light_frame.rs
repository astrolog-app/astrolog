use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::SortDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightFrame {
    pub id: Uuid,
    pub session_id: Uuid,
    pub hash: Option<String>, // TODO: after being able to classify, it should no longer be an Option<>

    pub rel_path: String,
    pub file_size_bytes: i64,

    // day the frames were shot, user-declared (night / calibration-age anchor)
    pub creation_day: NaiveDate,
    pub captured_at: Option<DateTime<Utc>>,
    pub imported_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,

    pub binning: u32,
    pub gain: u32,
    pub offset: Option<u32>,
    pub sensor_set_temp: Option<f64>,
    pub sensor_temp: Option<f64>,

    pub camera_id: Uuid,
    pub telescope_id: Uuid,
    pub mount_id: Uuid,
    pub filter_id: Option<Uuid>,
    pub flattener_id: Option<Uuid>,

    pub exposure_ms: i64,

    pub target: String,
}

// one aggregated table row: light frames sharing target + optics + settings + night
// this is a view model produced by GROUP BY, never stored
#[derive(Debug, Clone, Serialize)]
pub struct LightFrameRow {
    pub camera_id: Uuid,
    pub telescope_id: Uuid,
    pub mount_id: Uuid,
    pub filter_id: Option<Uuid>,
    pub flattener_id: Option<Uuid>,
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
