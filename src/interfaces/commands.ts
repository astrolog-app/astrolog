import { CalibrationType } from '@/enums/calibrationType';
import { UUID } from 'crypto';

export interface AnalyzedCalibrationFrames {
  calibration_type: CalibrationType;
  gain: number;
  sub_length: number;
  total_subs: number;
  message: string;
}

interface CalibrationFrame {
  id: UUID,
  camera_id: UUID,
  gain: number,
  frames_to_classify: string[],
  frames_classified: string[],
}


export interface DarkFrame extends CalibrationFrame {
  camera_temp: number,
  sub_length: number,
  in_imaging_session: boolean,
}

export interface BiasFrame extends CalibrationFrame {}
