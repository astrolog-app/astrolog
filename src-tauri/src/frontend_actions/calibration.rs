use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;
use exif::{In, Reader, Tag};
use serde::{Deserialize, Serialize};
use crate::models::imaging_frames::CalibrationType;

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalyzedCalibrationFrames {
    calibration_type: CalibrationType,
    gain: i32,
    sub_length: f64,
    total_subs: usize,
}

#[tauri::command]
pub fn analyze_calibration_frames(frames: Vec<PathBuf>) -> Result<AnalyzedCalibrationFrames, String> {
    let mut sub_length = 2.0;
    let total_subs = frames.len();
    let mut gain = 800;
    let calibration_type = CalibrationType::DARK;

    let path = frames.get(0).ok_or("No frames found")?;
    let file = File::open(path).map_err(|e| e.to_string())?;

    let exif_reader = Reader::new();
    let exif = exif_reader.read_from_container(&mut BufReader::new(file)).map_err(|e| e.to_string())?;
    let field = exif.get_field(Tag::ExposureTime, In::PRIMARY).ok_or("No frames found")?;
    // sub_length = field.display_value().to_string();

    Ok(
        AnalyzedCalibrationFrames {
            calibration_type,
            gain,
            sub_length,
            total_subs,
        }
    )
}

#[tauri::command]
pub fn classify_dark_frames() {}
#[tauri::command]
pub fn classify_bias_frames() {}
