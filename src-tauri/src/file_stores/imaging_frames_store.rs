use std::error::Error;
use std::fs::{create_dir_all, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use serde_json::{from_str, to_string};
use crate::models::imaging_frames::ImagingFrameList;
use crate::state::get_readonly_app_state;

pub fn load(filename: &str) -> Result<ImagingFrameList, Box<dyn Error>> {
    // Open the file in read-only mode
    let mut file = File::open(filename)?;

    // Read the file contents into a string
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    // Deserialize the JSON string into EquipmentList
    let imaging_frame_list: ImagingFrameList = from_str(&contents)?;

    Ok(imaging_frame_list)
}

pub fn save(filename: PathBuf) -> Result<(), Box<dyn Error>> {
    if let Some(parent) = Path::new(&filename).parent() {
        create_dir_all(parent)?;
    }

    let app_state = get_readonly_app_state();
    // Open the file in write-only mode, creating it if necessary
    let mut file = File::create(filename)?;

    // Serialize the EquipmentList to a JSON string
    let contents = to_string(&app_state.imaging_frame_list)?;

    // Write the JSON string to the file
    file.write_all(contents.as_bytes())?;

    Ok(())
}
