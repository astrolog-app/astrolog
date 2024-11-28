use once_cell::sync::Lazy;
use std::path::PathBuf;

pub static APP_DATA_PATH: Lazy<PathBuf> = Lazy::new(get_app_data_path);

fn get_app_data_path() -> PathBuf {
    PathBuf::from("C:\\Users\\rouve\\AppData\\Roaming\\AstroLog")
}
