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
  local_config: LocalConfig;
  config: Config;
  table_data: TableData;
  equipment_list: EquipmentList;
  image_list: GalleryImage[];
  analytics: Analytics | null;
}

export interface LocalConfig {
  root_directory: string;
  source_directory: string;
}

export interface Config {
  folder_paths: FolderPaths,
  locations: Map<UUID, Location>,
}

export interface FolderPaths {
  imaging_session_folder_path: FolderPath,
  calibration_frames_folder_path: FolderPath,
}

interface FolderPath {
  base_folder: string,
  pattern: string,
}

export interface Location {
  id: UUID,
  name: string,
  x: number,
  y: number,
  height: number,
  bortle: number,
}

export interface TableData {
  sessions: ImagingSession[];
  calibration: CalibrationFrame[];
}

export interface ImagingSession {
  id: UUID;
  date: Date;
  target: string;
  sub_length: number;
  total_subs: number;
  integrated_subs: number | undefined;
  filter: string;
  gain: number;
  offset: number | undefined;
  camera_temp: number | undefined;
  outside_temp: number | undefined;
  average_seeing: number | undefined;
  average_cloud_cover: number | undefined;
  average_moon: number;
  telescope: string;
  flattener: string;
  mount: string;
  camera: string;
  notes: string | undefined;
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

export interface GalleryImage {
  id: UUID;
  title: string;
  path: string;
  total_exposure: number;
}
