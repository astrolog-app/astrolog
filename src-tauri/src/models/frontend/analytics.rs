use std::collections::HashSet;
use crate::models::state::AppState;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::sync::Mutex;
use chrono::{DateTime, Duration, Utc};
use tauri::State;
use crate::models::imaging_frames::imaging_frame::ClassifiableFrame;

#[derive(Serialize, Deserialize, Debug)]
pub struct Analytics {
    info_cards: InfoCards,
    sessions_chart: Vec<SessionsChartData>,
}

impl Analytics {
    pub fn new(state: &State<Mutex<AppState>>) -> Result<Option<Analytics>, Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;
        if app_state.imaging_sessions.is_empty() {
            return Ok(None);
        }
        drop(app_state);

        let info_cards = Analytics::get_info_cards(&state)?;
        let sessions_chart = Analytics::get_sessions_chart(&state)?;

        Ok(Some(Analytics {
            info_cards,
            sessions_chart,
        }))
    }

    fn get_info_cards(state: &State<Mutex<AppState>>) -> Result<InfoCards, Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;
        let now = Utc::now();
        let cutoff = now - Duration::days(30);

        let mut exposure_time: u32 = 0;
        let mut recent_exposure_time: u32 = 0;

        let mut seeing_total = 0.0;
        let mut seeing_count = 0;

        let mut recent_seeing_total = 0.0;
        let mut recent_seeing_count = 0;

        let mut recent_imaging_sessions = 0;

        let mut unique_targets = HashSet::new();
        let mut recent_unique_targets = HashSet::new();

        for light_frame in app_state.imaging_frame_list.light_frames.values() {
            let frame_exposure = (light_frame.sub_length * light_frame.total_subs() as f64) as u32;
            exposure_time += frame_exposure;

            if let Some(seeing) = light_frame.average_seeing {
                seeing_total += seeing;
                seeing_count += 1;
            }

            unique_targets.insert(light_frame.target.clone());

            if light_frame.date > cutoff {
                recent_exposure_time += frame_exposure;
                recent_imaging_sessions += 1;
                recent_unique_targets.insert(light_frame.target.clone());

                if let Some(seeing) = light_frame.average_seeing {
                    recent_seeing_total += seeing;
                    recent_seeing_count += 1;
                }
            }
        }

        // convert exposure time to minutes
        let exposure_time_min = exposure_time / 60;

        let exposure_increase = if exposure_time == 0 {
            0
        } else {
            (recent_exposure_time * 100) / exposure_time
        };

        let average_seeing = if seeing_count == 0 {
            0.0
        } else {
            seeing_total / seeing_count as f64
        };

        let (seeing_difference, seeing_decrease) = if recent_seeing_count == 0 {
            (0.0, false)
        } else {
            let recent_average = recent_seeing_total / recent_seeing_count as f64;
            let diff = recent_average - average_seeing;
            (diff.abs(), diff < 0.0)
        };

        let total_exposure_time = InfoCardData {
            title: "Total Exposure Time".to_string(),
            content: format!("{} min", exposure_time_min),
            decrease: false,
            value: format!("{}%", exposure_increase),
            value_description: "from last 30 days".to_string(),
        };

        let average_seeing_card = InfoCardData {
            title: "Average Seeing".to_string(),
            content: format!("{:.2}\"", average_seeing),
            decrease: seeing_decrease,
            value: format!("{:.2}\"", seeing_difference),
            value_description: "from last 30 days".to_string(),
        };

        let total_imaging_session = InfoCardData {
            title: "Imaging Sessions".to_string(),
            content: app_state.imaging_frame_list.light_frames.len().to_string(),
            decrease: false,
            value: recent_imaging_sessions.to_string(),
            value_description: "from last 30 days".to_string(),
        };

        let unique_targets_card = InfoCardData {
            title: "Unique Targets".to_string(),
            content: unique_targets.len().to_string(),
            decrease: false,
            value: recent_unique_targets.len().to_string(),
            value_description: "from last 30 days".to_string(),
        };

        Ok(InfoCards {
            total_exposure_time,
            average_seeing: average_seeing_card,
            total_imaging_session,
            unique_targets: unique_targets_card,
        })
    }

    fn get_sessions_chart(state: &State<Mutex<AppState>>) -> Result<Vec<SessionsChartData>, Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;

        let mut data: Vec<SessionsChartData> = Vec::new();

        for light_frame in app_state.imaging_frame_list.light_frames.values() {
            let chart_data_point = SessionsChartData {
                date: light_frame.date,
                seconds: (light_frame.sub_length * light_frame.total_subs() as f64) as u32
            };

            data.push(chart_data_point);
        }

        Ok(data)
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct SessionsChartData {
    date: DateTime<Utc>,
    seconds: u32,
}

#[derive(Serialize, Deserialize, Debug)]
struct InfoCards {
    total_exposure_time: InfoCardData,
    average_seeing: InfoCardData,
    total_imaging_session: InfoCardData,
    unique_targets: InfoCardData,
}

#[derive(Serialize, Deserialize, Debug)]
struct InfoCardData {
    title: String,
    content: String,
    decrease: bool,
    value: String,
    value_description: String
}
