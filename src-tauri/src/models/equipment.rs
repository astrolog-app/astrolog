use std::error::Error;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::services::file_store;
use crate::services::state::get_readonly_app_state;

#[derive(Debug, Serialize, Deserialize)]
pub struct EquipmentList {
    pub telescopes: Vec<Telescope>,
    pub cameras: Vec<Camera>,
    pub mounts: Vec<Mount>,
    pub filters: Vec<Filter>,
    pub flatteners: Vec<Flattener>,
}

impl EquipmentList {
    pub fn new() -> Self {
        EquipmentList {
            telescopes: vec![],
            cameras: vec![],
            mounts: vec![],
            filters: vec![],
            flatteners: vec![],
        }
    }

    pub fn load(dir: PathBuf) -> Result<EquipmentList, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("equipment_list.json");
        Ok(file_store::load(filename)?)
    }

    pub fn save(dir: PathBuf) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push(".astrolog");
        filename.push("equipment_list.json");
        Ok(file_store::save(filename, serde_json::to_string_pretty(&get_readonly_app_state().equipment_list)?)?)
    }
}

pub trait EquipmentItem {
    fn id(&self) -> &Uuid;
    fn brand(&self) -> &str;
    fn name(&self) -> &str;
    fn view_name(&self) -> String {
        format!("{} {}", self.brand(), self.name())
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Telescope {
    id: Uuid,
    brand: String,
    name: String,

    focal_length: i32,
    aperture: i32
}

impl EquipmentItem for Telescope {
    fn id(&self) -> &Uuid {
        &self.id
    }
    fn brand(&self) -> &str {
        &self.brand
    }
    fn name(&self) -> &str {
        &self.name
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Camera {
    id: Uuid,
    brand: String,
    name:String,

    chip_size: String,
    mega_pixel: f64,
    rgb: bool
}

impl EquipmentItem for Camera {
    fn id(&self) -> &Uuid {
        &self.id
    }
    fn brand(&self) -> &str {
        &self.brand
    }
    fn name(&self) -> &str {
        &self.name
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Mount {
    id: Uuid,
    brand: String,
    name:String
}

impl EquipmentItem for Mount {
    fn id(&self) -> &Uuid {
        &self.id
    }
    fn brand(&self) -> &str {
        &self.brand
    }
    fn name(&self) -> &str {
        &self.name
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Filter {
    id: Uuid,
    brand: String,
    name:String,

    filter_type: String
}

impl EquipmentItem for Filter {
    fn id(&self) -> &Uuid {
        &self.id
    }
    fn brand(&self) -> &str {
        &self.brand
    }
    fn name(&self) -> &str {
        &self.name
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Flattener {
    id: Uuid,
    brand: String,
    name:String,

    factor: f64
}

impl EquipmentItem for Flattener {
    fn id(&self) -> &Uuid {
        &self.id
    }
    fn brand(&self) -> &str {
        &self.brand
    }
    fn name(&self) -> &str {
        &self.name
    }
}
