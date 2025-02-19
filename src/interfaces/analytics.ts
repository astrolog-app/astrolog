export interface Analytics {
  sessions_chart: SessionsChart,
  info_cards: InfoCard[],
  equipment_chart: EquipmentChart,
  integration_chart: IntegrationChart,
}

interface SessionsChart {
  data: SessionsChartData[]
}

interface SessionsChartData {
  date: string,
  seconds: number,
}

interface InfoCard {
  title: string,
  data: string,
}

interface EquipmentChart {}

interface IntegrationChart {
  integrated_subs: number,
}
