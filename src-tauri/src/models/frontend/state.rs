use std::collections::BTreeMap;
use crate::models::equipment::{Camera, EquipmentItem, EquipmentList, Filter, Flattener, Mount, Telescope};
use crate::models::frontend::analytics::Analytics;
use crate::models::image_list::Image;
use crate::models::imaging_frames;
use crate::models::imaging_frames::CalibrationType;
use crate::models::imaging_session_list::ImagingSession;
use crate::models::preferences::Preferences;
use serde::{Deserialize, Serialize, Serializer};
use serde::ser::SerializeMap;
use uuid::Uuid;
use crate::models::state::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct FrontendAppState {
    pub preferences: Preferences,
    pub table_data: TableData,
    pub equipment_list: DefaultSerializeEquipmentList,
    pub image_list: Vec<Image>,
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
    date: String,
    target: String,
    sub_length: f64,
    total_subs: i32,
    integrated_subs: i32,
    filter: String,
    gain: i32,
    offset: i32,
    camera_temp: f64,
    outside_temp: f64,
    average_seeing: f64,
    average_cloud_cover: f64,
    average_moon: f64,
    telescope: String,
    flattener: String,
    mount: String,
    camera: String,
    notes: String,
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
                    id: light_frame.id,
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
                eprintln!("LightFrame with id {:?} not found", imaging_session.id);
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
    pub gain: i32,
    pub sub_length: Option<f64>,
    pub camera_temp: Option<f64>,
    pub total_subs: i32,
}

impl CalibrationTableRow {
    pub fn new(calibration_frame: Box<dyn imaging_frames::CalibrationFrame>, app_state: &AppState) -> Self {
        let mut sub_length = None;
        let mut camera_temp = None;

        if let Some(dark_frame) = calibration_frame
            .as_any()
            .downcast_ref::<imaging_frames::DarkFrame>()
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

#[derive(Debug, Deserialize)]
pub struct DefaultSerializeEquipmentList(pub EquipmentList);

impl Serialize for DefaultSerializeEquipmentList {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // Convert each HashMap<Uuid, T> into a BTreeMap<String, T>
        let telescopes: BTreeMap<String, &Telescope> = self.0.telescopes.iter()
            .map(|(k, v)| (k.to_string(), v))
            .collect();
        let cameras: BTreeMap<String, &Camera> = self.0.cameras.iter()
            .map(|(k, v)| (k.to_string(), v))
            .collect();
        let mounts: BTreeMap<String, &Mount> = self.0.mounts.iter()
            .map(|(k, v)| (k.to_string(), v))
            .collect();
        let filters: BTreeMap<String, &Filter> = self.0.filters.iter()
            .map(|(k, v)| (k.to_string(), v))
            .collect();
        let flatteners: BTreeMap<String, &Flattener> = self.0.flatteners.iter()
            .map(|(k, v)| (k.to_string(), v))
            .collect();

        let mut map = serializer.serialize_map(Some(5))?;
        map.serialize_entry("telescopes", &telescopes)?;
        map.serialize_entry("cameras", &cameras)?;
        map.serialize_entry("mounts", &mounts)?;
        map.serialize_entry("filters", &filters)?;
        map.serialize_entry("flatteners", &flatteners)?;
        map.end()
    }
}
