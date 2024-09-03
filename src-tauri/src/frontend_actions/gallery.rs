use std::fs;
use std::path::PathBuf;
use crate::models::image::Image;
use crate::services::state::{get_app_state, get_readonly_app_state};
use crate::utils::paths::ROOT_DIRECTORY_PATH;

// TODO: finish
#[tauri::command]
pub fn add_new_image(image: Image) -> bool {
    let mut destination = ROOT_DIRECTORY_PATH.clone();
    destination.push("Gallery");
    destination.push(String::from(&image.title) + ".png");
    if let Some(parent) = destination.parent() {
        fs::create_dir_all(parent);
    }

    match fs::copy(image.path, &destination) {
        Ok(..) => {
            println!("ok");
        }
        Err(e) => {
            println!("Error: {}", e);
        }
    }

    let new_image = Image {
        title: image.title,
        path: destination,
        total_exposure: 300,
    };

    let mut image_list = get_readonly_app_state().image_list.clone();
    image_list.push(new_image);

    get_app_state().image_list = image_list.clone();

    match Image::save_list(PathBuf::from(&get_readonly_app_state().preferences.storage.root_directory)) {
        Ok(..) => {
            println!("saved")
        }
        Err(e) => {
            println!("Error: {}", e)
        }
    }

    true
}

#[tauri::command]
pub fn open_image(path: PathBuf) -> Result<(), String> {
    open::that(path).map_err(|e| e.to_string())
}
