use uuid::Uuid;

pub struct EquipmentList {
    telescopes: Vec<Telescope>,
    cameras: Vec<Camera>,
    mounts: Vec<Mount>,
    filters: Vec<Filter>,
    flatteners: Vec<Flattener>,
}

// TODO: delete
impl EquipmentList {
    pub fn new() -> Self {
        let telescope = Telescope {
            id: Uuid::new_v4(),
            brand: "Celestron".to_string(),
            name: "NexStar 8SE".to_string(),
            focal_length: 2032,
            aperture: 203,
        };

        let camera = Camera {
            id: Uuid::new_v4(),
            brand: "Canon".to_string(),
            name: "EOS Rebel T7i".to_string(),
            chip_size: "22.3mm x 14.9mm".to_string(),
            mega_pixel: 24,
            rgb: true,
        };

        let mount = Mount {
            id: Uuid::new_v4(),
            brand: "Orion".to_string(),
            name: "SkyView Pro".to_string(),
        };

        let filter = Filter {
            id: Uuid::new_v4(),
            brand: "Baader".to_string(),
            name: "UV/IR Cut Filter".to_string(),
            filter_type: "UV/IR Cut".to_string(),
        };

        let flattener = Flattener {
            id: Uuid::new_v4(),
            brand: "Astro-Tech".to_string(),
            name: "Field Flattener".to_string(),
            factor: 1,
        };

        EquipmentList {
            telescopes: vec![telescope],
            cameras: vec![camera],
            mounts: vec![mount],
            filters: vec![filter],
            flatteners: vec![flattener],
        }
    }
}

trait EquipmentItem {
    fn id(&self) -> &Uuid;
    fn brand(&self) -> &str;
    fn name(&self) -> &str;
}

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

struct Camera {
    id: Uuid,
    brand: String,
    name:String,

    chip_size: String,
    mega_pixel: i32,
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

struct Flattener {
    id: Uuid,
    brand: String,
    name:String,

    factor: i32
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
