#[cfg(target_os = "windows")]
use std::os::windows::ffi::OsStrExt;
use std::path::PathBuf;
use std::{fs, io};

#[cfg(target_os = "windows")]
use winapi::um::fileapi::SetFileAttributesW;
#[cfg(target_os = "windows")]
use winapi::um::winnt::FILE_ATTRIBUTE_HIDDEN;

pub fn set_folder_invisible(path: PathBuf) {
    for component in path.ancestors() {
        let dir_name = component.file_name().and_then(|os_str| os_str.to_str());

        if let Some(name) = dir_name {
            if name.starts_with('.') {
                #[cfg(target_os = "windows")]
                {
                    // Convert the directory path directly to a wide string for Windows API
                    let wide_path: Vec<u16> =
                        component.as_os_str().encode_wide().chain(Some(0)).collect();

                    unsafe {
                        // Set the hidden attribute on the directory itself
                        SetFileAttributesW(wide_path.as_ptr(), FILE_ATTRIBUTE_HIDDEN);
                    }
                }
            }
        }
    }
}

pub fn is_directory_empty(path: &PathBuf) -> io::Result<bool> {
    let mut entries = fs::read_dir(path)?;
    Ok(entries.next().is_none())
}

// returns true if the path contains the .astrolog folder
pub fn dir_contains_metadata(path: &PathBuf) -> io::Result<bool> {
    let mut entries = fs::read_dir(path)?;

    for entry in entries {
        let entry = entry?;
        if entry.file_name() == ".astrolog" {
            return Ok(true);
        }
    }
    Ok(false)
}

pub fn rename_folder_with_overwrite(old_path: &PathBuf, new_path: &PathBuf) -> io::Result<()> {
    if fs::metadata(new_path).is_ok() {
        fs::remove_dir_all(new_path)?;
    }
    fs::rename(old_path, new_path)
}
