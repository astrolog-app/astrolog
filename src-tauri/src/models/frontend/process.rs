use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize, Clone)]
pub struct Process {
    pub id: Uuid,
    pub name: String,
    pub modal: bool,
    pub finished: bool,
    pub step: Option<u32>,
    pub max: Option<u32>,
}
