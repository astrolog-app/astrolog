use crate::models::image::Image;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use crate::models::state::AppState;

// TODO: finish
#[tauri::command]
pub fn add_new_image(image: Image, state: State<Mutex<AppState>>) -> bool {
    let mut app_state = state.lock().unwrap();
    let mut destination = app_state.preferences.storage.root_directory.clone();
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


    let mut image_list = app_state.image_list.clone();
    image_list.push(new_image);

    app_state.image_list = image_list.clone();

    match Image::save_list(PathBuf::from(&app_state.preferences.storage.root_directory), &app_state.image_list) {
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
