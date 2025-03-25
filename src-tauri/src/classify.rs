use std::error::Error;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{State, Window};
use crate::models::frontend::process::Process;
use crate::models::state::AppState;

pub fn classify<F>(
    base: &PathBuf,
    frames_to_classify: &Vec<PathBuf>,
    state: &State<Mutex<AppState>>,
    mut save: F,
    window: &Window,
    process: &mut Process,
) -> Result<(), Box<dyn Error>>
where
    F: FnMut(&PathBuf, &PathBuf, &PathBuf, &PathBuf, &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>>,
{
    let app_state = state.lock().map_err(|e| e.to_string())?;
    let root_directory = app_state.local_config.root_directory.clone();
    drop(app_state);

    let mut errors = Vec::new();

    for frame in frames_to_classify {
        let mut destination = root_directory.clone();
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
