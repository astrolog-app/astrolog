use std::collections::HashMap;
use std::path::PathBuf;
use rusqlite::{Connection, Result, params};
use uuid::Uuid;
use crate::models::equipment::Camera;

pub struct Database {
    pub conn: Connection,
}

impl Database {
    pub fn new(root_directory: &PathBuf) -> Result<Self> {
        let db_path = root_directory.join(".astrolog").join("astrolog.db");
        let conn = Connection::open(db_path)?;
        conn.pragma_update(None, "journal_mode", "WAL")?;
        Ok(Self { conn })
    }

    pub fn init_schema(&self) -> Result<()> {
        self.conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS telescopes (
                id TEXT PRIMARY KEY,
                brand TEXT,
                name TEXT,
                focal_length INTEGER,
                aperture INTEGER
            );

            CREATE TABLE IF NOT EXISTS cameras (
                id TEXT PRIMARY KEY,
                brand TEXT,
                name TEXT,
                chip_size TEXT,
                mega_pixel REAL,
                rgb INTEGER
            );

            CREATE TABLE IF NOT EXISTS mounts (
                id TEXT PRIMARY KEY,
                brand TEXT,
                name TEXT
            );

            CREATE TABLE IF NOT EXISTS filters (
                id TEXT PRIMARY KEY,
                brand TEXT,
                name TEXT,
                filter_type TEXT
            );

            CREATE TABLE IF NOT EXISTS flatteners (
                id TEXT PRIMARY KEY,
                brand TEXT,
                name TEXT,
                factor REAL
            );
            "
        )
    }

    pub fn insert_camera(&self, camera: &Camera) -> Result<()> {
        self.conn.execute(
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
        Ok(())
    }

    pub fn remove_camera(&self, id: Uuid) -> Result<()> {
        self.conn.execute(
            "DELETE FROM cameras WHERE id = ?1",
            params![id.to_string()],
        )?;
        Ok(())
    }

    pub fn get_camera_by_id(&self, id: Uuid) -> Result<Option<Camera>> {
        let mut stmt = self.conn.prepare(
            "SELECT brand, name, chip_size, mega_pixel, rgb FROM cameras WHERE id = ?1"
        )?;

        let mut rows = stmt.query(params![id.to_string()])?;

        if let Some(row) = rows.next()? {
            Ok(Some(Camera {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                notes: HashMap::new(), // TODO
                chip_size: row.get(2)?,
                mega_pixel: row.get(3)?,
                rgb: row.get(4)?,
            }))
        } else {
            Ok(None)
        }
    }
}
