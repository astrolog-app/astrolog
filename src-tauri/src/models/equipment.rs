use crate::file_store;
use chrono::{DateTime, Utc};
use serde::ser::SerializeStruct;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
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

    pub fn load(dir: PathBuf) -> Result<EquipmentList, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("equipment_list.json");
        Ok(file_store::load(&filename)?)
    }

    pub fn save(&self, dir: &PathBuf) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push(".astrolog");
        filename.push("equipment_list.json");
        Ok(file_store::save(
            &filename,
            &serde_json::to_string_pretty(self)?,
        )?)
    }
}

pub trait EquipmentItem {
    // fn id(&self) -> &Uuid;
    fn brand(&self) -> &str;
    fn name(&self) -> &str;
    fn view_name(&self) -> String {
        format!("{} {}", self.brand(), self.name())
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Telescope {
    pub id: Uuid,
    brand: String,
    name: String,
    notes: HashMap<Uuid, EquipmentNote>,

    focal_length: i32,
    aperture: i32,
}

impl EquipmentItem for Telescope {
    // fn id(&self) -> &Uuid {
    //     &self.id
    // }
    fn brand(&self) -> &str {
        &self.brand
    }
    fn name(&self) -> &str {
        &self.name
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Camera {
    pub id: Uuid,
    pub brand: String,
    pub name: String,
    pub notes: HashMap<Uuid, EquipmentNote>,

    pub chip_size: String,
    pub mega_pixel: f64,
    pub rgb: bool,
}

impl EquipmentItem for Camera {
    // fn id(&self) -> &Uuid {
    //     &self.id
    // }
    fn brand(&self) -> &str {
        &self.brand
    }
    fn name(&self) -> &str {
        &self.name
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Mount {
    pub id: Uuid,
    brand: String,
    name: String,
    notes: HashMap<Uuid, EquipmentNote>,
}

impl EquipmentItem for Mount {
    // fn id(&self) -> &Uuid {
    //     &self.id
    // }
    fn brand(&self) -> &str {
        &self.brand
    }
    fn name(&self) -> &str {
        &self.name
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Filter {
    pub id: Uuid,
    brand: String,
    name: String,
    notes: HashMap<Uuid, EquipmentNote>,

    pub filter_type: String,
}

impl EquipmentItem for Filter {
    // fn id(&self) -> &Uuid {
    //     &self.id
    // }
    fn brand(&self) -> &str {
        &self.brand
    }
    fn name(&self) -> &str {
        &self.name
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Flattener {
    pub id: Uuid,
    brand: String,
    name: String,
    notes: HashMap<Uuid, EquipmentNote>,

    factor: f64,
}

impl EquipmentItem for Flattener {
    // fn id(&self) -> &Uuid {
    //     &self.id
    // }
    fn brand(&self) -> &str {
        &self.brand
    }
    fn name(&self) -> &str {
        &self.name
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EquipmentNote {
    id: Uuid,
    date: DateTime<Utc>,
    note: String,
}
