use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct EquipmentList {
    pub telescopes: HashMap<Uuid, Telescope>,
    pub cameras: HashMap<Uuid, Camera>,
    pub mounts: HashMap<Uuid, Mount>,
    pub filters: HashMap<Uuid, Filter>,
    pub flatteners: HashMap<Uuid, Flattener>,
}

impl EquipmentList {
    pub fn new() -> Self {
        EquipmentList {
            telescopes: HashMap::new(),
            cameras: HashMap::new(),
            mounts: HashMap::new(),
            filters: HashMap::new(),
            flatteners: HashMap::new(),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Telescope {
    pub id: Uuid,
    pub brand: String,
    pub name: String,
    pub focal_length: i32,
    pub aperture: i32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Camera {
    pub id: Uuid,
    pub brand: String,
    pub name: String,
    pub pixel_size: f64,
    pub pixel_x: u32,
    pub pixel_y: u32,
    pub is_monochrome: bool,
    pub is_dslr: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Mount {
    pub id: Uuid,
    pub brand: String,
    pub name: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Filter {
    pub id: Uuid,
    pub brand: String,
    pub name: String,
    pub filter_type: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Flattener {
    pub id: Uuid,
    pub brand: String,
    pub name: String,
    pub factor: f64,
}
