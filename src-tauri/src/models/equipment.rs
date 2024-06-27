use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct EquipmentList {
    telescopes: Vec<Telescope>,
    cameras: Vec<Camera>,
    mounts: Vec<Mount>,
    filters: Vec<Filter>,
    flatteners: Vec<Flattener>,
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
}

trait EquipmentItem {
    fn id(&self) -> &Uuid;
    fn brand(&self) -> &str;
    fn name(&self) -> &str;
}

#[derive(Debug, Serialize, Deserialize)]
struct Telescope {
    id: Uuid,
    brand: String,
    name:String,

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
struct Camera {
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
struct Mount {
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
struct Filter {
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
struct Flattener {
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
