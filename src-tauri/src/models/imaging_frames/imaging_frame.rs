use std::error::Error;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{State, Window};
use uuid::Uuid;
use std::any::Any;
use crate::models::imaging_frames::imaging_frame_list::ImagingFrameList;
use crate::models::state::AppState;
use crate::models::frontend::process::Process;
use crate::models::imaging_frames::calibration_type::CalibrationType;

pub trait ClassifiableFrame: Clone {
    fn id(&self) -> Uuid;
    fn frames_to_classify(&self) -> &Vec<PathBuf>;
    fn frames_to_classify_mut(&mut self) -> &mut Vec<PathBuf>;
    fn frames_classified_mut(&mut self) -> &mut Vec<PathBuf>;

    fn add_to_list(&self, list: &mut ImagingFrameList);
    fn remove_from_list(&self, list: &mut ImagingFrameList);

    fn add(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;
        self.add_to_list(&mut app_state.imaging_frame_list);
        ImagingFrameList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_frame_list,
        )
    }

    fn remove(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;
        self.remove_from_list(&mut app_state.imaging_frame_list);
        ImagingFrameList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_frame_list,
        )
    }

    // fn edit(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
    //     Ok(())
    // }

    fn classify_helper(
        &mut self,
        base: &PathBuf,
        file_name: &PathBuf,
        frame: &PathBuf,
        destination: &PathBuf,
        state: &State<Mutex<AppState>>,
    ) -> Result<(), Box<dyn Error>> {
        // save a clone of the current state
        let old = self.clone();

        // build the new path and update the classified frames list
        let mut classify_path = base.clone();
        classify_path.push(file_name);
        self.frames_classified_mut().push(classify_path);

        // remove the frame from the list to classify
        self.frames_to_classify_mut().retain(|p| p != frame);

        let mut app_state = state.lock().map_err(|e| e.to_string())?;
        // add the updated frame into the corresponding hashmap
        self.add_to_list(&mut app_state.imaging_frame_list);

        if let Err(e) = ImagingFrameList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_frame_list,
        ) {
            // revert on error:
            // 1. remove the current (updated) value
            self.remove_from_list(&mut app_state.imaging_frame_list);
            // 2. restore the old value into the hashmap
            old.add_to_list(&mut app_state.imaging_frame_list);
            // 3. reset self to the old state
            *self = old;
            // 4. remove the destination file
            fs::remove_file(&destination).ok();
            return Err(e);
        }
        drop(app_state);

        Ok(())
    }
}

pub trait ImagingSessionFrame: ClassifiableFrame + Clone {
    fn build_path(&self, state: &State<Mutex<AppState>>) -> Result<PathBuf, Box<dyn Error>>;

    fn classify(
        &mut self,
        state: &State<Mutex<AppState>>,
        window: &Window,
        process: &mut Process,
    ) -> Result<(), Box<dyn Error>> {
        let base = self.build_path(state)?;
        let frames = self.frames_to_classify().clone();
        let helper = |base: &PathBuf,
                      file_name: &PathBuf,
                      frame: &PathBuf,
                      destination: &PathBuf,
                      state: &State<Mutex<AppState>>| {
            self.classify_helper(base, file_name, frame, destination, state)
        };

        crate::classify::classify(&base, &frames, state, helper, window, process)?;
        Ok(())
    }

    fn build_path_imaging_session(&self, base: &PathBuf) -> Result<PathBuf, Box<dyn Error>>;

    fn classify_to_imaging_session(
        &mut self,
        state: &State<Mutex<AppState>>,
        window: &Window,
        process: &mut Process,
        base: &PathBuf,
    ) -> Result<(), Box<dyn Error>> {
        let path = self.build_path_imaging_session(base)?;
        let frames = self.frames_to_classify().clone();
        let helper = |base: &PathBuf,
                      file_name: &PathBuf,
                      frame: &PathBuf,
                      destination: &PathBuf,
                      state: &State<Mutex<AppState>>| {
            self.classify_helper(base, file_name, frame, destination, state)
        };

        crate::classify::classify(
            &path,
            &frames,
            state,
            helper,
            window,
            process,
        )?;

        Ok(())
    }
}

pub trait CalibrationFrame: Any {
    fn id(&self) -> &Uuid;
    fn camera_id(&self) -> &Uuid;
    fn total_subs(&self) -> &u32;
    fn gain(&self) -> &u32;

    fn calibration_type(&self) -> CalibrationType;
    fn as_any(&self) -> &dyn Any;
}
