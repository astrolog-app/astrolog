use crate::models::equipment::{EquipmentItem, EquipmentList};
use crate::models::frontend::analytics::Analytics;
use crate::models::gallery_image_list::GalleryImage;
use crate::models::imaging_frames::calibration_type::CalibrationType;
use crate::models::imaging_frames::imaging_frame::ClassifiableFrame;
use crate::models::imaging_session::ImagingSession;
use crate::models::preferences::{Config, LocalConfig};
use crate::models::state::AppState;
use chrono::{DateTime, Utc};
use serde::de::Error;
use serde::ser::SerializeMap;
use serde::{Deserialize, Serialize, Serializer};
use uuid::Uuid;
use crate::models::database::Database;

#[derive(Debug, Serialize, Deserialize)]
pub struct FrontendAppState {
    pub local_config: LocalConfig,
    pub config: Config,
    pub table_data: TableData,
    pub equipment_list: EquipmentList,
    pub image_list: Vec<GalleryImage>,
    pub analytics: Option<Analytics>,
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
    location_name: Option<String>,
    location_bortle: Option<u32>,
    sub_length: f64,
    total_subs: u32,
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
        let db = app_state.db.lock().unwrap(); // TODO
        let light_frame = db.get_light_frame_by_id(imaging_session.light_frame_id).unwrap();

        match light_frame {
            Some(light_frame) => {
                let filter_name = light_frame.filter_id
                    .as_ref()
                    .and_then(|id| db.get_filter_by_id(id.clone()).unwrap())
                    .map_or("N/A".to_string(), |filter| filter.view_name().clone());

                let telescope_name = db
                    .get_telescope_by_id(light_frame.telescope_id.clone())
                    .unwrap() // TODO
                    .map_or("N/A".to_string(), |telescope| telescope.view_name().clone());

                let flattener_name = light_frame.flattener_id
                    .as_ref()
                    .and_then(|id| db.get_flattener_by_id(id.clone()).unwrap())
                    .map_or("N/A".to_string(), |flattener| flattener.view_name().clone());

                let mount_name = db
                    .get_mount_by_id(light_frame.mount_id.clone())
                    .unwrap()
                    .map_or("N/A".to_string(), |mount| mount.view_name().clone());

                let camera_name = db
                    .get_camera_by_id(light_frame.camera_id.clone())
                    .ok()
                    .flatten()
                    .map_or("N/A".to_string(), |camera| camera.view_name().clone());

                let location = app_state
                    .config
                    .lock()
                    .unwrap() // TODO
                    .locations
                    .get(&light_frame.location_id)
                    .cloned();
                let location_name = location.as_ref().map(|loc| loc.name.clone());
                let location_bortle = location.as_ref().map(|loc| loc.bortle);

                Some(LogTableRow {
                    id: imaging_session.id,
                    date: light_frame.date.clone(),
                    target: light_frame.target.clone(),
                    location_name,
                    location_bortle,
                    sub_length: light_frame.sub_length,
                    total_subs: light_frame.total_subs(),
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
            None => None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CalibrationTableRow {
    pub id: Uuid,
    pub camera: String,
    pub calibration_type: CalibrationType,
    pub gain: u32,
    pub sub_length: Option<f64>,
    pub camera_temp: Option<f64>,
    pub total_subs: u32,
}
