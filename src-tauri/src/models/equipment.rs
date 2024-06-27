use uuid::Uuid;

struct EquipmentList {
    telescopes: Vec<Telescope>,
    cameras: Vec<Camera>,
    mounts: Vec<Mount>,
    filters: Vec<Filter>,
    flatteners: Vec<Flattener>,
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
