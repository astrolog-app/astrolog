use crate::models::state::AppState;
use crate::utils::file_system::set_folder_invisible;

pub fn setup(app_state: &AppState) {
    let mut dir = app_state.preferences.storage.root_directory.clone();
    dir.push(".astrolog");
    set_folder_invisible(&dir);
}
