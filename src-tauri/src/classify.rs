use crate::models::frontend::process::Process;
use crate::models::state::AppState;
use regex::Regex;
use std::error::Error;
use std::fs;
use std::path::{Component, PathBuf};
use std::sync::Mutex;
use tauri::{State, Window};

// TODO: two images with same name?
pub fn classify<F>(
    base: &PathBuf,
    frames_to_classify: &Vec<PathBuf>,
    state: &State<AppState>,
    mut save: F,
    window: &Window,
    process: &mut Process,
) -> Result<(), Box<dyn Error>>
where
    F: FnMut(
        &PathBuf,
        &PathBuf,
        &PathBuf,
        &PathBuf,
        &State<AppState>,
    ) -> Result<(), Box<dyn Error>>,
{
    let mut errors = Vec::new();

    for frame in frames_to_classify {
        let mut destination = state.root_directory.clone();
        destination.push(&base);
        if !destination.exists() {
            fs::create_dir_all(&destination)?;
        }

        // extract file_name out of frame
        let file_name = match frame.file_name() {
            Some(name) => name,
            None => {
                errors.push(format!(
                    "Couldn't extract filename out of frame: {:?}",
                    frame
                ));
                process.update(&window);

                continue;
            }
        };

        destination.push(file_name);
        // try to copy frame
        if let Err(e) = fs::copy(frame, &destination) {
            errors.push(format!(
                "Failed to copy {:?} -> {:?}: {}",
                frame, destination, e
            ));
            process.update(&window);

            continue;
        }

        save(base, &file_name.into(), frame, &destination, state)?;

        process.update(&window);
    }

    // return an error if any failures occurred
    if !errors.is_empty() {
        return Err(Box::new(std::io::Error::new(
            std::io::ErrorKind::Other,
            errors.join("\n"),
        )));
    }

    Ok(())
}

pub fn build_path<F>(
    base_folder: &PathBuf,
    pattern: &PathBuf,
    get_field_value: F,
) -> Result<PathBuf, Box<dyn Error>>
where
    F: Fn(&str) -> String,
{
    let re = Regex::new(r"\$\$(\w+)\$\$")?;
    let mut path = PathBuf::from(base_folder);

    for component in pattern.components() {
        if let Component::Normal(segment_osstr) = component {
            let segment = segment_osstr.to_string_lossy();
            let replaced = re.replace_all(&segment, |caps: &regex::Captures| {
                let field_name = &caps[1];
                get_field_value(field_name)
            });
            let replaced_str = replaced.to_string();
            if !replaced_str.is_empty() {
                path.push(replaced_str);
            }
        }
    }

    Ok(path)
}
