use crate::models::image_list::{Image, ImageList};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;
use crate::models::state::AppState;

// TODO: finish
#[tauri::command]
pub fn add_new_image(image: Image, state: State<Mutex<AppState>>) -> Result<(), String> {
    let app_state = state.lock().unwrap();

    let mut destination = app_state.preferences.storage.root_directory.clone();
    drop(app_state);
    destination.push("Gallery");
    fs::create_dir_all(&destination).ok(); // TODO: log
    destination.push(String::from(&image.title) + ".png");

    fs::copy(image.path, &destination).map_err(|e| e.to_string())?;

    let new_image = Image {
        id: Uuid::new_v4(),
        title: image.title,
        path: destination,
        total_exposure: 300,
    };

    let mut app_state = state.lock().unwrap();
    app_state.image_list.insert(image.id, new_image);

    ImageList::save(
        PathBuf::from(&app_state.preferences.storage.root_directory), &app_state.image_list
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn open_image(path: PathBuf) -> Result<(), String> {
    open::that(path).map_err(|e| e.to_string())
}
