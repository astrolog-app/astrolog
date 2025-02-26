export interface Analytics {
  sessions_chart: SessionsChartData[];
  info_cards: InfoCardData[];
  equipment_chart: EquipmentChart;
  integration_chart: IntegrationChartData;
}

interface SessionsChartData {
  date: string;
  seconds: number;
}

interface InfoCardData {
  title: string;
  data: string;
}

export interface PieChartData {
  name: string
  value: number
}

type EquipmentChartData = [PieChartData, PieChartData, PieChartData, PieChartData, PieChartData]

interface EquipmentChart {
  mounts: EquipmentChartData
  telescopes: EquipmentChartData
  cameras: EquipmentChartData
}

interface IntegrationChartData {
  integrated_subs: number;
}

export const sampleAnalytics: Analytics = {
  sessions_chart: [
    { date: '2025-02-01', seconds: 3600 },
    { date: '2025-02-02', seconds: 5400 },
    { date: '2025-02-03', seconds: 2700 },
    { date: '2025-02-04', seconds: 4500 },
    { date: '2025-02-05', seconds: 3600 },
  ],

  info_cards: [
    { title: 'Total Imaging Time', data: '198 hours' },
    { title: 'Total Sessions', data: '34' },
    { title: 'Average Session Time', data: '5.8 hours' },
    { title: 'Most Used Equipment', data: 'ZWO ASI 294MC Pro' },
    { title: 'Highest Session Time', data: '12.5 hours' },
    { title: 'Lowest Session Time', data: '1.2 hours' },
    { title: 'Total Processed Images', data: '3200' },
  ],

  equipment_chart: {
    mounts: [
      { name: "Sky-Watcher EQ6-R Pro", value: 22 },
      { name: "Celestron CGX", value: 18 },
      { name: "iOptron CEM60", value: 15 },
      { name: "Losmandy G11T", value: 12 },
      { name: "Orion Atlas Pro", value: 10 },
    ],
    telescopes: [
      { name: "William Optics RedCat 51", value: 20 },
      { name: "Celestron C8 EdgeHD", value: 17 },
      { name: "Sky-Watcher Esprit 100ED", value: 15 },
      { name: "Takahashi FSQ-106EDX4", value: 12 },
      { name: "Meade 70mm Quadruplet Apo", value: 10 },
    ],
    cameras: [
      { name: "ZWO ASI294MC Pro", value: 25 },
      { name: "ZWO ASI2600MM Pro", value: 20 },
      { name: "QHY268M", value: 15 },
      { name: "Sony A7III (Astro-modified)", value: 12 },
      { name: "Canon EOS Ra", value: 10 },
    ],
  },

  integration_chart: {
    integrated_subs: 73.4,
  },
};
