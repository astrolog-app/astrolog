use uuid::Uuid;

pub struct ImagingSession {
    id: Uuid,
    folder_dir: String,
    light_frame_id: Uuid,
    flat_frame_id: Uuid,
    dark_frame_id: Uuid,
    bias_frame_id: Uuid,
}

// TODO: delete
impl ImagingSession {
    pub fn new() -> Vec<Self> {
        let session = ImagingSession {
            id: Uuid::new_v4(),
            folder_dir: "example".to_string(),
            light_frame_id: Uuid::new_v4(),
            flat_frame_id: Uuid::new_v4(),
            dark_frame_id: Uuid::new_v4(),
            bias_frame_id: Uuid::new_v4(),
        };

        vec![session]
    }
}
