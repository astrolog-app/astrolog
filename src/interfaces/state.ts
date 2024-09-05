import { UUID } from 'crypto';

export interface AppState {
  preferences: Preferences;
  table_data: TableData;
  image_list: Image[];
}

export interface Preferences {
  storage: Storage;
  user: User;
  license: License;
}

interface Storage {
  root_directory: string;
  backup_directory: string;
  source_directory: string;
}

interface User {
  weather_api_key: string;
}

interface License {
  activated: boolean;
  user_email: string;
  license_key: string;
}

interface TableData {
  sessions: Session[];
  calibration: Calibration[]
}

export interface Session {
  id: UUID;
  date: string;
  target: string;
  sub_length: number;
  total_subs: number;
  integrated_subs: number;
  filter: string;
  gain: number;
  offset: number;
  camera_temp: number;
  outside_temp: number;
  average_seeing: number;
  average_cloud_cover: number;
  telescope: string;
  flattener: string;
  mount: string;
  camera: string;
  notes: string;
}

export interface Calibration {
  id: UUID;
  camera: string;
  calibration_type: string;
  gain: number;
  sub_length: number;
  camera_temp: number;
  total_subs: number;
}

export interface Image {
  title: string;
  path: string;
  total_exposure: number;
}
