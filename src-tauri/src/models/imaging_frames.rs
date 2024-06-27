use uuid::Uuid;

struct ImagingFrameList {
    light_frames: Vec<LightFrame>,
    dark_frames: Vec<DarkFrame>,
    bias_frames: Vec<BiasFrame>,
    flat_frames: Vec<FlatFrame>
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
