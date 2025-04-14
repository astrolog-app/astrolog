use crate::models::equipment::{Camera, EquipmentList, EquipmentNote, Filter, Flattener, Mount, Telescope};
use crate::models::imaging_frames::bias_frame::BiasFrame;
use crate::models::imaging_frames::calibration_type::CalibrationType;
use crate::models::imaging_frames::dark_frame::DarkFrame;
use crate::models::imaging_frames::flat_frame::FlatFrame;
use crate::models::imaging_frames::light_frame::LightFrame;
use crate::models::imaging_session::ImagingSession;
use chrono::{DateTime, Utc};
use rusqlite::{params, Connection, Result, Row};
use rusqlite_migration::{Migrations, M};
use std::collections::HashMap;
use std::path::PathBuf;
use uuid::Uuid;

pub struct Database {
    pub conn: Connection,
}

impl Database {
    pub fn new(root_directory: &PathBuf) -> Result<Self> {
        let db_path = root_directory.join(".astrolog").join("astrolog.db");
        std::fs::create_dir_all(db_path.parent().unwrap())
            .map_err(|e| rusqlite::Error::ExecuteReturnedResults)?;
        let mut conn = Connection::open(db_path)?;
        conn.pragma_update(None, "journal_mode", "WAL")?;

        let migrations = Migrations::new(vec![
            M::up(
                "CREATE TABLE IF NOT EXISTS equipment_notes (
                id TEXT PRIMARY KEY,
                equipment_id TEXT NOT NULL,
                date TEXT NOT NULL,
                note TEXT NOT NULL
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS telescopes (
                id TEXT PRIMARY KEY,
                brand TEXT NOT NULL,
                name TEXT NOT NULL,
                focal_length INTEGER NOT NULL,
                aperture INTEGER NOT NULL
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS cameras (
                id TEXT PRIMARY KEY,
                brand TEXT NOT NULL,
                name TEXT NOT NULL,
                chip_size TEXT NOT NULL,
                mega_pixel REAL NOT NULL,
                is_monochrome INTEGER NOT NULL,
                is_dslr INTEGER NOT NULL
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS mounts (
                id TEXT PRIMARY KEY,
                brand TEXT NOT NULL,
                name TEXT NOT NULL
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS filters (
                id TEXT PRIMARY KEY,
                brand TEXT NOT NULL,
                name TEXT NOT NULL,
                filter_type TEXT NOT NULL
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS flatteners (
                id TEXT PRIMARY KEY,
                brand TEXT NOT NULL,
                name TEXT NOT NULL,
                factor REAL NOT NULL
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS imaging_sessions (
                id TEXT PRIMARY KEY,
                folder_dir TEXT NOT NULL,
                light_frame_id TEXT NOT NULL,
                flat_frame_id TEXT,
                dark_frame_id TEXT,
                bias_frame_id TEXT
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS light_frames (
                id TEXT PRIMARY KEY,
                date TEXT NOT NULL,
                target TEXT NOT NULL,
                location_id TEXT NOT NULL,

                gain INTEGER NOT NULL,
                offset INTEGER,
                camera_temp REAL,
                notes TEXT,
                sub_length REAL NOT NULL,

                camera_id TEXT NOT NULL,
                telescope_id TEXT NOT NULL,
                mount_id TEXT NOT NULL,
                flattener_id TEXT,
                filter_id TEXT,

                outside_temp REAL,
                average_seeing REAL,
                average_cloud_cover REAL,
                average_moon REAL NOT NULL
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS dark_frames (
                id TEXT PRIMARY KEY,
                camera_id TEXT NOT NULL,
                total_subs INTEGER NOT NULL,
                gain INTEGER NOT NULL,
                in_imaging_session BOOLEAN NOT NULL,
                camera_temp REAL NOT NULL,
                sub_length REAL NOT NULL
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS flat_frames (
                id TEXT PRIMARY KEY,
                camera_id TEXT NOT NULL,
                total_subs INTEGER NOT NULL,
                gain INTEGER NOT NULL
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS bias_frames (
                id TEXT PRIMARY KEY,
                camera_id TEXT NOT NULL,
                total_subs INTEGER NOT NULL,
                gain INTEGER NOT NULL
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS frame_files (
                id TEXT PRIMARY KEY,
                frame_id TEXT NOT NULL,
                path TEXT NOT NULL,
                classified BOOLEAN NOT NULL,
                frame_type TEXT NOT NULL
            );",
            ),
        ]);

        migrations
            .to_latest(&mut conn)
            .map_err(|e| rusqlite::Error::ExecuteReturnedResults)?;
        Ok(Self { conn })
    }

    // ------------ Equipment ------------
    pub fn get_equipment_list(&self) -> Result<EquipmentList> {
        let list = EquipmentList {
            telescopes: self.get_telescopes()?,
            cameras: self.get_cameras()?,
            mounts: self.get_mounts()?,
            filters: self.get_filters()?,
            flatteners: self.get_flatteners()?,
        };
        Ok(list)
    }

    fn get_notes_for_equipment(&self, equipment_id: Uuid) -> Result<HashMap<Uuid, EquipmentNote>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, date, note FROM equipment_notes WHERE equipment_id = ?1")?;
        let mut rows = stmt.query(params![equipment_id.to_string()])?;
        let mut notes = HashMap::new();
        while let Some(row) = rows.next()? {
            let id_str: String = row.get(0)?;
            let id = Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil());
            let date_str: String = row.get(1)?;
            let note = row.get(2)?;
            let date = DateTime::parse_from_rfc3339(&date_str)
                .map_err(|e| {
                    rusqlite::Error::FromSqlConversionFailure(
                        0,
                        rusqlite::types::Type::Text,
                        Box::new(e),
                    )
                })?
                .with_timezone(&Utc);
            notes.insert(id, EquipmentNote { id, date, note });
        }
        Ok(notes)
    }

    pub fn insert_camera(&mut self, camera: &Camera) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute(
            "INSERT OR REPLACE INTO cameras (id, brand, name, chip_size, mega_pixel, is_monochrome, is_dslr) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                camera.id.to_string(),
                camera.brand,
                camera.name,
                camera.chip_size,
                camera.mega_pixel,
                camera.is_monochrome as i32,
                camera.is_dslr as i32
            ],
        )?;

        tx.execute(
            "DELETE FROM equipment_notes WHERE equipment_id = ?1",
            params![camera.id.to_string()],
        )?;
        for note in camera.notes.values() {
            tx.execute(
                "INSERT INTO equipment_notes (id, equipment_id, date, note) VALUES (?1, ?2, ?3, ?4)",
                params![
                    note.id.to_string(),
                    camera.id.to_string(),
                    note.date.to_rfc3339(),
                    note.note
                ],
            )?;
        }
        tx.commit()?;
        Ok(())
    }

    pub fn remove_camera(&mut self, id: Uuid) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute("DELETE FROM cameras WHERE id = ?1", params![id.to_string()])?;
        tx.execute(
            "DELETE FROM equipment_notes WHERE equipment_id = ?1",
            params![id.to_string()],
        )?;
        tx.commit()?;
        Ok(())
    }

    pub fn get_camera_by_id(&self, id: Uuid) -> Result<Option<Camera>> {
        let mut stmt = self
            .conn
            .prepare("SELECT brand, name, chip_size, mega_pixel, is_monochrome, is_dslr FROM cameras WHERE id = ?1")?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            let notes = self.get_notes_for_equipment(id)?;
            Ok(Some(Camera {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                notes,
                chip_size: row.get(2)?,
                mega_pixel: row.get(3)?,
                is_monochrome: row.get::<_, i32>(4)? != 0,
                is_dslr: row.get::<_, i32>(5)? != 0,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_cameras(&self) -> Result<HashMap<Uuid, Camera>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, brand, name, chip_size, mega_pixel, is_monochrome, is_dslr FROM cameras",
        )?;
        let mut rows = stmt.query([])?;
        let mut result = HashMap::new();
        while let Some(row) = rows.next()? {
            let id_str: String = row.get(0)?;
            let id = Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil());
            let notes = self.get_notes_for_equipment(id)?;
            result.insert(
                id,
                Camera {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    notes,
                    chip_size: row.get(3)?,
                    mega_pixel: row.get(4)?,
                    is_monochrome: row.get::<_, i32>(5)? != 0,
                    is_dslr: row.get::<_, i32>(6)? != 0,
                },
            );
        }
        Ok(result)
    }

    pub fn insert_telescope(&mut self, telescope: &Telescope) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute(
            "INSERT OR REPLACE INTO telescopes (id, brand, name, focal_length, aperture) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
            telescope.id.to_string(),
            telescope.brand,
            telescope.name,
            telescope.focal_length,
            telescope.aperture,
        ],
        )?;
        tx.execute(
            "DELETE FROM equipment_notes WHERE equipment_id = ?1",
            params![telescope.id.to_string()],
        )?;
        for note in telescope.notes.values() {
            tx.execute(
                "INSERT INTO equipment_notes (id, equipment_id, date, note) VALUES (?1, ?2, ?3, ?4)",
                params![
                note.id.to_string(),
                telescope.id.to_string(),
                note.date.to_rfc3339(),
                note.note
            ],
            )?;
        }
        tx.commit()?;
        Ok(())
    }

    pub fn remove_telescope(&mut self, id: Uuid) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute(
            "DELETE FROM telescopes WHERE id = ?1",
            params![id.to_string()],
        )?;
        tx.execute(
            "DELETE FROM equipment_notes WHERE equipment_id = ?1",
            params![id.to_string()],
        )?;
        tx.commit()?;
        Ok(())
    }

    pub fn get_telescope_by_id(&self, id: Uuid) -> Result<Option<Telescope>> {
        let mut stmt = self
            .conn
            .prepare("SELECT brand, name, focal_length, aperture FROM telescopes WHERE id = ?1")?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            let notes = self.get_notes_for_equipment(id)?;
            Ok(Some(Telescope {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                notes,
                focal_length: row.get(2)?,
                aperture: row.get(3)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_telescopes(&self) -> Result<HashMap<Uuid, Telescope>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, brand, name, focal_length, aperture FROM telescopes")?;
        let mut rows = stmt.query([])?;
        let mut result = HashMap::new();
        while let Some(row) = rows.next()? {
            let id_str: String = row.get(0)?;
            let id = Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil());
            let notes = self.get_notes_for_equipment(id)?;
            result.insert(
                id,
                Telescope {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    notes,
                    focal_length: row.get(3)?,
                    aperture: row.get(4)?,
                },
            );
        }
        Ok(result)
    }

    pub fn insert_mount(&mut self, mount: &Mount) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute(
            "INSERT OR REPLACE INTO mounts (id, brand, name) VALUES (?1, ?2, ?3)",
            params![mount.id.to_string(), mount.brand, mount.name,],
        )?;
        tx.execute(
            "DELETE FROM equipment_notes WHERE equipment_id = ?1",
            params![mount.id.to_string()],
        )?;
        for note in mount.notes.values() {
            tx.execute(
                "INSERT INTO equipment_notes (id, equipment_id, date, note) VALUES (?1, ?2, ?3, ?4)",
                params![
                note.id.to_string(),
                mount.id.to_string(),
                note.date.to_rfc3339(),
                note.note
            ],
            )?;
        }
        tx.commit()?;
        Ok(())
    }

    pub fn remove_mount(&mut self, id: Uuid) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute("DELETE FROM mounts WHERE id = ?1", params![id.to_string()])?;
        tx.execute(
            "DELETE FROM equipment_notes WHERE equipment_id = ?1",
            params![id.to_string()],
        )?;
        tx.commit()?;
        Ok(())
    }

    pub fn get_mount_by_id(&self, id: Uuid) -> Result<Option<Mount>> {
        let mut stmt = self
            .conn
            .prepare("SELECT brand, name FROM mounts WHERE id = ?1")?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            let notes = self.get_notes_for_equipment(id)?;
            Ok(Some(Mount {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                notes,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_mounts(&self) -> Result<HashMap<Uuid, Mount>> {
        let mut stmt = self.conn.prepare("SELECT id, brand, name FROM mounts")?;
        let mut rows = stmt.query([])?;
        let mut result = HashMap::new();
        while let Some(row) = rows.next()? {
            let id_str: String = row.get(0)?;
            let id = Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil());
            let notes = self.get_notes_for_equipment(id)?;
            result.insert(
                id,
                Mount {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    notes,
                },
            );
        }
        Ok(result)
    }

    pub fn insert_filter(&mut self, filter: &Filter) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute(
            "INSERT OR REPLACE INTO filters (id, brand, name, filter_type) VALUES (?1, ?2, ?3, ?4)",
            params![
                filter.id.to_string(),
                filter.brand,
                filter.name,
                filter.filter_type,
            ],
        )?;
        tx.execute(
            "DELETE FROM equipment_notes WHERE equipment_id = ?1",
            params![filter.id.to_string()],
        )?;
        for note in filter.notes.values() {
            tx.execute(
                "INSERT INTO equipment_notes (id, equipment_id, date, note) VALUES (?1, ?2, ?3, ?4)",
                params![
                note.id.to_string(),
                filter.id.to_string(),
                note.date.to_rfc3339(),
                note.note
            ],
            )?;
        }
        tx.commit()?;
        Ok(())
    }

    pub fn remove_filter(&mut self, id: Uuid) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute("DELETE FROM filters WHERE id = ?1", params![id.to_string()])?;
        tx.execute(
            "DELETE FROM equipment_notes WHERE equipment_id = ?1",
            params![id.to_string()],
        )?;
        tx.commit()?;
        Ok(())
    }

    pub fn get_filter_by_id(&self, id: Uuid) -> Result<Option<Filter>> {
        let mut stmt = self
            .conn
            .prepare("SELECT brand, name, filter_type FROM filters WHERE id = ?1")?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            let notes = self.get_notes_for_equipment(id)?;
            Ok(Some(Filter {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                notes,
                filter_type: row.get(2)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_filters(&self) -> Result<HashMap<Uuid, Filter>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, brand, name, filter_type FROM filters")?;
        let mut rows = stmt.query([])?;
        let mut result = HashMap::new();
        while let Some(row) = rows.next()? {
            let id_str: String = row.get(0)?;
            let id = Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil());
            let notes = self.get_notes_for_equipment(id)?;
            result.insert(
                id,
                Filter {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    notes,
                    filter_type: row.get(3)?,
                },
            );
        }
        Ok(result)
    }

    pub fn insert_flattener(&mut self, flattener: &Flattener) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute(
            "INSERT OR REPLACE INTO flatteners (id, brand, name, factor) VALUES (?1, ?2, ?3, ?4)",
            params![
                flattener.id.to_string(),
                flattener.brand,
                flattener.name,
                flattener.factor,
            ],
        )?;
        tx.execute(
            "DELETE FROM equipment_notes WHERE equipment_id = ?1",
            params![flattener.id.to_string()],
        )?;
        for note in flattener.notes.values() {
            tx.execute(
                "INSERT INTO equipment_notes (id, equipment_id, date, note) VALUES (?1, ?2, ?3, ?4)",
                params![
                note.id.to_string(),
                flattener.id.to_string(),
                note.date.to_rfc3339(),
                note.note
            ],
            )?;
        }
        tx.commit()?;
        Ok(())
    }

    pub fn remove_flattener(&mut self, id: Uuid) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute(
            "DELETE FROM flatteners WHERE id = ?1",
            params![id.to_string()],
        )?;
        tx.execute(
            "DELETE FROM equipment_notes WHERE equipment_id = ?1",
            params![id.to_string()],
        )?;
        tx.commit()?;
        Ok(())
    }

    pub fn get_flattener_by_id(&self, id: Uuid) -> Result<Option<Flattener>> {
        let mut stmt = self
            .conn
            .prepare("SELECT brand, name, factor FROM flatteners WHERE id = ?1")?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            let notes = self.get_notes_for_equipment(id)?;
            Ok(Some(Flattener {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                notes,
                factor: row.get(2)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_flatteners(&self) -> Result<HashMap<Uuid, Flattener>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, brand, name, factor FROM flatteners")?;
        let mut rows = stmt.query([])?;
        let mut result = HashMap::new();
        while let Some(row) = rows.next()? {
            let id_str: String = row.get(0)?;
            let id = Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil());
            let notes = self.get_notes_for_equipment(id)?;
            result.insert(
                id,
                Flattener {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    notes,
                    factor: row.get(3)?,
                },
            );
        }
        Ok(result)
    }

    // ------------ Imaging Sessions ------------
    pub fn insert_imaging_session(&self, imaging_session: &ImagingSession) -> Result<()> {
        println!("test");
        self.conn.execute(
            "INSERT OR REPLACE INTO imaging_sessions (id, folder_dir, light_frame_id, flat_frame_id, dark_frame_id, bias_frame_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                imaging_session.id.to_string(),
                imaging_session.folder_dir.to_string_lossy(),
                imaging_session.light_frame_id.to_string(),
                imaging_session
                    .flat_frame_id
                    .as_ref()
                    .map(|id| id.to_string()),
                imaging_session
                    .dark_frame_id
                    .as_ref()
                    .map(|id| id.to_string()),
                imaging_session
                    .bias_frame_id
                    .as_ref()
                    .map(|id| id.to_string()),
            ],
        )?;
        println!("test2");
        Ok(())
    }

    pub fn remove_imaging_session(&mut self, id: Uuid) -> Result<()> {
        self.conn.execute(
            "DELETE FROM imaging_sessions WHERE id = ?1",
            params![id.to_string()],
        )?;
        Ok(())
    }

    pub fn get_imaging_session_by_id(&self, id: Uuid) -> Result<Option<ImagingSession>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, folder_dir, light_frame_id, flat_frame_id, dark_frame_id, bias_frame_id
         FROM imaging_sessions WHERE id = ?1",
        )?;
        let mut rows = stmt.query([id.to_string()])?;

        if let Some(row) = rows.next()? {
            Ok(Some(imaging_session_from_row(&row)?))
        } else {
            Ok(None)
        }
    }

    pub fn get_imaging_sessions(&self) -> Result<HashMap<Uuid, ImagingSession>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, folder_dir, light_frame_id, flat_frame_id, dark_frame_id, bias_frame_id
         FROM imaging_sessions",
        )?;
        let mut rows = stmt.query([])?;
        let mut result = HashMap::new();

        while let Some(row) = rows.next()? {
            let session = imaging_session_from_row(&row)?;
            result.insert(session.id, session);
        }

        Ok(result)
    }

    // ------------ Imaging Frames ------------
    fn build_light_frame_from_row(&self, row: &rusqlite::Row) -> Result<LightFrame> {
        let id_str: String = row.get("id")?;
        let id = Uuid::parse_str(&id_str).unwrap();

        let frames_to_classify = self.get_frame_files_by_classification(&id, false)?;
        let frames_classified = self.get_frame_files_by_classification(&id, true)?;

        Ok(LightFrame {
            id,
            frames_to_classify,
            frames_classified,
            date: DateTime::parse_from_rfc3339(&row.get::<_, String>("date")?)
                .unwrap()
                .with_timezone(&Utc),
            target: row.get("target")?,
            location_id: Uuid::parse_str(&row.get::<_, String>("location_id")?).unwrap(),
            gain: row.get("gain")?,
            offset: row.get("offset")?,
            camera_temp: row.get("camera_temp")?,
            notes: row.get("notes")?,
            sub_length: row.get("sub_length")?,
            camera_id: Uuid::parse_str(&row.get::<_, String>("camera_id")?).unwrap(),
            telescope_id: Uuid::parse_str(&row.get::<_, String>("telescope_id")?).unwrap(),
            mount_id: Uuid::parse_str(&row.get::<_, String>("mount_id")?).unwrap(),
            flattener_id: row
                .get::<_, Option<String>>("flattener_id")?
                .map(|s| Uuid::parse_str(&s).unwrap()),
            filter_id: row
                .get::<_, Option<String>>("filter_id")?
                .map(|s| Uuid::parse_str(&s).unwrap()),
            outside_temp: row.get("outside_temp")?,
            average_seeing: row.get("average_seeing")?,
            average_cloud_cover: row.get("average_cloud_cover")?,
            average_moon: row.get("average_moon")?,
        })
    }

    fn get_frame_files_by_classification(
        &self,
        frame_id: &Uuid,
        classified: bool,
    ) -> Result<Vec<PathBuf>> {
        let mut stmt = self.conn.prepare(
            "SELECT path FROM frame_files WHERE frame_id = ?1 AND classified = ?2 AND frame_type = 'light'",
        )?;

        let rows = stmt.query_map(
            rusqlite::params![frame_id.to_string(), classified as i32],
            |row| {
                let path_str: String = row.get(0)?;
                Ok(PathBuf::from(path_str))
            },
        )?;

        rows.collect()
    }

    pub fn insert_light_frame(&mut self, frame: &LightFrame) -> Result<()> {
        let tx = self.conn.transaction()?;

        tx.execute(
            "INSERT OR REPLACE INTO light_frames (
            id, date, target, location_id, gain, offset, camera_temp, notes, sub_length,
            camera_id, telescope_id, mount_id, flattener_id, filter_id,
            outside_temp, average_seeing, average_cloud_cover, average_moon
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![
            frame.id.to_string(),
            frame.date.to_rfc3339(),
            frame.target,
            frame.location_id.to_string(),
            frame.gain,
            frame.offset,
            frame.camera_temp,
            frame.notes,
            frame.sub_length,
            frame.camera_id.to_string(),
            frame.telescope_id.to_string(),
            frame.mount_id.to_string(),
            frame.flattener_id.map(|id| id.to_string()),
            frame.filter_id.map(|id| id.to_string()),
            frame.outside_temp,
            frame.average_seeing,
            frame.average_cloud_cover,
            frame.average_moon,
        ],
        )?;

        tx.execute(
            "DELETE FROM frame_files WHERE frame_id = ?",
            rusqlite::params![frame.id.to_string()],
        )?;

        let insert_file = |path: &PathBuf, classified: bool| -> Result<()> {
            let id = Uuid::new_v4();
            tx.execute(
                "INSERT OR REPLACE INTO frame_files (id, frame_id, path, classified, frame_type) VALUES (?, ?, ?, ?, ?)",
                rusqlite::params![
                id.to_string(),
                frame.id.to_string(),
                path.to_string_lossy(),
                classified as i32,
                "light"
            ],
            )?;
            Ok(())
        };

        for path in &frame.frames_to_classify {
            insert_file(path, false)?;
        }
        for path in &frame.frames_classified {
            insert_file(path, true)?;
        }

        tx.commit()?;
        Ok(())
    }

    pub fn remove_light_frame(&mut self, id: Uuid) -> Result<()> {
        let tx = self.conn.transaction()?;
        tx.execute(
            "DELETE FROM frame_files WHERE frame_id = ?1 AND frame_type = 'light'",
            rusqlite::params![id.to_string()],
        )?;
        tx.execute(
            "DELETE FROM light_frames WHERE id = ?1",
            rusqlite::params![id.to_string()],
        )?;
        tx.commit()?;
        Ok(())
    }

    pub fn get_light_frame_by_id(&self, id: Uuid) -> Result<Option<LightFrame>> {
        let mut stmt = self
            .conn
            .prepare("SELECT * FROM light_frames WHERE id = ?1")?;
        let mut rows = stmt.query(rusqlite::params![id.to_string()])?;

        if let Some(row) = rows.next()? {
            let frame = self.build_light_frame_from_row(row)?;
            Ok(Some(frame))
        } else {
            Ok(None)
        }
    }

    pub fn get_light_frames(&self) -> Result<HashMap<Uuid, LightFrame>> {
        let mut stmt = self.conn.prepare("SELECT * FROM light_frames")?;
        let rows = stmt.query_map([], |row| self.build_light_frame_from_row(row))?;

        let mut map = HashMap::new();
        for frame in rows {
            let frame = frame?;
            map.insert(frame.id, frame);
        }
        Ok(map)
    }

    pub fn insert_dark_frame(&mut self, frame: &DarkFrame) -> Result<()> {
        let tx = self.conn.transaction()?;

        tx.execute(
            "INSERT OR REPLACE INTO dark_frames (
            id, camera_id, total_subs, gain, in_imaging_session,
            camera_temp, sub_length
        ) VALUES (?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![
            frame.id.to_string(),
            frame.camera_id.to_string(),
            frame.total_subs,
            frame.gain,
            frame.in_imaging_session as i32,
            frame.camera_temp,
            frame.sub_length,
        ],
        )?;

        tx.execute(
            "DELETE FROM frame_files WHERE frame_id = ?",
            rusqlite::params![frame.id.to_string()],
        )?;

        let insert_file = |path: &PathBuf, classified: bool| -> Result<()> {
            let id = Uuid::new_v4();
            tx.execute(
                "INSERT OR REPLACE INTO frame_files (id, frame_id, path, classified, frame_type) VALUES (?, ?, ?, ?, ?)",
                rusqlite::params![
                id.to_string(),
                frame.id.to_string(),
                path.to_string_lossy(),
                classified as i32,
                "dark"
            ],
            )?;
            Ok(())
        };

        for path in &frame.frames_to_classify {
            insert_file(path, false)?;
        }
        for path in &frame.frames_classified {
            insert_file(path, true)?;
        }

        tx.commit()?;
        Ok(())
    }

    pub fn remove_dark_frame(&mut self, id: Uuid) -> Result<()> {
        let tx = self.conn.transaction()?;

        tx.execute(
            "DELETE FROM frame_files WHERE frame_id = ?1 AND frame_type = 'dark'",
            rusqlite::params![id.to_string()],
        )?;

        tx.execute(
            "DELETE FROM dark_frames WHERE id = ?1",
            rusqlite::params![id.to_string()],
        )?;

        tx.commit()?;
        Ok(())
    }

    pub fn get_dark_frame_by_id(&self, id: &Uuid) -> Result<Option<DarkFrame>> {
        let mut stmt = self.conn.prepare(
            "SELECT camera_id, total_subs, gain, in_imaging_session, camera_temp, sub_length FROM dark_frames WHERE id = ?1",
        )?;

        let mut rows = stmt.query([id.to_string()])?;
        if let Some(row) = rows.next()? {
            let frames_to_classify = self.get_frame_files_by_classification(&id, false)?;
            let frames_classified = self.get_frame_files_by_classification(&id, true)?;
            Ok(Some(DarkFrame {
                id: *id,
                camera_id: Uuid::parse_str(&row.get::<_, String>(0)?)
                    .unwrap_or_else(|_| Uuid::nil()),
                total_subs: row.get(1)?,
                gain: row.get(2)?,
                frames_to_classify,
                frames_classified,
                in_imaging_session: row.get(3)?,
                calibration_type: CalibrationType::DARK,
                camera_temp: row.get(4)?,
                sub_length: row.get(5)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_dark_frames(&self) -> Result<HashMap<Uuid, DarkFrame>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, camera_id, total_subs, gain, in_imaging_session, camera_temp, sub_length FROM dark_frames",
        )?;

        let frames_iter = stmt.query_map([], |row| {
            let id_str: String = row.get(0)?;
            let id = Uuid::parse_str(&id_str).unwrap();
            let frames_to_classify = self.get_frame_files_by_classification(&id, false)?;
            let frames_classified = self.get_frame_files_by_classification(&id, true)?;
            Ok((
                id,
                DarkFrame {
                    id,
                    camera_id: Uuid::parse_str(&row.get::<_, String>(0)?)
                        .unwrap_or_else(|_| Uuid::nil()),
                    total_subs: row.get(2)?,
                    gain: row.get(3)?,
                    frames_to_classify,
                    frames_classified,
                    in_imaging_session: row.get(4)?,
                    calibration_type: CalibrationType::DARK,
                    camera_temp: row.get(5)?,
                    sub_length: row.get(6)?,
                },
            ))
        })?;

        let mut map = HashMap::new();
        for result in frames_iter {
            let (id, frame) = result?;
            map.insert(id, frame);
        }

        Ok(map)
    }

    pub fn insert_flat_frame(&mut self, frame: &FlatFrame) -> Result<()> {
        let tx = self.conn.transaction()?;

        tx.execute(
            "INSERT OR REPLACE INTO flat_frames (
            id, camera_id, total_subs, gain
        ) VALUES (?, ?, ?, ?)",
            rusqlite::params![
            frame.id.to_string(),
            frame.camera_id.to_string(),
            frame.total_subs,
            frame.gain,
        ],
        )?;

        tx.execute(
            "DELETE FROM frame_files WHERE frame_id = ?",
            rusqlite::params![frame.id.to_string()],
        )?;

        let insert_file = |path: &PathBuf, classified: bool| -> Result<()> {
            let id = Uuid::new_v4();
            tx.execute(
                "INSERT OR REPLACE INTO frame_files (id, frame_id, path, classified, frame_type) VALUES (?, ?, ?, ?, ?)",
                rusqlite::params![
                id.to_string(),
                frame.id.to_string(),
                path.to_string_lossy(),
                classified as i32,
                "flat"
            ],
            )?;
            Ok(())
        };

        for path in &frame.frames_to_classify {
            insert_file(path, false)?;
        }
        for path in &frame.frames_classified {
            insert_file(path, true)?;
        }

        tx.commit()?;
        Ok(())
    }

    pub fn remove_flat_frame(&mut self, id: Uuid) -> Result<()> {
        let tx = self.conn.transaction()?;

        tx.execute(
            "DELETE FROM frame_files WHERE frame_id = ?1 AND frame_type = 'flat'",
            rusqlite::params![id.to_string()],
        )?;

        tx.execute(
            "DELETE FROM flat_frames WHERE id = ?1",
            rusqlite::params![id.to_string()],
        )?;

        tx.commit()?;
        Ok(())
    }

    pub fn get_flat_frame_by_id(&self, id: &Uuid) -> Result<Option<FlatFrame>> {
        let mut stmt = self
            .conn
            .prepare("SELECT camera_id, total_subs, gain FROM flat_frames WHERE id = ?1")?;

        let mut rows = stmt.query([id.to_string()])?;
        if let Some(row) = rows.next()? {
            let frames_to_classify = self.get_frame_files_by_classification(&id, false)?;
            let frames_classified = self.get_frame_files_by_classification(&id, true)?;
            Ok(Some(FlatFrame {
                id: *id,
                camera_id: Uuid::parse_str(&row.get::<_, String>(0)?)
                    .unwrap_or_else(|_| Uuid::nil()),
                total_subs: row.get(1)?,
                gain: row.get(2)?,
                frames_to_classify,
                frames_classified,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_flat_frames(&self) -> Result<HashMap<Uuid, FlatFrame>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, camera_id, total_subs, gain FROM flat_frames")?;

        let frames_iter = stmt.query_map([], |row| {
            let id_str: String = row.get(0)?;
            let id = Uuid::parse_str(&id_str).unwrap();
            let frames_to_classify = self.get_frame_files_by_classification(&id, false)?;
            let frames_classified = self.get_frame_files_by_classification(&id, true)?;
            Ok((
                id,
                FlatFrame {
                    id,
                    camera_id: Uuid::parse_str(&row.get::<_, String>(1)?)
                        .unwrap_or_else(|_| Uuid::nil()),
                    total_subs: row.get(2)?,
                    gain: row.get(3)?,
                    frames_to_classify,
                    frames_classified,
                },
            ))
        })?;

        let mut map = HashMap::new();
        for result in frames_iter {
            let (id, frame) = result?;
            map.insert(id, frame);
        }

        Ok(map)
    }

    pub fn insert_bias_frame(&mut self, frame: &BiasFrame) -> Result<()> {
        let tx = self.conn.transaction()?;

        tx.execute(
            "INSERT OR REPLACE INTO bias_frames (
            id, camera_id, total_subs, gain
        ) VALUES (?, ?, ?, ?)",
            rusqlite::params![
            frame.id.to_string(),
            frame.camera_id.to_string(),
            frame.total_subs,
            frame.gain,
        ],
        )?;

        tx.execute(
            "DELETE FROM frame_files WHERE frame_id = ?",
            rusqlite::params![frame.id.to_string()],
        )?;

        let insert_file = |path: &PathBuf, classified: bool| -> Result<()> {
            let id = Uuid::new_v4();
            tx.execute(
                "INSERT OR REPLACE INTO frame_files (id, frame_id, path, classified, frame_type) VALUES (?, ?, ?, ?, ?)",
                rusqlite::params![
                id.to_string(),
                frame.id.to_string(),
                path.to_string_lossy(),
                classified as i32,
                "bias"
            ],
            )?;
            Ok(())
        };

        for path in &frame.frames_to_classify {
            insert_file(path, false)?;
        }
        for path in &frame.frames_classified {
            insert_file(path, true)?;
        }

        tx.commit()?;
        Ok(())
    }

    pub fn remove_bias_frame(&mut self, id: Uuid) -> Result<()> {
        let tx = self.conn.transaction()?;

        tx.execute(
            "DELETE FROM frame_files WHERE frame_id = ?1 AND frame_type = 'bias'",
            rusqlite::params![id.to_string()],
        )?;

        tx.execute(
            "DELETE FROM bias_frames WHERE id = ?1",
            rusqlite::params![id.to_string()],
        )?;

        tx.commit()?;
        Ok(())
    }

    pub fn get_bias_frame_by_id(&self, id: &Uuid) -> Result<Option<BiasFrame>> {
        let mut stmt = self
            .conn
            .prepare("SELECT camera_id, total_subs, gain FROM bias_frames WHERE id = ?1")?;

        let mut rows = stmt.query([id.to_string()])?;
        if let Some(row) = rows.next()? {
            let frames_to_classify = self.get_frame_files_by_classification(&id, false)?;
            let frames_classified = self.get_frame_files_by_classification(&id, true)?;
            Ok(Some(BiasFrame {
                id: *id,
                camera_id: Uuid::parse_str(&row.get::<_, String>(0)?)
                    .unwrap_or_else(|_| Uuid::nil()),
                total_subs: row.get(1)?,
                gain: row.get(2)?,
                frames_to_classify,
                frames_classified,
                calibration_type: CalibrationType::BIAS,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_bias_frames(&self) -> Result<HashMap<Uuid, BiasFrame>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, camera_id, total_subs, gain FROM bias_frames")?;

        let frames_iter = stmt.query_map([], |row| {
            let id_str: String = row.get(0)?;
            let id = Uuid::parse_str(&id_str).unwrap();
            let frames_to_classify = self.get_frame_files_by_classification(&id, false)?;
            let frames_classified = self.get_frame_files_by_classification(&id, true)?;
            Ok((
                id,
                BiasFrame {
                    id,
                    camera_id: Uuid::parse_str(&row.get::<_, String>(0)?)
                        .unwrap_or_else(|_| Uuid::nil()),
                    total_subs: row.get(2)?,
                    gain: row.get(3)?,
                    frames_to_classify,
                    frames_classified,
                    calibration_type: CalibrationType::BIAS,
                },
            ))
        })?;

        let mut map = HashMap::new();
        for result in frames_iter {
            let (id, frame) = result?;
            map.insert(id, frame);
        }

        Ok(map)
    }
}

fn imaging_session_from_row(row: &Row) -> Result<ImagingSession> {
    Ok(ImagingSession {
        id: Uuid::parse_str(&row.get::<_, String>(0)?).unwrap_or_else(|_| Uuid::nil()),
        folder_dir: PathBuf::from(row.get::<_, String>(1)?),
        light_frame_id: Uuid::parse_str(&row.get::<_, String>(2)?).unwrap_or_else(|_| Uuid::nil()),
        flat_frame_id: row
            .get::<_, Option<String>>(3)?
            .as_deref()
            .and_then(|s| Uuid::parse_str(s).ok()),
        dark_frame_id: row
            .get::<_, Option<String>>(4)?
            .as_deref()
            .and_then(|s| Uuid::parse_str(s).ok()),
        bias_frame_id: row
            .get::<_, Option<String>>(5)?
            .as_deref()
            .and_then(|s| Uuid::parse_str(s).ok()),
    })
}
