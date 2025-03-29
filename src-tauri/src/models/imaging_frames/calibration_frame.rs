use std::any::Any;
use uuid::Uuid;
use crate::models::imaging_frames::bias_frame::BiasFrame;
use crate::models::imaging_frames::calibration_type::CalibrationType;
use crate::models::imaging_frames::dark_frame::DarkFrame;

pub trait CalibrationFrame: Any {
    fn id(&self) -> &Uuid;
    fn camera_id(&self) -> &Uuid;
    fn total_subs(&self) -> &u32;
    fn gain(&self) -> &u32;

    fn calibration_type(&self) -> CalibrationType;
    fn as_any(&self) -> &dyn Any;
}

impl CalibrationFrame for BiasFrame {
    fn id(&self) -> &Uuid {
        &self.id
    }

    fn camera_id(&self) -> &Uuid {
        &self.camera_id
    }

    fn total_subs(&self) -> &u32 {
        &self.total_subs
    }

    fn gain(&self) -> &u32 {
        &self.gain
    }
    fn calibration_type(&self) -> CalibrationType {
        CalibrationType::BIAS
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}

impl CalibrationFrame for DarkFrame {
    fn id(&self) -> &Uuid {
        &self.id
    }

    fn camera_id(&self) -> &Uuid {
        &self.camera_id
    }

    fn total_subs(&self) -> &u32 {
        &self.total_subs
    }

    fn gain(&self) -> &u32 {
        &self.gain
    }
    fn calibration_type(&self) -> CalibrationType {
        CalibrationType::DARK
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}
