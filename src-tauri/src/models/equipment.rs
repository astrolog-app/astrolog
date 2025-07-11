use chrono::{DateTime, Utc};
use serde::ser::SerializeStruct;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
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
    pub brand: String,
    pub name: String,
    pub notes: HashMap<Uuid, EquipmentNote>,

    pub focal_length: i32,
    pub aperture: i32,
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

    pub pixel_size: f64,
    pub pixel_x: u32,
    pub pixel_y: u32,
    pub is_monochrome: bool,
    pub is_dslr: bool,
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
    pub brand: String,
    pub name: String,
    pub notes: HashMap<Uuid, EquipmentNote>,
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
    pub brand: String,
    pub name: String,
    pub notes: HashMap<Uuid, EquipmentNote>,

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
    pub brand: String,
    pub name: String,
    pub notes: HashMap<Uuid, EquipmentNote>,

    pub factor: f64,
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
    pub id: Uuid,
    pub date: DateTime<Utc>,
    pub note: String,
}
