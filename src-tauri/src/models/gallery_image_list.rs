use std::collections::HashMap;
use crate::file_store;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::error::Error;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct GalleryImageList {
    pub gallery_image_list: HashMap<Uuid, GalleryImage>,
}

impl GalleryImageList {
    pub fn load(dir: PathBuf) -> Result<GalleryImageList, Box<dyn Error>> {
        let mut filename = dir;
        filename.push(".astrolog");
        filename.push("gallery_image_list.json");
        Ok(file_store::load(&filename)?)
    }

    pub fn save(dir: PathBuf, image_list_map: &HashMap<Uuid, GalleryImage>) -> Result<(), Box<dyn Error>> {
        let mut filename = dir.canonicalize().unwrap();
        filename.push(".astrolog");
        filename.push("gallery_image_list.json");

        let image_list = GalleryImageList {
            gallery_image_list: image_list_map.clone(),
        };

        Ok(file_store::save(
            &filename,
            &serde_json::to_string_pretty(&image_list)?,
        )?)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GalleryImage {
    pub id: Uuid,
    pub title: String,
    pub path: PathBuf,
    pub total_exposure: i32,
}
