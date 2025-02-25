use uuid::Uuid;

#[derive(serde::Serialize)]
pub struct Process {
    pub id: Uuid,
    pub name: String,
    pub modal: bool,
    pub step: u32,
    pub max: u32,
}
