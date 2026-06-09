use std::sync::Mutex;

use rusqlite::Connection;

use crate::models::equipment::EquipmentList;

pub struct AppState {
    pub db: Mutex<Connection>,
    pub equipment: Mutex<EquipmentList>,
}
