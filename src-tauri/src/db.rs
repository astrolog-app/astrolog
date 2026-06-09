use crate::models::equipment::{Camera, EquipmentList, Filter, Flattener, Mount, Telescope};
use rusqlite::{params, Connection, Result};
use rusqlite_migration::{Migrations, M};
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
use uuid::Uuid;

pub struct Database {
    pub conn: Connection,
}

impl Database {
    pub fn new(root_directory: &PathBuf) -> std::result::Result<Self, Box<dyn Error>> {
        let db_path = root_directory.join(".astrolog").join("astrolog.db");
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let mut conn = Connection::open(db_path)?;

        let migrations = Migrations::new(vec![
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
                    pixel_size REAL NOT NULL,
                    pixel_x INTEGER NOT NULL,
                    pixel_y INTEGER NOT NULL,
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
        ]);

        migrations.to_latest(&mut conn)?;
        Ok(Self { conn })
    }

    // ------------ equipment ------------
    pub fn get_equipment_list(&self) -> Result<EquipmentList> {
        Ok(EquipmentList {
            telescopes: self.get_telescopes()?,
            cameras: self.get_cameras()?,
            mounts: self.get_mounts()?,
            filters: self.get_filters()?,
            flatteners: self.get_flatteners()?,
        })
    }

    pub fn insert_camera(&self, camera: &Camera) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO cameras (id, brand, name, pixel_size, pixel_x, pixel_y, is_monochrome, is_dslr)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                camera.id.to_string(),
                camera.brand,
                camera.name,
                camera.pixel_size,
                camera.pixel_x,
                camera.pixel_y,
                camera.is_monochrome as i32,
                camera.is_dslr as i32
            ],
        )?;
        Ok(())
    }

    pub fn remove_camera(&self, id: Uuid) -> Result<()> {
        self.conn
            .execute("DELETE FROM cameras WHERE id = ?1", params![id.to_string()])?;
        Ok(())
    }

    pub fn get_camera_by_id(&self, id: Uuid) -> Result<Option<Camera>> {
        let mut stmt = self.conn.prepare(
            "SELECT brand, name, pixel_size, pixel_x, pixel_y, is_monochrome, is_dslr FROM cameras WHERE id = ?1",
        )?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Camera {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                pixel_size: row.get(2)?,
                pixel_x: row.get(3)?,
                pixel_y: row.get(4)?,
                is_monochrome: row.get::<_, i32>(5)? != 0,
                is_dslr: row.get::<_, i32>(6)? != 0,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_cameras(&self) -> Result<HashMap<Uuid, Camera>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, brand, name, pixel_size, pixel_x, pixel_y, is_monochrome, is_dslr FROM cameras",
        )?;
        let mut rows = stmt.query([])?;
        let mut result = HashMap::new();
        while let Some(row) = rows.next()? {
            let id_str: String = row.get(0)?;
            let id = Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil());
            result.insert(
                id,
                Camera {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    pixel_size: row.get(3)?,
                    pixel_x: row.get(4)?,
                    pixel_y: row.get(5)?,
                    is_monochrome: row.get::<_, i32>(6)? != 0,
                    is_dslr: row.get::<_, i32>(7)? != 0,
                },
            );
        }
        Ok(result)
    }

    pub fn insert_telescope(&self, telescope: &Telescope) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO telescopes (id, brand, name, focal_length, aperture) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                telescope.id.to_string(),
                telescope.brand,
                telescope.name,
                telescope.focal_length,
                telescope.aperture,
            ],
        )?;
        Ok(())
    }

    pub fn remove_telescope(&self, id: Uuid) -> Result<()> {
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
                    focal_length: row.get(3)?,
                    aperture: row.get(4)?,
                },
            );
        }
        Ok(result)
    }

    pub fn insert_mount(&self, mount: &Mount) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO mounts (id, brand, name) VALUES (?1, ?2, ?3)",
            params![mount.id.to_string(), mount.brand, mount.name],
        )?;
        Ok(())
    }

    pub fn remove_mount(&self, id: Uuid) -> Result<()> {
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
                },
            );
        }
        Ok(result)
    }

    pub fn insert_filter(&self, filter: &Filter) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO filters (id, brand, name, filter_type) VALUES (?1, ?2, ?3, ?4)",
            params![
                filter.id.to_string(),
                filter.brand,
                filter.name,
                filter.filter_type,
            ],
        )?;
        Ok(())
    }

    pub fn remove_filter(&self, id: Uuid) -> Result<()> {
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
                    filter_type: row.get(3)?,
                },
            );
        }
        Ok(result)
    }

    pub fn insert_flattener(&self, flattener: &Flattener) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO flatteners (id, brand, name, factor) VALUES (?1, ?2, ?3, ?4)",
            params![
                flattener.id.to_string(),
                flattener.brand,
                flattener.name,
                flattener.factor,
            ],
        )?;
        Ok(())
    }

    pub fn remove_flattener(&self, id: Uuid) -> Result<()> {
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
                    factor: row.get(3)?,
                },
            );
        }
        Ok(result)
    }
}
