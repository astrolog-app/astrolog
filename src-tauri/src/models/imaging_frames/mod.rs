pub mod bias_frame;

use serde::Deserialize;

// sort direction shared across imaging-frame queries
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SortDir {
    Asc,
    Desc,
}
