use crate::models::state::AppState;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::sync::Mutex;
use tauri::State;

#[derive(Serialize, Deserialize, Debug)]
pub struct Analytics {
    sessions_chart: Vec<SessionsChartData>,
    info_cards: InfoCards,
}

impl Analytics {
    pub fn new(state: &State<Mutex<AppState>>) -> Result<Option<Analytics>, Box<dyn Error>> {
        let app_state = state.lock().map_err(|e| e.to_string())?;

        if app_state.imaging_sessions.is_empty() {
            return Ok(None);
        }

        let sessions_chart_data = SessionsChartData {
            date: "tes".to_string(),
            seconds: 300,
        };
        let sessions_chart = vec![sessions_chart_data];

        let total_exposure_time = InfoCardData {
            title: "Total Exposure Time".to_string(),
            content: "2'450 min".to_string(),
            decrease: false,
            value: "12%".to_string(),
            value_description: "from last month".to_string(),
        };

        let average_seeing = InfoCardData {
            title: "Average Seeing".to_string(),
            content: "1.07\"".to_string(),
            decrease: true,
            value: "0.04\"".to_string(),
            value_description: "from last month".to_string(),
        };

        let total_imaging_session = InfoCardData {
            title: "Imaging Sessions".to_string(),
            content: "42".to_string(),
            decrease: false,
            value: "2".to_string(),
            value_description: "from last month".to_string(),
        };

        let unique_targets = InfoCardData {
            title: "Unique Targets".to_string(),
            content: "13".to_string(),
            decrease: false,
            value: "3".to_string(),
            value_description: "from last month".to_string(),
        };

        let info_cards = InfoCards {
            total_exposure_time,
            average_seeing,
            total_imaging_session,
            unique_targets,
        };

        Ok(Some(Analytics {
            sessions_chart,
            info_cards,
        }))
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct SessionsChartData {
    date: String,
    seconds: i32,
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
