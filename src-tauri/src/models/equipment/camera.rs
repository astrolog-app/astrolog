use uuid::Uuid;

pub struct Telescope {
    pub id: Uuid,
    pub used: bool,
    pub brand: String,
    pub name: String,

    pub chip_size: String,
    pub mega_pixel: i32,
    pub color: bool
}
