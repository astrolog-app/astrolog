use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum CalibrationType {
    DEFAULT,
    DARK,
    BIAS,
}

impl Default for CalibrationType {
    fn default() -> Self {
        CalibrationType::DEFAULT
    }
}

impl fmt::Display for CalibrationType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CalibrationType::DARK => write!(f, "DARK"),
            CalibrationType::BIAS => write!(f, "BIAS"),
            CalibrationType::DEFAULT => write!(f, "DEFAULT"),
        }
    }
}
