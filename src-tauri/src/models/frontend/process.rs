use uuid::Uuid;

#[derive(serde::Serialize)]
pub struct Process {
    pub id: Uuid,
    pub name: String,
    pub modal: bool,
    pub step: Option<u32>,
    pub max: Option<u32>,
}
