export interface Analytics {
  sessions_chart: SessionsChartData[];
  info_cards: InfoCards;
}

interface SessionsChartData {
  date: string;
  seconds: number;
}

interface InfoCards {
  total_exposure_time: InfoCardData,
  average_seeing: InfoCardData,
  total_imaging_session: InfoCardData,
  unique_targets: InfoCardData,
}

export interface InfoCardData {
  title: string;
  content: string;
  decrease: boolean;
  value: string;
  value_description: string;
}
