use crate::file_store;
use serde::ser::SerializeStruct;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug)]
pub struct EquipmentList {
    pub telescopes: HashMap<Uuid, Telescope>,
    pub cameras: HashMap<Uuid, Camera>,
    pub mounts: HashMap<Uuid, Mount>,
    pub filters: HashMap<Uuid, Filter>,
    pub flatteners: HashMap<Uuid, Flattener>,
}

impl<'de> Deserialize<'de> for EquipmentList {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        #[derive(Deserialize)]
        struct TempEquipmentList {
            pub telescopes: Vec<Telescope>,
            pub cameras: Vec<Camera>,
            pub mounts: Vec<Mount>,
            pub filters: Vec<Filter>,
            pub flatteners: Vec<Flattener>,
        }

        let TempEquipmentList {
            telescopes,
            cameras,
            mounts,
            filters,
            flatteners,
        } = TempEquipmentList::deserialize(deserializer)?;

        let telescopes_map: HashMap<Uuid, Telescope> = telescopes
            .into_iter()
            .map(|frame| (frame.id, frame))
            .collect();

        let cameras_map: HashMap<Uuid, Camera> =
            cameras.into_iter().map(|frame| (frame.id, frame)).collect();

        let mounts_map: HashMap<Uuid, Mount> =
            mounts.into_iter().map(|frame| (frame.id, frame)).collect();

        let filters_map: HashMap<Uuid, Filter> =
            filters.into_iter().map(|frame| (frame.id, frame)).collect();

        let flatteners_map: HashMap<Uuid, Flattener> = flatteners
            .into_iter()
            .map(|frame| (frame.id, frame))
            .collect();

        Ok(EquipmentList {
            telescopes: telescopes_map,
            cameras: cameras_map,
            mounts: mounts_map,
            filters: filters_map,
            flatteners: flatteners_map,
        })
    }
}

impl Serialize for EquipmentList {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let telescopes: Vec<&Telescope> = self.telescopes.values().collect();
        let cameras: Vec<&Camera> = self.cameras.values().collect();
        let mounts: Vec<&Mount> = self.mounts.values().collect();
        let filters: Vec<&Filter> = self.filters.values().collect();
        let flatteners: Vec<&Flattener> = self.flatteners.values().collect();

        let mut state = serializer.serialize_struct("EquipmentList", 4)?;
        state.serialize_field("telescopes", &telescopes)?;
        state.serialize_field("cameras", &cameras)?;
        state.serialize_field("mounts", &mounts)?;
        state.serialize_field("filters", &filters)?;
        state.serialize_field("flatteners", &flatteners)?;
        state.end()
    }
}

impl EquipmentList {
    pub fn new() -> Self {
        EquipmentList {
            telescopes: HashMap::new(),
            cameras: HashMap::new(),
            mounts: HashMap::new(),
            filters: HashMap::new(),
            flatteners: HashMap::new(),
        }
    }

    pub fn load(dir: PathBuf) -> Result<EquipmentList, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("equipment_list.json");
        Ok(file_store::load(filename)?)
    }

    pub fn save(dir: PathBuf, equipment_list: &EquipmentList) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push(".astrolog");
        filename.push("equipment_list.json");
        Ok(file_store::save(
            filename,
            serde_json::to_string_pretty(equipment_list)?,
        )?)
    }
}

pub trait EquipmentItem {
    fn id(&self) -> &Uuid;
    fn brand(&self) -> &str;
    fn name(&self) -> &str;
    fn view_name(&self) -> String {
        format!("{} {}", self.brand(), self.name())
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Telescope {
    id: Uuid,
    brand: String,
    name: String,

    focal_length: i32,
    aperture: i32,
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

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Camera {
    id: Uuid,
    brand: String,
    name: String,

    chip_size: String,
    mega_pixel: f64,
    rgb: bool,
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

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Mount {
    id: Uuid,
    brand: String,
    name: String,
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

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Filter {
    id: Uuid,
    brand: String,
    name: String,

    filter_type: String,
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

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Flattener {
    id: Uuid,
    brand: String,
    name: String,

    factor: f64,
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
