import { UUID } from 'crypto';

export interface ImagingSessionBase {
  id: UUID,
  frames: string[],
}

export interface ImagingSessionGeneral {
  date: Date,
  target: string,
  location_id: UUID,
}

export interface ImagingSessionDetails {
  gain: number,
  sub_length: number,
  offset: number | undefined,
  camera_temp: number | undefined,
  notes: string | undefined,
}

export interface ImagingSessionEquipment {
  camera_id: UUID,
  telescope_id: UUID,
  mount_id: UUID,
  filter_id: UUID | undefined,
  flattener_id: UUID | undefined,
}

export interface ImagingSessionWeather {
  outside_temp: number | undefined,
  average_seeing: number | undefined,
  average_cloud_cover: number | undefined,
}

export interface ImagingSessionCalibration {
  dark_frame_list_id: UUID | undefined,
  bias_frame_list_id: UUID | undefined,
  flat_frames_to_classify: string[],
  dark_frames_to_classify: string[],
}

export interface ImagingSessionEdit {
  base: ImagingSessionBase,
  general: ImagingSessionGeneral,
  details: ImagingSessionDetails,
  equipment: ImagingSessionEquipment,
  weather: ImagingSessionWeather,
  calibration: ImagingSessionCalibration,
}
