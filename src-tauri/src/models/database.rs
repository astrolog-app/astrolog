use crate::models::equipment::{Camera, EquipmentNote, Filter, Flattener, Mount, Telescope};
use chrono::{DateTime, Utc};
use rusqlite::{params, Connection, Result};
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
                brand TEXT,
                name TEXT,
                focal_length INTEGER,
                aperture INTEGER
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS cameras (
                id TEXT PRIMARY KEY,
                brand TEXT,
                name TEXT,
                chip_size TEXT,
                mega_pixel REAL,
                rgb INTEGER
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS mounts (
                id TEXT PRIMARY KEY,
                brand TEXT,
                name TEXT
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS filters (
                id TEXT PRIMARY KEY,
                brand TEXT,
                name TEXT,
                filter_type TEXT
            );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS flatteners (
                id TEXT PRIMARY KEY,
                brand TEXT,
                name TEXT,
                factor REAL
            );",
            ),
        ]);

        migrations
            .to_latest(&mut conn)
            .map_err(|e| rusqlite::Error::ExecuteReturnedResults)?;
        Ok(Self { conn })
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
            "INSERT OR REPLACE INTO cameras (id, brand, name, chip_size, mega_pixel, rgb) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                camera.id.to_string(),
                camera.brand,
                camera.name,
                camera.chip_size,
                camera.mega_pixel,
                camera.rgb as i32
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
        self.conn
            .execute("DELETE FROM cameras WHERE id = ?1", params![id.to_string()])?;
        self.conn.execute(
            "DELETE FROM equipment_notes WHERE equipment_id = ?1",
            params![id.to_string()],
        )?;
        Ok(())
    }

    pub fn get_camera_by_id(&self, id: Uuid) -> Result<Option<Camera>> {
        let mut stmt = self
            .conn
            .prepare("SELECT brand, name, chip_size, mega_pixel, rgb FROM cameras WHERE id = ?1")?;
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
                rgb: row.get::<_, i32>(4)? != 0,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_cameras(&self) -> Result<HashMap<Uuid, Camera>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, brand, name, chip_size, mega_pixel, rgb FROM cameras")?;
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
                    rgb: row.get::<_, i32>(5)? != 0,
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
        self.conn.execute(
            "DELETE FROM telescopes WHERE id = ?1",
            params![id.to_string()],
        )?;
        Ok(())
    }

    pub fn get_telescope_by_id(&self, id: Uuid) -> Result<Option<Telescope>> {
        let mut stmt = self
            .conn
            .prepare("SELECT brand, name, focal_length, aperture FROM telescopes WHERE id = ?1")?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Telescope {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                notes: HashMap::new(),
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
            result.insert(
                id,
                Telescope {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    notes: HashMap::new(),
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
        self.conn
            .execute("DELETE FROM mounts WHERE id = ?1", params![id.to_string()])?;
        Ok(())
    }

    pub fn get_mount_by_id(&self, id: Uuid) -> Result<Option<Mount>> {
        let mut stmt = self
            .conn
            .prepare("SELECT brand, name FROM mounts WHERE id = ?1")?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Mount {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                notes: HashMap::new(),
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
            result.insert(
                id,
                Mount {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    notes: HashMap::new(),
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
        self.conn
            .execute("DELETE FROM filters WHERE id = ?1", params![id.to_string()])?;
        Ok(())
    }

    pub fn get_filter_by_id(&self, id: Uuid) -> Result<Option<Filter>> {
        let mut stmt = self
            .conn
            .prepare("SELECT brand, name, filter_type FROM filters WHERE id = ?1")?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Filter {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                notes: HashMap::new(),
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
            result.insert(
                id,
                Filter {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    notes: HashMap::new(),
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
        self.conn.execute(
            "DELETE FROM flatteners WHERE id = ?1",
            params![id.to_string()],
        )?;
        Ok(())
    }

    pub fn get_flattener_by_id(&self, id: Uuid) -> Result<Option<Flattener>> {
        let mut stmt = self
            .conn
            .prepare("SELECT brand, name, factor FROM flatteners WHERE id = ?1")?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Flattener {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                notes: HashMap::new(),
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
            result.insert(
                id,
                Flattener {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    notes: HashMap::new(),
                    factor: row.get(3)?,
                },
            );
        }
        Ok(result)
    }
}
