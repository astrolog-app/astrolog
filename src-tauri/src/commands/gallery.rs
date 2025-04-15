use crate::models::gallery_image_list::{GalleryImage, GalleryImageList};
use crate::models::state::AppState;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

// TODO: finish
#[tauri::command]
pub fn add_new_image(image: GalleryImage, state: State<AppState>) -> Result<(), String> {
    // let app_state = state.lock().unwrap();
    //
    // let mut destination = app_state.local_config.root_directory.clone();
    // drop(app_state);
    // destination.push("Gallery");
    // fs::create_dir_all(&destination).ok(); // TODO: log
    // destination.push(String::from(&image.title) + ".png");
    //
    // fs::copy(image.path, &destination).map_err(|e| e.to_string())?;
    //
    // let new_image = GalleryImage {
    //     id: Uuid::new_v4(),
    //     title: image.title,
    //     path: destination,
    //     total_exposure: 300,
    // };
    //
    // let mut app_state = state.lock().unwrap();
    // app_state.gallery_image_list.insert(image.id, new_image);
    //
    // GalleryImageList::save(
    //     PathBuf::from(&app_state.local_config.root_directory),
    //     &app_state.gallery_image_list,
    // )
    // .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn open_image(path: PathBuf) -> Result<(), String> {
    open::that(path).map_err(|e| e.to_string())
}
