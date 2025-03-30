use std::error::Error;
use std::fs;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{State, Window};
use crate::models::frontend::process::Process;
use crate::models::imaging_frames::imaging_frame_list::ImagingFrameList;
use crate::models::state::AppState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FlatFrame {
    pub id: Uuid,
    pub camera_id: Uuid,
    pub total_subs: u32,
    pub gain: u32,
    pub frames_to_classify: Vec<PathBuf>,
    pub frames_classified: Vec<PathBuf>,
}

impl FlatFrame {
    pub fn add(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;

        app_state.imaging_frame_list.flat_frames.insert(self.id, self.clone());

        ImagingFrameList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_frame_list,
        )
    }

    pub fn remove(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;

        app_state.imaging_frame_list.flat_frames.remove(&self.id);

        ImagingFrameList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_frame_list,
        )
    }

    pub fn edit(&self, state: &State<Mutex<AppState>>) -> Result<(), Box<dyn Error>> {
        Ok(())
    }

    pub fn build_path_imaging_session(&self, base: &PathBuf) -> Result<PathBuf, Box<dyn Error>> {
        let mut path = base.clone();

        path.push("Flat");

        Ok(path)
    }

    fn classify_helper(
        &mut self,
        base: &PathBuf,
        file_name: &PathBuf,
        frame: &PathBuf,
        destination: &PathBuf,
        state: &State<Mutex<AppState>>,
    ) -> Result<(), Box<dyn Error>> {
        // adjust self and save to .json
        let old = self.clone();

        let mut classify_path = base.clone();
        classify_path.push(file_name);
        self.frames_classified.push(classify_path);

        // remove file_to_classify
        self.frames_to_classify.retain(|path| path != frame);
        let mut app_state = state.lock().map_err(|e| e.to_string())?;
        app_state
            .imaging_frame_list
            .flat_frames
            .insert(self.id, self.clone());
        if let Err(e) = ImagingFrameList::save(
            app_state.local_config.root_directory.clone(),
            &app_state.imaging_frame_list,
        ) {
            // revert
            app_state
                .imaging_frame_list
                .flat_frames
                .insert(old.id, old);
            fs::remove_file(&destination).ok();
        };
        drop(app_state);

        Ok(())
    }

    pub fn classify_to_imaging_session(
        &mut self,
        state: &State<Mutex<AppState>>,
        window: &Window,
        process: &mut Process,
        base: &PathBuf,
    ) -> Result<(), Box<dyn Error>> {
        let path = self.build_path_imaging_session(base)?;
        let frames = self.frames_to_classify.clone();
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
