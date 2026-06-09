mod db;
mod models;
mod state;

use std::sync::Mutex;

use tauri::Manager;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Open (or create) the database in the app data directory.
      let data_dir = app.path().app_data_dir()?;
      std::fs::create_dir_all(&data_dir)?;
      let conn = db::open(&data_dir.join("astrolog.db"))?;

      // Load the persisted equipment into memory once at startup.
      let equipment = db::load_equipment(&conn)?;

      app.manage(AppState {
        db: Mutex::new(conn),
        equipment: Mutex::new(equipment),
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
