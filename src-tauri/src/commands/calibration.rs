use crate::image::{get_exposure_time, get_gain};
use crate::models::frontend::process::Process;
use crate::models::imaging_frames::bias_frame::BiasFrame;
use crate::models::imaging_frames::calibration_type::CalibrationType;
use crate::models::imaging_frames::dark_frame::DarkFrame;
use crate::models::imaging_frames::imaging_frame::{
    CalibrationFrame, ClassifiableFrame, ImagingSessionFrame,
};
use crate::models::state::AppState;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{State, Window};

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
pub async fn classify_dark_frame(
    window: Window,
    state: State<'_, Mutex<AppState>>,
    mut dark_frame: DarkFrame,
) -> Result<(), String> {
    // check for duplicates
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let mut path = app_state.local_config.root_directory.clone();
    drop(app_state);
    path.push(
        <DarkFrame as CalibrationFrame>::build_path(&dark_frame, &state)
            .map_err(|e| e.to_string())?,
    );
    if path.exists() {
        let entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
        if entries.count() > 0 {
            return Err(return Err("Such a Dark Frame already exists.".to_string()));
        }
    }

    dark_frame.add(&state).map_err(|e| e.to_string())?;

    let mut process = Process::spawn(
        &window,
        "",
        false,
        Some(0),
        Some(dark_frame.frames_to_classify.len() as u32),
    );

    if let Err(e) =
        <DarkFrame as CalibrationFrame>::classify(&mut dark_frame, &state, &window, &mut process)
    {
        dark_frame.remove(&state).ok();
    }

    process.finish(&window);

    Ok(())
}

#[tauri::command]
pub async fn classify_bias_frame(
    window: Window,
    state: State<'_, Mutex<AppState>>,
    mut bias_frame: BiasFrame,
) -> Result<(), String> {
    // check for duplicates
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let mut path = app_state.local_config.root_directory.clone();
    drop(app_state);
    path.push(bias_frame.build_path(&state).map_err(|e| e.to_string())?);
    if path.exists() {
        let entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
        if entries.count() > 0 {
            return Err(return Err("Such a Bias Frame already exists.".to_string()));
        }
    }

    bias_frame.add(&state).map_err(|e| e.to_string())?;

    let mut process = Process::spawn(
        &window,
        "",
        false,
        Some(0),
        Some(bias_frame.frames_to_classify.len() as u32),
    );

    if let Err(e) = bias_frame.classify(&state, &window, &mut process) {
        bias_frame.remove(&state).ok();
    }

    process.finish(&window);

    Ok(())
}
