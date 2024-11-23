use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Analytics {
    sessions_chart: SessionsChart,
    info_cards: Vec<InfoCard>,
    equipment_chart: EquipmentChart,
    integration_chart: IntegrationChart,
}

impl Analytics {
    pub fn new() -> Analytics {
        let sessions_chart = SessionsChart {};

        let info_cards: Vec<InfoCard> = vec![];

        let pie_chart_data = PieChartData {};
        let equipment_chart = EquipmentChart {
            mounts: pie_chart_data
        };

        let integration_chart = IntegrationChart {
            integrated_subs: 0
        };

        Analytics {
            sessions_chart,
            info_cards,
            equipment_chart,
            integration_chart
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct SessionsChart {}

#[derive(Serialize, Deserialize, Debug)]
struct InfoCard {
    title: String,
    data: String
}

#[derive(Serialize, Deserialize, Debug)]
struct EquipmentChart {
    mounts: PieChartData
}

#[derive(Serialize, Deserialize, Debug)]
struct PieChartData {}

#[derive(Serialize, Deserialize, Debug)]
struct IntegrationChart {
    integrated_subs: i32,
}
