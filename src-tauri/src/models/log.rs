use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LogTableRow {
  date: String,
  target: String,
  sub_length: i32,
  total_subs: i32,
  integrated_subs: i32,
  filter: String,
  gain: i32,
  offset: i32,
  camera_temp: i32,
  outside_temp: i32,
  average_seeing: i32,
  average_cloud_cover: i32,
  telescope: String,
  flattener: String,
  mount: String,
  camera: String,
  notes: String
}

impl LogTableRow {
  pub fn new_table_data() -> Vec<Self> {
    let log_entry_1 = LogTableRow {
      date: String::from("2024-06-26"),
      target: String::from("NGC 1234"),
      sub_length: 300,
      total_subs: 20,
      integrated_subs: 15,
      filter: String::from("L"),
      gain: 139,
      offset: 50,
      camera_temp: -10,
      outside_temp: 15,
      average_seeing: 2,
      average_cloud_cover: 10,
      telescope: String::from("Sky-Watcher Esprit 100ED"),
      flattener: String::from("Sky-Watcher 1.0x"),
      mount: String::from("Sky-Watcher EQ6-R Pro"),
      camera: String::from("ZWO ASI1600MM Pro"),
      notes: String::from("Clear night with good seeing conditions."),
    };

    let log_entry_2 = LogTableRow {
      date: String::from("2024-06-24"),
      target: String::from("NGC 5634"),
      sub_length: 110,
      total_subs: 50,
      integrated_subs: 45,
      filter: String::from("L"),
      gain: 23,
      offset: 50,
      camera_temp: -10,
      outside_temp: 15,
      average_seeing: 2,
      average_cloud_cover: 10,
      telescope: String::from("Sky-Watcher Esprit 100ED"),
      flattener: String::from("Sky-Watcher 1.0x"),
      mount: String::from("Sky-Watcher EQ6-R Pro"),
      camera: String::from("ZWO ASI1600MM Pro"),
      notes: String::from("Clear night with good seeing conditions."),
    };

    vec![log_entry_1, log_entry_2]
  }
}
