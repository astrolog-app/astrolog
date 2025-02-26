use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Analytics {
    sessions_chart: Vec<SessionsChartData>,
    info_cards: Vec<InfoCardData>,
    equipment_chart: EquipmentChart,
    integration_chart: IntegrationChartData,
}

impl Analytics {
    pub fn new() -> Analytics {
        let sessions_chart_data = SessionsChartData {
            date: "tes".to_string(),
            seconds: 300
        };
        let sessions_chart = vec![sessions_chart_data];

        let info_card = InfoCardData {
            title: "Test".to_string(),
            data: "test".to_string(),
        };
        let info_cards: Vec<InfoCardData> = vec![
            info_card.clone(),
            info_card.clone(),
            info_card.clone(),
            info_card.clone(),
            info_card.clone(),
            info_card.clone(),
            info_card.clone(),
        ];

        let pie_chart_data = PieChartData {
            name: "test".to_string(),
            value: 300.0
        };
        let equipment_chart_data = EquipmentChartData {
            one: pie_chart_data.clone(),
            two: pie_chart_data.clone(),
            three: pie_chart_data.clone(),
            four: pie_chart_data.clone(),
            five: pie_chart_data,
        };
        let equipment_chart = EquipmentChart {
            mounts: equipment_chart_data.clone(),
            telescopes: equipment_chart_data.clone(),
            cameras: equipment_chart_data,
        };

        let integration_chart = IntegrationChartData { integrated_subs: 83.2 };

        Analytics {
            sessions_chart,
            info_cards,
            equipment_chart,
            integration_chart,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct SessionsChartData {
    date: String,
    seconds: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)] // TODO: remove clone
struct InfoCardData {
    title: String,
    data: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)] // TODO: remove clone
struct EquipmentChart {
    mounts: EquipmentChartData,
    telescopes: EquipmentChartData,
    cameras: EquipmentChartData,
}

#[derive(Serialize, Deserialize, Debug, Clone)] // TODO: remove clone
struct EquipmentChartData {
    one: PieChartData,
    two: PieChartData,
    three: PieChartData,
    four: PieChartData,
    five: PieChartData,
}

#[derive(Serialize, Deserialize, Debug, Clone)] // TODO: remove clone
struct PieChartData {
    name: String,
    value: f64,
}

#[derive(Serialize, Deserialize, Debug)]
struct IntegrationChartData {
    integrated_subs: f64,
}
