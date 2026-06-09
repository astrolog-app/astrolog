use serde::de::DeserializeOwned;
use std::error::Error;
use std::fs::{create_dir_all, File};
use std::io::{Read, Write};
use std::path::Path;

pub fn load<T>(filename: &Path) -> Result<T, Box<dyn Error>>
where
    T: DeserializeOwned,
{
    let contents = std::fs::read_to_string(filename)?;
    Ok(serde_json::from_str(&contents)?)
}

pub fn save(filename: &Path, content: &str) -> Result<(), Box<dyn Error>> {
    if let Some(parent) = filename.parent() {
        create_dir_all(parent)?;
    }

    let mut file = File::create(filename)?;
    file.write_all(content.as_bytes())?;

    Ok(())
}
