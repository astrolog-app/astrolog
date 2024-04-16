use uuid::Uuid;

pub struct Telescope {
    pub id: Uuid,
    pub used: bool,
    pub brand: String,
    pub name: String,

    pub filter_type: String
}
