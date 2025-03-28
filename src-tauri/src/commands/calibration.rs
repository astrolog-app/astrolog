use crate::image::{get_exposure_time, get_gain};
use crate::models::frontend::state::CalibrationTableRow;
use crate::models::imaging_frames::imaging_frame_list::{CalibrationType, ImagingFrameList};
use crate::models::state::AppState;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;
use crate::models::imaging_frames::bias_frame::BiasFrame;
use crate::models::imaging_frames::dark_frame::DarkFrame;

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalyzedCalibrationFrames {
    calibration_type: CalibrationType,
    gain: Option<i32>,
    sub_length: Option<f64>,
    total_subs: usize,
    message: Option<String>,
}

#[tauri::command]
pub fn analyze_calibration_frames(
    frames: Vec<PathBuf>,
) -> Result<AnalyzedCalibrationFrames, String> {
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
            message = Some(format!(
                "{} Couldn't get sub length: {}",
                message.unwrap_or_default(),
                error
            ));
        }
    }

    match get_gain(path) {
        Ok(result) => {
            gain = Option::from(result);
        }
        Err(e) => {
            let error = e.to_string();
            message = Some(format!(
                "{} Couldn't get gain: {}",
                message.unwrap_or_default(),
                error
            ));
        }
    }

    Ok(AnalyzedCalibrationFrames {
        calibration_type,
        gain,
        sub_length,
        total_subs,
        message,
    })
}

#[tauri::command]
pub async fn classify_calibration_frames(
    frames: CalibrationTableRow,
    paths: Vec<PathBuf>,
    state: State<'_, Mutex<AppState>>,
) -> Result<(), String> {
    /*
    let mut app_state = state.lock().unwrap();
    let root_directory = app_state.local_config.root_directory.clone();
    let mut path = PathBuf::from(&root_directory);
    path.push("Calibration");
    path.push(&frames.calibration_type.to_string());
    path.push(&frames.camera);
    path.push(frames.gain.to_string());

    // Check if folder exists and if it's not empty
    if path.exists() {
        let entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
        if entries.count() > 0 {
            return Err(
                "Such calibration frames already exist and the folder is not empty.".to_string(),
            );
        }
    }

    // Create the directory and copy the files
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    for frame in paths {
        let mut new_path = path.clone();
        new_path.push(frame.file_name().ok_or("Couldn't get file_name")?);
        fs::copy(&frame, &new_path).map_err(|e| e.to_string())?;
    }

    if frames.calibration_type == CalibrationType::DARK {
        let mut dark_frames = app_state.imaging_frame_list.dark_frames.clone();
        let new_dark_frame = DarkFrame {
            id: frames.id,
            camera_id: Uuid::new_v4(),
            total_subs: frames.total_subs,
            gain: frames.gain,
            frames: vec![],
            calibration_type: frames.calibration_type,
            camera_temp: frames.camera_temp.unwrap(),
            sub_length: frames.sub_length.unwrap(),
        };
        dark_frames.insert(new_dark_frame.id, new_dark_frame);

        app_state.imaging_frame_list.dark_frames = dark_frames.clone();
    } else {
        let mut bias_frames = app_state.imaging_frame_list.bias_frames.clone();
        let new_bias_frame = BiasFrame {
            id: frames.id,
            camera_id: Uuid::new_v4(),
            total_subs: frames.total_subs,
            gain: frames.gain,
            frames: vec![],
            calibration_type: frames.calibration_type,
        };
        bias_frames.insert(new_bias_frame.id, new_bias_frame);

        app_state.imaging_frame_list.bias_frames = bias_frames.clone();
    }
    ImagingFrameList::save(root_directory, &app_state.imaging_frame_list)
        .map_err(|e| e.to_string())?;
    */
    Ok(())
}
