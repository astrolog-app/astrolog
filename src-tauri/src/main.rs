// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::io::Read;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
struct Telescope {
  #[serde(with = "uuid_serde")]
  id: Uuid,
  used: bool,
  brand: String,
  name: String,
  focal_length: u32,
  aperture: u32,
}

mod uuid_serde {
  use serde::{self, Deserialize, Deserializer, Serializer};
  use uuid::Uuid;

  pub fn serialize<S>(uuid: &Uuid, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
  {
    let s = uuid.hyphenated().to_string();
    serializer.serialize_str(&s)
  }

  pub fn deserialize<'de, D>(deserializer: D) -> Result<Uuid, D::Error>
    where
        D: Deserializer<'de>,
  {
    let s = String::deserialize(deserializer)?;
    Uuid::parse_str(&s).map_err(serde::de::Error::custom)
  }
}

#[derive(Debug, Deserialize, Serialize)]
struct Telescopes {
  telescopes: Vec<Telescope>,
}

fn main() {
  // Read the JSON file
  let mut file = File::open("C:\\Users\\rouve\\Documents\\Programming\\AstroLog-java\\data\\equipment.json").expect("File not found");
  let mut data = String::new();
  file.read_to_string(&mut data).expect("Failed to read file");

  // Deserialize JSON into Telescopes struct
  let telescopes: Telescopes = serde_json::from_str(&data).expect("Failed to parse JSON");

  // Access the array of telescopes
  for telescope in telescopes.telescopes {
    println!("Telescope ID: {}", telescope.id);
    println!("Used: {}", telescope.used);
    println!("Brand: {}", telescope.brand);
    println!("Name: {}", telescope.name);
    println!("Focal Length: {} mm", telescope.focal_length);
    println!("Aperture: {} mm", telescope.aperture);
    println!();
  }


  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
