use std::collections::HashMap;
use crate::file_store;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::error::Error;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug)]
pub struct ImageList {
    pub image_list: HashMap<Uuid, Image>,
}

impl<'de> Deserialize<'de> for ImageList {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let image_list: Vec<Image> = Vec::deserialize(deserializer)?;

        let image_list_map: HashMap<Uuid, Image> = image_list
            .into_iter()
            .map(|session| (session.id, session))
            .collect();

        Ok(ImageList {
            image_list: image_list_map,
        })
    }
}

impl Serialize for ImageList {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let image_list: Vec<&Image> = self.image_list.values().collect();
        image_list.serialize(serializer)
    }
}

impl ImageList {
    pub fn load(dir: PathBuf) -> Result<ImageList, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("image_list.json");
        Ok(file_store::load(&filename)?)
    }

    pub fn save(dir: PathBuf, image_list_map: &HashMap<Uuid, Image>) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push(".astrolog");
        filename.push("image_list.json");

        let image_list = ImageList {
            image_list: image_list_map.clone(),
        };

        Ok(file_store::save(
            &filename,
            &serde_json::to_string_pretty(&image_list)?,
        )?)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Image {
    pub id: Uuid,
    pub title: String,
    pub path: PathBuf,
    pub total_exposure: i32,
}
