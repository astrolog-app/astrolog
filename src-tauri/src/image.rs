use exif::{Exif, In, Reader, Tag};
use std::error::Error;
use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;

fn get_exif_data(image: &PathBuf) -> Result<Exif, Box<dyn Error>> {
    let file = File::open(image)?;
    let exif_reader = Reader::new();
    let exif = exif_reader.read_from_container(&mut BufReader::new(file))?;

    Ok(exif)
}

pub fn get_gain(image: &PathBuf) -> Result<i32, Box<dyn Error>> {
    let exif = get_exif_data(image)?;

    let gain = exif
        .get_field(Tag::PhotographicSensitivity, In::PRIMARY)
        .ok_or("PhotographicSensitivity tag not found in exif data.")?
        .display_value()
        .to_string()
        .parse()?;

    Ok(gain)
}

pub fn get_exposure_time(image: &PathBuf) -> Result<f64, Box<dyn Error>> {
    let exif = get_exif_data(image)?;

    let exposure_time_string = exif
        .get_field(Tag::ExposureTime, In::PRIMARY)
        .ok_or("ExposureTime tag not found in exif data.")?
        .display_value()
        .to_string();

    if exposure_time_string.contains("/") {
        // Split the string by '/'
        let parts: Vec<&str> = exposure_time_string.split('/').collect();

        // Parse the numerator and denominator to f64
        let numerator: f64 = parts[0].parse()?;
        let denominator: f64 = parts[1].parse()?;

        Ok(numerator / denominator)
    } else {
        Ok(exposure_time_string.parse()?)
    }
}

pub fn get_date(image: &PathBuf) -> Result<String, Box<dyn Error>> {
    let exif = get_exif_data(image)?;

    let date_str = exif
        .get_field(Tag::DateTime, In::PRIMARY)
        .ok_or("DateTime tag not found in exif data.")?
        .display_value()
        .to_string();

    Ok(date_str)
}
