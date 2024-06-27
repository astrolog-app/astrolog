use std::sync::Mutex;
use once_cell::sync::Lazy;
use crate::models::equipment::EquipmentList;
use crate::models::imaging_frames::ImagingFrameList;
use crate::models::imaging_session::ImagingSession;

pub struct AppState {
    equipment_list: EquipmentList,
    imaging_frame_list: ImagingFrameList,
    imaging_session_list: Vec<ImagingSession>
}

impl AppState {
    fn new() -> Self {
        AppState {
            equipment_list: EquipmentList::new(),
            imaging_frame_list: ImagingFrameList::new(),
            imaging_session_list: ImagingSession::new()
        }
    }
}

static APP_STATE: Lazy<Mutex<AppState>> = Lazy::new(|| {
    Mutex::new(AppState::new())
});

pub fn get_app_state() -> &'static Mutex<AppState> {
    &APP_STATE
}
