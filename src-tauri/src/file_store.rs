use std::fs::{create_dir_all, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use serde::de::DeserializeOwned;
use std::error::Error;

pub fn load<T>(filename: PathBuf) -> Result<T, Box<dyn Error>>
where
    T: DeserializeOwned,
{
    // Open the file in read-only mode
    let mut file = File::open(filename)?;

    // Read the file contents into a string
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    // Deserialize the JSON string into the desired type
    let data: T = serde_json::from_str(&contents)?;

    Ok(data)
}

pub fn save(filename: PathBuf, content: String) -> Result<(), Box<dyn Error>> {
    if let Some(parent) = Path::new(&filename).parent() {
        create_dir_all(parent)?;
    }

    // Open the file in write-only mode, creating it if necessary
    let mut file = File::create(filename)?;

    // Write the JSON string to the file
    file.write_all(content.as_bytes())?;

    Ok(())
}
