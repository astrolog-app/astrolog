use serde::Serialize;
use tauri::{Emitter, Window};
use uuid::Uuid;

#[derive(Serialize, Clone)]
pub struct Process {
    id: Uuid,
    name: String,
    modal: bool,
    finished: bool,
    step: Option<u32>,
    max: Option<u32>,
    error: Option<String>,
}

impl Process {
    pub fn spawn(
        window: &Window,
        name: &str,
        modal: bool,
        step: Option<u32>,
        max: Option<u32>,
    ) -> Process {
        let process = Process {
            id: Uuid::new_v4(),
            name: name.to_string(),
            modal,
            finished: false,
            step,
            max,
            error: None,
        };
        window.emit("process", &process).unwrap();

        process
    }

    pub fn update(&mut self, window: &Window) {
        if let Some(step) = self.step {
            self.step = Some(step + 1);
        }
        window.emit("process", &self).unwrap();
    }

    pub fn kill(mut self, window: &Window, error_msg: String) {
        self.error = Some(error_msg);
        self.finish(window);
    }

    pub fn finish(mut self, window: &Window) {
        self.finished = true;
        window.emit("process", &self).unwrap();
    }
}
