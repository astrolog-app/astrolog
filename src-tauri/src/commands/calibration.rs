use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::image::{get_exposure_time, get_gain};
use crate::models::imaging_frames::CalibrationType;

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalyzedCalibrationFrames {
    calibration_type: CalibrationType,
    gain: Option<i32>,
    sub_length: Option<f64>,
    total_subs: usize,
    message: Option<String>
}

#[tauri::command]
pub fn analyze_calibration_frames(frames: Vec<PathBuf>) -> Result<AnalyzedCalibrationFrames, String> {
    let mut sub_length: Option<f64> = None;
    let mut message = None;
    let mut gain: Option<i32> = None;
    let mut calibration_type = CalibrationType::DARK;
    let total_subs = frames.len();

    let path = frames.get(0).ok_or("No frames found")?;

    match get_exposure_time(path) {
        Ok(result) => {
            sub_length = Option::from(result);

            if result < 0.001 {
                calibration_type = CalibrationType::BIAS;
            }
        }
        Err(e) => {
            let error = e.to_string();
            message = Some(format!("{} Couldn't get sub length: {}", message.unwrap_or_default(), error));
        }
    }

    match get_gain(path) {
        Ok(result) => {
            gain = Option::from(result);
        }
        Err(e) => {
            let error = e.to_string();
            message = Some(format!("{} Couldn't get gain: {}", message.unwrap_or_default(), error));
        }
    }

    Ok(
        AnalyzedCalibrationFrames {
            calibration_type,
            gain,
            sub_length,
            total_subs,
            message
        }
    )
}

#[tauri::command]
pub fn classify_dark_frames() {}
#[tauri::command]
pub fn classify_bias_frames() {}
