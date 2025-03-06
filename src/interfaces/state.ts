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

export function isImagingSession(val: any): val is ImagingSession {
  return (
    val &&
    typeof val === "object" &&
    "id" in val &&
    "date" in val &&
    "target" in val &&
    "sub_length" in val &&
    "total_subs" in val &&
    "integrated_subs" in val &&
    "filter" in val &&
    "gain" in val &&
    "telescope" in val &&
    "mount" in val &&
    "camera" in val
  );
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

export function isCalibrationFrame(val: any): val is CalibrationFrame {
  return (
    val &&
    typeof val === "object" &&
    "id" in val &&
    "camera" in val &&
    "calibration_type" in val &&
    "gain" in val &&
    "total_subs" in val
  );
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
