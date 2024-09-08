use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::image::{get_exposure_time, get_gain};
use crate::models::imaging_frames::CalibrationType;
use crate::state::get_readonly_app_state;

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

#[derive(Debug, Serialize, Deserialize)]
pub struct FrontendDarkFrame {
    frames: Vec<PathBuf>,
    calibration_type: String,
    camera: String,
    gain: i32,
    sub_length: f64,
    camera_temp: f64
}

#[tauri::command]
pub fn classify_dark_frames() -> Result<(), String> {
    let dark_frame = FrontendDarkFrame {
        frames: vec![PathBuf::from("F:\\DCIM\\111D5500\\ND5_0270.NEF"), PathBuf::from("F:\\DCIM\\111D5500\\ND5_0271.NEF")],
        calibration_type: String::from("DARK"),
        camera: String::from("Nikon D5500"),
        gain: 800,
        sub_length: 300.0,
        camera_temp: 12.0
    };

    // TODO: Check for duplicates

    let root_directory = &get_readonly_app_state().preferences.storage.root_directory;

    let mut path = PathBuf::from(root_directory);
    path.push("Calibration");
    path.push(&dark_frame.calibration_type);
    path.push(&dark_frame.camera);
    path.push(dark_frame.gain.to_string());

    for frame in dark_frame.frames {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;

        let mut new_path = path.clone();
        new_path.push(&frame.file_name().ok_or("")?);
        fs::copy(&frame, new_path)
            .map_err(|e| e.to_string())?;
    }

    // TODO: Save to json file

    Ok(())
}

#[tauri::command]
pub fn classify_bias_frames() {}
