use super::{parse_uuid, Database};
use crate::models::equipment::{Camera, EquipmentList, Filter, Flattener, Mount, Telescope};
use rusqlite::{params, Result};
use std::collections::HashMap;
use uuid::Uuid;

impl Database {
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
            "INSERT INTO cameras (id, brand, name, pixel_size, pixel_x, pixel_y, sensor_type)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
             ON CONFLICT(id) DO UPDATE SET
                 brand = excluded.brand,
                 name = excluded.name,
                 pixel_size = excluded.pixel_size,
                 pixel_x = excluded.pixel_x,
                 pixel_y = excluded.pixel_y,
                 sensor_type = excluded.sensor_type",
            params![
                camera.id.to_string(),
                camera.brand,
                camera.name,
                camera.pixel_size,
                camera.pixel_x,
                camera.pixel_y,
                camera.sensor_type
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
            "SELECT brand, name, pixel_size, pixel_x, pixel_y, sensor_type FROM cameras WHERE id = ?1",
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
                sensor_type: row.get(5)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_cameras(&self) -> Result<HashMap<Uuid, Camera>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, brand, name, pixel_size, pixel_x, pixel_y, sensor_type FROM cameras",
        )?;
        let mut rows = stmt.query([])?;
        let mut result = HashMap::new();
        while let Some(row) = rows.next()? {
            let id_str: String = row.get(0)?;
            let id = parse_uuid(&id_str)?;
            result.insert(
                id,
                Camera {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    pixel_size: row.get(3)?,
                    pixel_x: row.get(4)?,
                    pixel_y: row.get(5)?,
                    sensor_type: row.get(6)?,
                },
            );
        }
        Ok(result)
    }

    pub fn insert_telescope(&self, telescope: &Telescope) -> Result<()> {
        self.conn.execute(
            "INSERT INTO telescopes (id, brand, name, telescope_type, focal_length, aperture)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)
             ON CONFLICT(id) DO UPDATE SET
                 brand = excluded.brand,
                 name = excluded.name,
                 telescope_type = excluded.telescope_type,
                 focal_length = excluded.focal_length,
                 aperture = excluded.aperture",
            params![
                telescope.id.to_string(),
                telescope.brand,
                telescope.name,
                telescope.telescope_type,
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
            .prepare("SELECT brand, name, telescope_type, focal_length, aperture FROM telescopes WHERE id = ?1")?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Telescope {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                telescope_type: row.get(2)?,
                focal_length: row.get(3)?,
                aperture: row.get(4)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_telescopes(&self) -> Result<HashMap<Uuid, Telescope>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, brand, name, telescope_type, focal_length, aperture FROM telescopes",
        )?;
        let mut rows = stmt.query([])?;
        let mut result = HashMap::new();
        while let Some(row) = rows.next()? {
            let id_str: String = row.get(0)?;
            let id = parse_uuid(&id_str)?;
            result.insert(
                id,
                Telescope {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    telescope_type: row.get(3)?,
                    focal_length: row.get(4)?,
                    aperture: row.get(5)?,
                },
            );
        }
        Ok(result)
    }

    pub fn insert_mount(&self, mount: &Mount) -> Result<()> {
        self.conn.execute(
            "INSERT INTO mounts (id, brand, name) VALUES (?1, ?2, ?3)
             ON CONFLICT(id) DO UPDATE SET
                 brand = excluded.brand,
                 name = excluded.name",
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
            let id = parse_uuid(&id_str)?;
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
            "INSERT INTO filters (id, brand, name, filter_type, size) VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(id) DO UPDATE SET
                 brand = excluded.brand,
                 name = excluded.name,
                 filter_type = excluded.filter_type,
                 size = excluded.size",
            params![
                filter.id.to_string(),
                filter.brand,
                filter.name,
                filter.filter_type,
                filter.size,
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
            .prepare("SELECT brand, name, filter_type, size FROM filters WHERE id = ?1")?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Filter {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                filter_type: row.get(2)?,
                size: row.get(3)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_filters(&self) -> Result<HashMap<Uuid, Filter>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, brand, name, filter_type, size FROM filters")?;
        let mut rows = stmt.query([])?;
        let mut result = HashMap::new();
        while let Some(row) = rows.next()? {
            let id_str: String = row.get(0)?;
            let id = parse_uuid(&id_str)?;
            result.insert(
                id,
                Filter {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    filter_type: row.get(3)?,
                    size: row.get(4)?,
                },
            );
        }
        Ok(result)
    }

    pub fn insert_flattener(&self, flattener: &Flattener) -> Result<()> {
        self.conn.execute(
            "INSERT INTO flatteners (id, brand, name, flattener_type, factor) VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(id) DO UPDATE SET
                 brand = excluded.brand,
                 name = excluded.name,
                 flattener_type = excluded.flattener_type,
                 factor = excluded.factor",
            params![
                flattener.id.to_string(),
                flattener.brand,
                flattener.name,
                flattener.flattener_type,
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
            .prepare("SELECT brand, name, flattener_type, factor FROM flatteners WHERE id = ?1")?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Flattener {
                id,
                brand: row.get(0)?,
                name: row.get(1)?,
                flattener_type: row.get(2)?,
                factor: row.get(3)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_flatteners(&self) -> Result<HashMap<Uuid, Flattener>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, brand, name, flattener_type, factor FROM flatteners")?;
        let mut rows = stmt.query([])?;
        let mut result = HashMap::new();
        while let Some(row) = rows.next()? {
            let id_str: String = row.get(0)?;
            let id = parse_uuid(&id_str)?;
            result.insert(
                id,
                Flattener {
                    id,
                    brand: row.get(1)?,
                    name: row.get(2)?,
                    flattener_type: row.get(3)?,
                    factor: row.get(4)?,
                },
            );
        }
        Ok(result)
    }
}
