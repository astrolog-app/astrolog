import { UUID } from 'crypto';
import { CalibrationType } from '@/enums/calibrationType';
import {
  Camera,
  Filter,
  Flattener,
  Mount,
  Telescope,
} from '@/interfaces/equipment';
import { Analytics } from '@/interfaces/analytics';

export interface AppState {
  preferences: Preferences;
  table_data: TableData;
  equipment_list: EquipmentList;
  image_list: Image[];
  analytics: Analytics;
}

export interface Preferences {
  storage: Storage;
  user: User;
}

interface Storage {
  root_directory: string;
  backup_directory: string;
  source_directory: string;
}

interface User {
  weather_api_key: string;
}

interface TableData {
  sessions: Session[];
  calibration: CalibrationFrame[];
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

export interface CalibrationFrame {
  id: UUID;
  camera: string;
  calibration_type: CalibrationType;
  gain: number;
  sub_length: number | undefined;
  camera_temp: number | undefined;
  total_subs: number;
}

export interface EquipmentList {
  cameras: Map<UUID, Camera>;
  telescopes: Map<UUID, Telescope>;
  mounts: Map<UUID, Mount>;
  filters: Map<UUID, Filter>;
  flatteners: Map<UUID, Flattener>;
}

export interface Image {
  id: UUID;
  title: string;
  path: string;
  total_exposure: number;
}
