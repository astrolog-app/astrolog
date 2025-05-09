use crate::models::equipment::{Camera};
use crate::models::frontend::process::Process;
use crate::models::frontend::state::CalibrationTableRow;
use crate::models::imaging_frames::calibration_type::CalibrationType;
use crate::models::state::AppState;
use std::any::Any;
use std::error::Error;
use std::fs;
use std::path::PathBuf;
use tauri::{State, Window};
use uuid::Uuid;
use crate::models::database::Database;

pub trait ClassifiableFrame: Clone {
    fn id(&self) -> Uuid;
    fn frames_to_classify(&self) -> &Vec<PathBuf>;
    fn frames_to_classify_mut(&mut self) -> &mut Vec<PathBuf>;
    fn frames_classified(&self) -> &Vec<PathBuf>;
    fn frames_classified_mut(&mut self) -> &mut Vec<PathBuf>;

    fn add_to_database(&self, db: &mut Database) -> Result<(), Box<dyn Error>>;
    fn remove_from_database(&self, db: &mut Database) -> Result<(), Box<dyn Error>>;

    fn total_subs(&self) -> u32 {
        let mut size = self.frames_to_classify().len() as u32;
        size += self.frames_classified().len() as u32;

        size
    }

    fn add(&self, state: &State<AppState>) -> Result<(), Box<dyn Error>> {
        let mut db = state.db.lock().map_err(|e| e.to_string())?;
        self.add_to_database(&mut db)
    }

    fn remove(&self, state: &State<AppState>) -> Result<(), Box<dyn Error>> {
        let mut db = state.db.lock().map_err(|e| e.to_string())?;
        self.remove_from_database(&mut db)
    }

    // fn edit(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
    //     Ok(())
    // }

    // TODO: revert with transaction
    fn classify_helper(
        &mut self,
        base: &PathBuf,
        file_name: &PathBuf,
        frame: &PathBuf,
        destination: &PathBuf,
        state: &State<AppState>,
    ) -> Result<(), Box<dyn Error>> {
        // save a clone of the current state
        let old = self.clone();

        // build the new path and update the classified frames list
        let mut classify_path = base.clone();
        classify_path.push(file_name);
        self.frames_classified_mut().push(classify_path);

        // remove the frame from the list to classify
        self.frames_to_classify_mut().retain(|p| p != frame);

        let mut db = state.db.lock().map_err(|e| e.to_string())?;

        if let Err(e) = self.add_to_database(&mut db) {
            // revert on error:
            // 1. remove the current (updated) value
            self.remove_from_database(&mut db).ok();
            // 2. restore the old value into the hashmap
            old.add_to_database(&mut db).ok();
            // 3. reset self to the old state
            *self = old;
            // 4. remove the destination file
            fs::remove_file(&destination).ok();
            return Err(e);
        }

        Ok(())
    }
}

pub trait ImagingSessionFrame: ClassifiableFrame + Clone {
    fn build_path(&self, base: &PathBuf) -> Result<PathBuf, Box<dyn Error>>;

    fn classify(
        &mut self,
        state: &State<AppState>,
        window: &Window,
        process: &mut Process,
        base: &PathBuf,
    ) -> Result<(), Box<dyn Error>> {
        let path = self.build_path(base)?;
        let frames = self.frames_to_classify().clone();
        let helper = |base: &PathBuf,
                      file_name: &PathBuf,
                      frame: &PathBuf,
                      destination: &PathBuf,
                      state: &State<AppState>| {
            self.classify_helper(base, file_name, frame, destination, state)
        };

        crate::classify::classify(&path, &frames, state, helper, window, process)?;

        Ok(())
    }
}

pub trait CalibrationFrame: ClassifiableFrame + Clone + Any {
    fn camera_id(&self) -> &Uuid;
    fn total_subs(&self) -> &u32;
    fn gain(&self) -> &u32;

    fn calibration_type(&self) -> CalibrationType;
    fn as_any(&self) -> &dyn Any {
        self
    }

    fn calibration_table_row(
        &self,
        state: &State<AppState>,
    ) -> Result<CalibrationTableRow, Box<dyn Error>>;
    fn get_field_value(&self, field: &str, camera: &Option<Camera>) -> String;
    fn build_path(&self, state: &State<AppState>) -> Result<PathBuf, Box<dyn Error>>;

    fn classify(
        &mut self,
        state: &State<AppState>,
        window: &Window,
        process: &mut Process,
    ) -> Result<(), Box<dyn Error>> {
        let base = self.build_path(state)?;
        let frames = self.frames_to_classify().clone();
        let helper = |base: &PathBuf,
                      file_name: &PathBuf,
                      frame: &PathBuf,
                      destination: &PathBuf,
                      state: &State<AppState>| {
            self.classify_helper(base, file_name, frame, destination, state)
        };

        crate::classify::classify(&base, &frames, state, helper, window, process)?;

        Ok(())
    }
}
