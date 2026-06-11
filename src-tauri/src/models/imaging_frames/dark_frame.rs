use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::SortDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DarkFrame {
    pub id: Uuid,
    // dslr/uncooled darks are bound to a session; cooled library darks are not.
    // invariant (db CHECK): session_id IS NOT NULL OR sensor_temp IS NOT NULL,
    // so a dark is always matchable — by session or by temperature
    pub session_id: Option<Uuid>,
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

    pub exposure_ms: i64,
}

// one aggregated table row: all dark frames sharing camera + settings + night
// this is a view model produced by GROUP BY, never stored
#[derive(Debug, Clone, Serialize)]
pub struct DarkFrameRow {
    pub camera_id: Uuid,
    pub gain: u32,
    pub binning: u32,
    pub offset: Option<u32>,
    pub exposure_ms: i32,
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
