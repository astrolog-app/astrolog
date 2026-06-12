use serde::Serialize;
use std::path::{Path, PathBuf};
use tauri::{Manager, State};
use tauri_plugin_dialog::DialogExt;
use uuid::Uuid;

use crate::db::Database;

use crate::models::equipment::{Camera, EquipmentList, Filter, Flattener, Mount, Telescope};
use crate::models::imaging_frames::bias_frame::{BiasFramePage, BiasFrameQuery};
use crate::models::imaging_frames::dark_flat_frame::{DarkFlatFramePage, DarkFlatFrameQuery};
use crate::models::imaging_frames::dark_frame::{DarkFramePage, DarkFrameQuery};
use crate::models::imaging_frames::flat_frame::{FlatFramePage, FlatFrameQuery};
use crate::models::imaging_frames::light_frame::{LightFramePage, LightFrameQuery};
use crate::preferences::{Config, LocalConfig, Unit};
use crate::state::AppState;

// serializable snapshot of the app state sent to the frontend
#[derive(Serialize)]
pub struct AppStateDto {
    pub local_config: LocalConfig,
    pub config: Config,
    pub equipment: EquipmentList,
}

#[tauri::command]
pub fn get_app_state(state: State<AppState>) -> Result<AppStateDto, String> {
    let equipment = state
        .db
        .lock()
        .unwrap()
        .get_equipment_list()
        .map_err(|e| {
            log::error!("get_app_state: failed to load equipment list: {e}");
            e.to_string()
        })?;

    let local_config = state.local_config.lock().unwrap().clone();
    let config = state.config.lock().unwrap().clone();

    Ok(AppStateDto {
        local_config,
        config,
        equipment,
    })
}

// ------------ first-run setup ------------

// os junk that may live in a folder the user reasonably considers empty
const IGNORED_DIR_ENTRIES: [&str; 3] = [".ds_store", "thumbs.db", "desktop.ini"];

// the library hard block: a root directory must either already be a library
// (contains .astrolog) or be empty, so every file under it stays registered
fn validate_library_folder(root: &Path) -> Result<(), String> {
    if !root.is_dir() {
        return Err("The selected path is not a folder.".to_string());
    }

    // existing library — opening it is always fine
    if root.join(".astrolog").is_dir() {
        return Ok(());
    }

    let entries = std::fs::read_dir(root).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_lowercase();
        if !IGNORED_DIR_ENTRIES.contains(&name.as_str()) {
            return Err(
                "The selected folder is not empty. Choose an empty folder or an existing AstroLog library.".to_string(),
            );
        }
    }

    Ok(())
}

// async so the blocking native dialog runs off the main thread
#[tauri::command]
pub async fn pick_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    log::debug!("pick_folder");
    let folder = app.dialog().file().blocking_pick_folder();
    Ok(folder.map(|f| f.to_string()))
}

// picks a folder and immediately runs the library hard block, so the welcome
// screen surfaces the error right after picking instead of at finish
#[tauri::command]
pub async fn pick_library_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    log::debug!("pick_library_folder");
    let Some(folder) = app.dialog().file().blocking_pick_folder() else {
        return Ok(None);
    };
    let path = folder.into_path().map_err(|e| e.to_string())?;
    validate_library_folder(&path).map_err(|e| {
        log::error!("pick_library_folder: invalid library folder: {e}");
        e
    })?;
    Ok(Some(path.to_string_lossy().into_owned()))
}

// validates the chosen root, persists the local config and creates the library
// skeleton, then restarts the app so the normal startup path loads everything
#[tauri::command]
pub async fn finish_setup(
    app: tauri::AppHandle,
    root_directory: PathBuf,
    unit: Unit,
) -> Result<(), String> {
    log::debug!("finish_setup: {}", root_directory.display());

    validate_library_folder(&root_directory).map_err(|e| {
        log::error!("finish_setup: invalid library folder: {e}");
        e
    })?;

    // create .astrolog with the database and config so the restarted app
    // opens a valid library
    Database::new(&root_directory).map_err(|e| {
        log::error!("finish_setup: failed to create library database: {e}");
        e.to_string()
    })?;
    Config::default().save(root_directory.clone()).map_err(|e| {
        log::error!("finish_setup: failed to save config: {e}");
        e.to_string()
    })?;

    let mut local_config = LocalConfig::default();
    local_config.root_directory = root_directory;
    local_config.unit = unit;

    let app_data_dir = app.path().app_data_dir().map_err(|e| {
        log::error!("finish_setup: failed to resolve app data dir: {e}");
        e.to_string()
    })?;
    local_config.save(app_data_dir).map_err(|e| {
        log::error!("finish_setup: failed to save local config: {e}");
        e.to_string()
    })?;

    log::info!("finish_setup: library created, restarting");
    app.restart()
}

// ------------ equipment: save (upsert) + delete ------------
// save_* use INSERT OR REPLACE under the hood, so they handle both add and edit

#[tauri::command]
pub fn save_telescope(state: State<AppState>, telescope: Telescope) -> Result<(), String> {
    log::debug!("save_telescope: {}", telescope.id);
    state
        .db
        .lock()
        .unwrap()
        .insert_telescope(&telescope)
        .map_err(|e| {
            log::error!("save_telescope {} failed: {e}", telescope.id);
            e.to_string()
        })
}

#[tauri::command]
pub fn delete_telescope(state: State<AppState>, id: Uuid) -> Result<(), String> {
    log::debug!("delete_telescope: {id}");
    state
        .db
        .lock()
        .unwrap()
        .remove_telescope(id)
        .map_err(|e| {
            log::error!("delete_telescope {id} failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn save_camera(state: State<AppState>, camera: Camera) -> Result<(), String> {
    log::debug!("save_camera: {}", camera.id);
    state
        .db
        .lock()
        .unwrap()
        .insert_camera(&camera)
        .map_err(|e| {
            log::error!("save_camera {} failed: {e}", camera.id);
            e.to_string()
        })
}

#[tauri::command]
pub fn delete_camera(state: State<AppState>, id: Uuid) -> Result<(), String> {
    log::debug!("delete_camera: {id}");
    state
        .db
        .lock()
        .unwrap()
        .remove_camera(id)
        .map_err(|e| {
            log::error!("delete_camera {id} failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn save_mount(state: State<AppState>, mount: Mount) -> Result<(), String> {
    log::debug!("save_mount: {}", mount.id);
    state
        .db
        .lock()
        .unwrap()
        .insert_mount(&mount)
        .map_err(|e| {
            log::error!("save_mount {} failed: {e}", mount.id);
            e.to_string()
        })
}

#[tauri::command]
pub fn delete_mount(state: State<AppState>, id: Uuid) -> Result<(), String> {
    log::debug!("delete_mount: {id}");
    state
        .db
        .lock()
        .unwrap()
        .remove_mount(id)
        .map_err(|e| {
            log::error!("delete_mount {id} failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn save_filter(state: State<AppState>, filter: Filter) -> Result<(), String> {
    log::debug!("save_filter: {}", filter.id);
    state
        .db
        .lock()
        .unwrap()
        .insert_filter(&filter)
        .map_err(|e| {
            log::error!("save_filter {} failed: {e}", filter.id);
            e.to_string()
        })
}

#[tauri::command]
pub fn delete_filter(state: State<AppState>, id: Uuid) -> Result<(), String> {
    log::debug!("delete_filter: {id}");
    state
        .db
        .lock()
        .unwrap()
        .remove_filter(id)
        .map_err(|e| {
            log::error!("delete_filter {id} failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn save_flattener(state: State<AppState>, flattener: Flattener) -> Result<(), String> {
    log::debug!("save_flattener: {}", flattener.id);
    state
        .db
        .lock()
        .unwrap()
        .insert_flattener(&flattener)
        .map_err(|e| {
            log::error!("save_flattener {} failed: {e}", flattener.id);
            e.to_string()
        })
}

#[tauri::command]
pub fn delete_flattener(state: State<AppState>, id: Uuid) -> Result<(), String> {
    log::debug!("delete_flattener: {id}");
    state
        .db
        .lock()
        .unwrap()
        .remove_flattener(id)
        .map_err(|e| {
            log::error!("delete_flattener {id} failed: {e}");
            e.to_string()
        })
}

// ------------ imaging frames ------------

#[tauri::command]
pub fn get_bias_frames(
    state: State<AppState>,
    query: BiasFrameQuery,
) -> Result<BiasFramePage, String> {
    log::debug!("get_bias_frames");
    state
        .db
        .lock()
        .unwrap()
        .get_bias_frames(&query)
        .map_err(|e| {
            log::error!("get_bias_frames failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn get_dark_frames(
    state: State<AppState>,
    query: DarkFrameQuery,
) -> Result<DarkFramePage, String> {
    log::debug!("get_dark_frames");
    state
        .db
        .lock()
        .unwrap()
        .get_dark_frames(&query)
        .map_err(|e| {
            log::error!("get_dark_frames failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn get_dark_flat_frames(
    state: State<AppState>,
    query: DarkFlatFrameQuery,
) -> Result<DarkFlatFramePage, String> {
    log::debug!("get_dark_flat_frames");
    state
        .db
        .lock()
        .unwrap()
        .get_dark_flat_frames(&query)
        .map_err(|e| {
            log::error!("get_dark_flat_frames failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn get_flat_frames(
    state: State<AppState>,
    query: FlatFrameQuery,
) -> Result<FlatFramePage, String> {
    log::debug!("get_flat_frames");
    state
        .db
        .lock()
        .unwrap()
        .get_flat_frames(&query)
        .map_err(|e| {
            log::error!("get_flat_frames failed: {e}");
            e.to_string()
        })
}

#[tauri::command]
pub fn get_light_frames(
    state: State<AppState>,
    query: LightFrameQuery,
) -> Result<LightFramePage, String> {
    log::debug!("get_light_frames");
    state
        .db
        .lock()
        .unwrap()
        .get_light_frames(&query)
        .map_err(|e| {
            log::error!("get_light_frames failed: {e}");
            e.to_string()
        })
}
