export interface Analytics {
  sessions_chart: SessionsChartData[],
  info_cards: InfoCardData[],
  equipment_chart: EquipmentChart,
  integration_chart: IntegrationChartData,
}

interface SessionsChartData {
  date: string,
  seconds: number,
}

interface InfoCardData {
  title: string,
  data: string,
}

interface EquipmentChart {
  mounts: EquipmentChartData,
  telescopes: EquipmentChartData,
  cameras: EquipmentChartData,
}

interface EquipmentChartData {
  one: PieChartData,
  two: PieChartData,
  three: PieChartData,
  four: PieChartData,
  five: PieChartData,
}

interface PieChartData {
  name: string,
  value: number,
}

interface IntegrationChartData {
  integrated_subs: number,
}
