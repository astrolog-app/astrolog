use crate::utils::file_system::set_folder_invisible;
use crate::utils::paths::ROOT_DIRECTORY_PATH;

pub fn setup() {
    let mut dir = ROOT_DIRECTORY_PATH.clone();
    dir.push(".astrolog");
    set_folder_invisible(dir);
}
