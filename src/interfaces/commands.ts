import { CalibrationType } from '@/enums/calibrationType';
import { UUID } from 'crypto';

export interface AnalyzedCalibrationFrames {
  calibration_type: CalibrationType;
  gain: number;
  sub_length: number;
  total_subs: number;
  message: string;
}

export interface DarkFrames {
  id: UUID;
  camera: string;
  total_subs: number;
  gain: number;
  camera_temp: string;
  sub_length: string;
}

export interface BiasFrames {
  id: UUID;
  camera: string;
  total_subs: number;
  gain: number;
}
