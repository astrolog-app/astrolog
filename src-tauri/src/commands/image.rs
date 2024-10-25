use std::path::PathBuf;

#[tauri::command]
pub fn get_date(image: PathBuf) -> Result<String, String> {
    crate::image::get_date(&image).map_err(|err| err.to_string())
}
