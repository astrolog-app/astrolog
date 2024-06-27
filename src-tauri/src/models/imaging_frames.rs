use uuid::Uuid;

pub struct ImagingFrameList {
    light_frames: Vec<LightFrame>,
    dark_frames: Vec<DarkFrame>,
    bias_frames: Vec<BiasFrame>,
    flat_frames: Vec<FlatFrame>
}

// TODO: delete
impl ImagingFrameList {
    pub fn new() -> Self {
        let light_frame = LightFrame {
            id: Uuid::new_v4(),
            camera_id: Uuid::new_v4(),
            total_subs: 50,
            gain: 120,
            date: "2024-06-01".to_string(),
            target: "Andromeda Galaxy".to_string(),
            integrated_subs: 50,
            filter_id: Uuid::new_v4(),
            offset: 10,
            camera_temp: -10,
            outside_temp: 15,
            average_seeing: 3,
            average_cloud_cover: 20,
            average_moon: 30,
            telescope_id: Uuid::new_v4(),
            flattener_id: Uuid::new_v4(),
            mount_id: Uuid::new_v4(),
            notes: "Clear sky with minimal disturbance".to_string(),
            sub_length: 300,
        };

        let dark_frame = DarkFrame {
            id: Uuid::new_v4(),
            camera_id: Uuid::new_v4(),
            total_subs: 20,
            gain: 120,
            camera_temp: -10,
            sub_length: 300,
        };

        let bias_frame = BiasFrame {
            id: Uuid::new_v4(),
            camera_id: Uuid::new_v4(),
            total_subs: 100,
            gain: 120,
        };

        let flat_frame = FlatFrame {
            id: Uuid::new_v4(),
            camera_id: Uuid::new_v4(),
            total_subs: 30,
            gain: 120,
        };

        ImagingFrameList {
            light_frames: vec![light_frame],
            dark_frames: vec![dark_frame],
            bias_frames: vec![bias_frame],
            flat_frames: vec![flat_frame],
        }
    }
}

trait ImagingFrame {
    fn id(&self) -> &Uuid;
    fn camera_id(&self) -> &Uuid;
    fn total_subs(&self) -> &i32;
    fn gain(&self) -> &i32;
}

struct LightFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32,

    date: String,
    target: String,
    integrated_subs: i32,
    filter_id: Uuid,
    offset: i32,
    camera_temp: i32,
    outside_temp: i32,
    average_seeing: i32,
    average_cloud_cover: i32,
    average_moon: i32,
    telescope_id: Uuid,
    flattener_id: Uuid,
    mount_id: Uuid,
    notes: String,
    sub_length: i32
}

impl ImagingFrame for LightFrame {
    fn id(&self) -> &Uuid {
        &self.id
    }

    fn camera_id(&self) -> &Uuid {
        &self.camera_id
    }

    fn total_subs(&self) -> &i32 {
        &self.total_subs
    }

    fn gain(&self) -> &i32 {
        &self.gain
    }
}

struct DarkFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32,

    camera_temp: i32,
    sub_length: i32
}

impl ImagingFrame for DarkFrame {
    fn id(&self) -> &Uuid {
        &self.id
    }

    fn camera_id(&self) -> &Uuid {
        &self.camera_id
    }

    fn total_subs(&self) -> &i32 {
        &self.total_subs
    }

    fn gain(&self) -> &i32 {
        &self.gain
    }
}

struct BiasFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32
}

impl ImagingFrame for BiasFrame {
    fn id(&self) -> &Uuid {
        &self.id
    }

    fn camera_id(&self) -> &Uuid {
        &self.camera_id
    }

    fn total_subs(&self) -> &i32 {
        &self.total_subs
    }

    fn gain(&self) -> &i32 {
        &self.gain
    }
}

struct FlatFrame {
    id: Uuid,
    camera_id: Uuid,
    total_subs: i32,
    gain: i32
}

impl ImagingFrame for FlatFrame {
    fn id(&self) -> &Uuid {
        &self.id
    }

    fn camera_id(&self) -> &Uuid {
        &self.camera_id
    }

    fn total_subs(&self) -> &i32 {
        &self.total_subs
    }

    fn gain(&self) -> &i32 {
        &self.gain
    }
}
