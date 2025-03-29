use chrono::{DateTime, Utc};
use crate::models::equipment::{EquipmentItem, EquipmentList};
use crate::models::frontend::analytics::Analytics;
use crate::models::gallery_image_list::GalleryImage;
use crate::models::imaging_frames::{calibration_frame, dark_frame};
use crate::models::imaging_frames::calibration_type::CalibrationType;
use crate::models::imaging_session::ImagingSession;
use crate::models::preferences::{Config, LocalConfig};
use crate::models::state::AppState;
use serde::ser::SerializeMap;
use serde::{Deserialize, Serialize, Serializer};
use serde::de::Error;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct FrontendAppState {
    pub local_config: LocalConfig,
    pub config: Config,
    pub table_data: TableData,
    pub equipment_list: EquipmentList,
    pub image_list: Vec<GalleryImage>,
    pub analytics: Analytics,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TableData {
    pub sessions: Vec<LogTableRow>,
    pub calibration: Vec<CalibrationTableRow>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogTableRow {
    id: Uuid,
    date: DateTime<Utc>,
    target: String,
    sub_length: f64,
    total_subs: u32,
    integrated_subs: Option<u32>,
    filter: String,
    gain: u32,
    offset: Option<u32>,
    camera_temp: Option<f64>,
    outside_temp: Option<f64>,
    average_seeing: Option<f64>,
    average_cloud_cover: Option<f64>,
    average_moon: f64,
    telescope: String,
    flattener: String,
    mount: String,
    camera: String,
    notes: Option<String>,
}

impl LogTableRow {
    pub fn new(imaging_session: &ImagingSession, app_state: &AppState) -> Option<Self> {
        let light_frame = app_state
            .imaging_frame_list
            .light_frames
            .get(&imaging_session.light_frame_id);

        match light_frame {
            Some(light_frame) => {
                let filter_name = app_state
                    .equipment_list
                    .filters
                    .get(&light_frame.filter_id)
                    .map_or("N/A".to_string(), |filter| filter.view_name().clone());

                let telescope_name = app_state
                    .equipment_list
                    .telescopes
                    .get(&light_frame.telescope_id)
                    .map_or("N/A".to_string(), |telescope| telescope.view_name().clone());

                let flattener_name = app_state
                    .equipment_list
                    .flatteners
                    .get(&light_frame.flattener_id)
                    .map_or("N/A".to_string(), |flattener| flattener.view_name().clone());

                let mount_name = app_state
                    .equipment_list
                    .mounts
                    .get(&light_frame.mount_id)
                    .map_or("N/A".to_string(), |mount| mount.view_name().clone());

                let camera_name = app_state
                    .equipment_list
                    .cameras
                    .get(&light_frame.camera_id)
                    .map_or("N/A".to_string(), |camera| camera.view_name().clone());

                Some(LogTableRow {
                    id: imaging_session.id,
                    date: light_frame.date.clone(),
                    target: light_frame.target.clone(),
                    sub_length: light_frame.sub_length,
                    total_subs: light_frame.total_subs,
                    integrated_subs: light_frame.integrated_subs,
                    filter: filter_name,
                    gain: light_frame.gain,
                    offset: light_frame.offset,
                    camera_temp: light_frame.camera_temp,
                    outside_temp: light_frame.outside_temp,
                    average_seeing: light_frame.average_seeing,
                    average_cloud_cover: light_frame.average_cloud_cover,
                    average_moon: light_frame.average_moon,
                    telescope: telescope_name,
                    flattener: flattener_name,
                    mount: mount_name,
                    camera: camera_name,
                    notes: light_frame.notes.clone(),
                })
            }
            None => {
                None
            }
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CalibrationTableRow {
    pub(crate) id: Uuid,
    pub camera: String,
    pub calibration_type: CalibrationType,
    pub gain: u32,
    pub sub_length: Option<f64>,
    pub camera_temp: Option<f64>,
    pub total_subs: u32,
}

impl CalibrationTableRow {
    pub fn new(
        calibration_frame: Box<dyn calibration_frame::CalibrationFrame>,
        app_state: &AppState,
    ) -> Self {
        let mut sub_length = None;
        let mut camera_temp = None;

        if let Some(dark_frame) = calibration_frame
            .as_any()
            .downcast_ref::<dark_frame::DarkFrame>()
        {
            sub_length = Option::from(dark_frame.sub_length);
            camera_temp = Option::from(dark_frame.camera_temp);
        }

        let camera_name = app_state
            .equipment_list
            .cameras
            .get(&calibration_frame.camera_id())
            .map_or("N/A".to_string(), |camera| camera.view_name().clone());

        CalibrationTableRow {
            id: *calibration_frame.id(),
            camera: camera_name,
            calibration_type: calibration_frame.calibration_type(),
            gain: *calibration_frame.gain(),
            sub_length,
            camera_temp,
            total_subs: *calibration_frame.total_subs(),
        }
    }
}
