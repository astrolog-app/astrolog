use crate::models::equipment::{Camera, EquipmentList, Filter, Flattener, Mount, Telescope};
use crate::models::imaging_frames::bias_frame::{
    BiasFrame, BiasFramePage, BiasFrameQuery, BiasFrameRow, BiasFrameSortKey,
};
use crate::models::imaging_frames::dark_flat_frame::{
    DarkFlatFrame, DarkFlatFramePage, DarkFlatFrameQuery, DarkFlatFrameRow, DarkFlatFrameSortKey,
};
use crate::models::imaging_frames::dark_frame::{
    DarkFrame, DarkFramePage, DarkFrameQuery, DarkFrameRow, DarkFrameSortKey,
};
use crate::models::imaging_frames::flat_frame::{
    FlatFrame, FlatFramePage, FlatFrameQuery, FlatFrameRow, FlatFrameSortKey,
};
use crate::models::imaging_frames::light_frame::{
    LightFrame, LightFramePage, LightFrameQuery, LightFrameRow, LightFrameSortKey,
};
use crate::models::imaging_frames::SortDir;
use regex::Regex;
use rusqlite::functions::FunctionFlags;
use rusqlite::{params, Connection, Result};
use rusqlite_migration::{Migrations, M};
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
use std::sync::Arc;
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
        Self::init(Connection::open(db_path)?)
    }

    // throwaway db used before first-run setup has produced a real root directory;
    // guaranteed fresh on every start and leaves no trace on disk
    pub fn new_in_memory() -> std::result::Result<Self, Box<dyn Error>> {
        Self::init(Connection::open_in_memory()?)
    }

    fn init(mut conn: Connection) -> std::result::Result<Self, Box<dyn Error>> {
        // register REGEXP so SQL queries can filter with `col REGEXP pattern`
        add_regexp_function(&conn)?;

        let migrations = Migrations::new(vec![
            M::up(
                "CREATE TABLE IF NOT EXISTS telescopes (
                    id TEXT PRIMARY KEY,
                    brand TEXT NOT NULL,
                    name TEXT NOT NULL,
                    telescope_type TEXT NOT NULL,
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
                    sensor_type TEXT NOT NULL
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
                    filter_type TEXT NOT NULL,
                    size TEXT NOT NULL
                );",
            ),
            M::up(
                "CREATE TABLE IF NOT EXISTS flatteners (
                    id TEXT PRIMARY KEY,
                    brand TEXT NOT NULL,
                    name TEXT NOT NULL,
                    flattener_type TEXT NOT NULL,
                    factor REAL NOT NULL
                );",
            ),
            M::up(
                // one row per physical bias frame; hash is UNIQUE for dedup
                // (nullable until hashing lands, and sqlite allows many NULLs)
                "CREATE TABLE IF NOT EXISTS bias_frames (
                    id TEXT PRIMARY KEY,
                    hash TEXT UNIQUE,
                    rel_path TEXT NOT NULL,
                    file_size_bytes INTEGER NOT NULL,
                    creation_day TEXT NOT NULL,
                    captured_at TEXT,
                    imported_at TEXT NOT NULL,
                    updated_at TEXT,
                    binning INTEGER NOT NULL,
                    gain INTEGER NOT NULL,
                    \"offset\" INTEGER,
                    sensor_set_temp REAL,
                    sensor_temp REAL,
                    camera_id TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_bias_frames_camera_day
                    ON bias_frames(camera_id, creation_day);",
            ),
            M::up(
                // darks mirror bias plus exposure; a dark is matchable either by
                // session (dslr) or by temperature (cooled) — hence the CHECK
                "CREATE TABLE IF NOT EXISTS dark_frames (
                    id TEXT PRIMARY KEY,
                    session_id TEXT,
                    hash TEXT UNIQUE,
                    rel_path TEXT NOT NULL,
                    file_size_bytes INTEGER NOT NULL,
                    creation_day TEXT NOT NULL,
                    captured_at TEXT,
                    imported_at TEXT NOT NULL,
                    updated_at TEXT,
                    binning INTEGER NOT NULL,
                    gain INTEGER NOT NULL,
                    \"offset\" INTEGER,
                    sensor_set_temp REAL,
                    sensor_temp REAL,
                    camera_id TEXT NOT NULL,
                    exposure_ms INTEGER NOT NULL,
                    CHECK (session_id IS NOT NULL OR sensor_temp IS NOT NULL)
                );
                CREATE INDEX IF NOT EXISTS idx_dark_frames_camera_day
                    ON dark_frames(camera_id, creation_day);",
            ),
            M::up(
                // dark flats mirror bias plus exposure (matched to the flats)
                "CREATE TABLE IF NOT EXISTS dark_flat_frames (
                    id TEXT PRIMARY KEY,
                    hash TEXT UNIQUE,
                    rel_path TEXT NOT NULL,
                    file_size_bytes INTEGER NOT NULL,
                    creation_day TEXT NOT NULL,
                    captured_at TEXT,
                    imported_at TEXT NOT NULL,
                    updated_at TEXT,
                    binning INTEGER NOT NULL,
                    gain INTEGER NOT NULL,
                    \"offset\" INTEGER,
                    sensor_set_temp REAL,
                    sensor_temp REAL,
                    camera_id TEXT NOT NULL,
                    exposure_ms INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_dark_flat_frames_camera_day
                    ON dark_flat_frames(camera_id, creation_day);",
            ),
            M::up(
                // flats add the optical train (telescope + filter + flattener),
                // exposure and the session they calibrate
                "CREATE TABLE IF NOT EXISTS flat_frames (
                    id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    hash TEXT UNIQUE,
                    rel_path TEXT NOT NULL,
                    file_size_bytes INTEGER NOT NULL,
                    creation_day TEXT NOT NULL,
                    captured_at TEXT,
                    imported_at TEXT NOT NULL,
                    updated_at TEXT,
                    binning INTEGER NOT NULL,
                    gain INTEGER NOT NULL,
                    \"offset\" INTEGER,
                    sensor_set_temp REAL,
                    sensor_temp REAL,
                    camera_id TEXT NOT NULL,
                    telescope_id TEXT NOT NULL,
                    filter_id TEXT,
                    flattener_id TEXT,
                    exposure_ms INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_flat_frames_camera_day
                    ON flat_frames(camera_id, creation_day);",
            ),
            M::up(
                // lights add a target, the optical train (telescope + mount +
                // filter + flattener), exposure, sensor temp and the session
                "CREATE TABLE IF NOT EXISTS light_frames (
                    id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    hash TEXT UNIQUE,
                    rel_path TEXT NOT NULL,
                    file_size_bytes INTEGER NOT NULL,
                    creation_day TEXT NOT NULL,
                    captured_at TEXT,
                    imported_at TEXT NOT NULL,
                    updated_at TEXT,
                    binning INTEGER NOT NULL,
                    gain INTEGER NOT NULL,
                    \"offset\" INTEGER,
                    sensor_set_temp REAL,
                    sensor_temp REAL,
                    camera_id TEXT NOT NULL,
                    telescope_id TEXT NOT NULL,
                    mount_id TEXT NOT NULL,
                    filter_id TEXT,
                    flattener_id TEXT,
                    exposure_ms INTEGER NOT NULL,
                    target TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_light_frames_camera_day
                    ON light_frames(camera_id, creation_day);",
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
            "INSERT OR REPLACE INTO cameras (id, brand, name, pixel_size, pixel_x, pixel_y, sensor_type)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
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
                    sensor_type: row.get(6)?,
                },
            );
        }
        Ok(result)
    }

    pub fn insert_telescope(&self, telescope: &Telescope) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO telescopes (id, brand, name, telescope_type, focal_length, aperture) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
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
            let id = Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil());
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
            "INSERT OR REPLACE INTO filters (id, brand, name, filter_type, size) VALUES (?1, ?2, ?3, ?4, ?5)",
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
            let id = Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil());
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
            "INSERT OR REPLACE INTO flatteners (id, brand, name, flattener_type, factor) VALUES (?1, ?2, ?3, ?4, ?5)",
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
            let id = Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil());
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

    // ------------ bias frames ------------

    pub fn insert_bias_frame(&self, frame: &BiasFrame) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO bias_frames
                (id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
            params![
                frame.id.to_string(),
                frame.hash,
                frame.rel_path,
                frame.file_size_bytes,
                frame.creation_day,
                frame.captured_at,
                frame.imported_at,
                frame.updated_at,
                frame.binning,
                frame.gain,
                frame.offset,
                frame.sensor_set_temp,
                frame.sensor_temp,
                frame.camera_id.to_string(),
            ],
        )?;
        Ok(())
    }

    pub fn remove_bias_frame(&self, id: Uuid) -> Result<()> {
        self.conn.execute(
            "DELETE FROM bias_frames WHERE id = ?1",
            params![id.to_string()],
        )?;
        Ok(())
    }

    pub fn get_bias_frame_by_id(&self, id: Uuid) -> Result<Option<BiasFrame>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id
             FROM bias_frames WHERE id = ?1",
        )?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(map_bias_frame(row)?))
        } else {
            Ok(None)
        }
    }

    // grouped table view: one row per (camera + settings + night), with regex
    // search, whitelisted sort and pagination over the GROUPS
    pub fn get_bias_frames(&self, query: &BiasFrameQuery) -> Result<BiasFramePage> {
        // whitelist the sort column (alias names from the SELECT below)
        let sort_col = match query.sort_by {
            BiasFrameSortKey::Night => "night",
            BiasFrameSortKey::TotalFrames => "total_frames",
            BiasFrameSortKey::Gain => "gain",
            BiasFrameSortKey::Binning => "binning",
            BiasFrameSortKey::FirstCaptured => "first_captured",
            BiasFrameSortKey::LastCaptured => "last_captured",
        };
        let sort_dir = match query.sort_dir {
            SortDir::Asc => "ASC",
            SortDir::Desc => "DESC",
        };

        // optional regex over the row's visible columns; WHERE runs before the
        // SELECT aliases exist, so the night expression is repeated here
        let search = query
            .search
            .as_ref()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty());

        let where_clause = if search.is_some() {
            "WHERE creation_day REGEXP :search \
               OR CAST(gain AS TEXT) REGEXP :search \
               OR CAST(binning AS TEXT) REGEXP :search \
               OR CAST(IFNULL(\"offset\", '') AS TEXT) REGEXP :search"
        } else {
            ""
        };

        // total number of groups, for pagination
        let count_sql = format!(
            "SELECT COUNT(*) FROM (\
                SELECT 1 FROM bias_frames {where_clause} \
                GROUP BY camera_id, gain, binning, \"offset\", creation_day\
             )"
        );
        let total: u32 = {
            let mut stmt = self.conn.prepare(&count_sql)?;
            let n: i64 = if let Some(s) = search {
                stmt.query_row(rusqlite::named_params! { ":search": s }, |row| row.get(0))?
            } else {
                stmt.query_row([], |row| row.get(0))?
            };
            n as u32
        };

        let rows_sql = format!(
            "SELECT camera_id, gain, binning, \"offset\", \
                    creation_day AS night, \
                    COUNT(*) AS total_frames, \
                    MIN(captured_at) AS first_captured, \
                    MAX(captured_at) AS last_captured \
             FROM bias_frames {where_clause} \
             GROUP BY camera_id, gain, binning, \"offset\", creation_day \
             ORDER BY {sort_col} {sort_dir} \
             LIMIT :limit OFFSET :offset"
        );

        let limit = query.limit as i64;
        let offset = query.offset as i64;

        let mut stmt = self.conn.prepare(&rows_sql)?;
        let rows: Vec<BiasFrameRow> = if let Some(s) = search {
            stmt.query_map(
                rusqlite::named_params! { ":search": s, ":limit": limit, ":offset": offset },
                map_bias_frame_row,
            )?
            .collect::<Result<Vec<_>>>()?
        } else {
            stmt.query_map(
                rusqlite::named_params! { ":limit": limit, ":offset": offset },
                map_bias_frame_row,
            )?
            .collect::<Result<Vec<_>>>()?
        };

        Ok(BiasFramePage { rows, total })
    }

    // drill-down: the individual frames behind one grouped row
    pub fn get_bias_frames_in_group(
        &self,
        camera_id: Uuid,
        gain: u32,
        binning: u32,
        offset: Option<u32>,
        night: &str,
    ) -> Result<Vec<BiasFrame>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id
             FROM bias_frames
             WHERE camera_id = ?1 AND gain = ?2 AND binning = ?3
               AND \"offset\" IS ?4
               AND creation_day = ?5
             ORDER BY captured_at ASC",
        )?;
        let rows = stmt
            .query_map(
                params![camera_id.to_string(), gain, binning, offset, night],
                map_bias_frame,
            )?
            .collect::<Result<Vec<_>>>()?;
        Ok(rows)
    }

    // ------------ dark frames ------------

    pub fn insert_dark_frame(&self, frame: &DarkFrame) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO dark_frames
                (id, session_id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, exposure_ms)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
            params![
                frame.id.to_string(),
                frame.session_id.map(|u| u.to_string()),
                frame.hash,
                frame.rel_path,
                frame.file_size_bytes,
                frame.creation_day,
                frame.captured_at,
                frame.imported_at,
                frame.updated_at,
                frame.binning,
                frame.gain,
                frame.offset,
                frame.sensor_set_temp,
                frame.sensor_temp,
                frame.camera_id.to_string(),
                frame.exposure_ms,
            ],
        )?;
        Ok(())
    }

    pub fn remove_dark_frame(&self, id: Uuid) -> Result<()> {
        self.conn.execute(
            "DELETE FROM dark_frames WHERE id = ?1",
            params![id.to_string()],
        )?;
        Ok(())
    }

    pub fn get_dark_frame_by_id(&self, id: Uuid) -> Result<Option<DarkFrame>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, session_id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, exposure_ms
             FROM dark_frames WHERE id = ?1",
        )?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(map_dark_frame(row)?))
        } else {
            Ok(None)
        }
    }

    // grouped table view: one row per (camera + settings + exposure + temp + night)
    pub fn get_dark_frames(&self, query: &DarkFrameQuery) -> Result<DarkFramePage> {
        let sort_col = match query.sort_by {
            DarkFrameSortKey::Night => "night",
            DarkFrameSortKey::TotalFrames => "total_frames",
            DarkFrameSortKey::Gain => "gain",
            DarkFrameSortKey::Binning => "binning",
            DarkFrameSortKey::Exposure => "exposure_ms",
            DarkFrameSortKey::FirstCaptured => "first_captured",
            DarkFrameSortKey::LastCaptured => "last_captured",
        };
        let sort_dir = match query.sort_dir {
            SortDir::Asc => "ASC",
            SortDir::Desc => "DESC",
        };

        let search = query
            .search
            .as_ref()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty());

        let where_clause = if search.is_some() {
            "WHERE creation_day REGEXP :search \
               OR CAST(gain AS TEXT) REGEXP :search \
               OR CAST(binning AS TEXT) REGEXP :search \
               OR CAST(IFNULL(\"offset\", '') AS TEXT) REGEXP :search \
               OR CAST(exposure_ms AS TEXT) REGEXP :search \
               OR CAST(IFNULL(sensor_temp, '') AS TEXT) REGEXP :search"
        } else {
            ""
        };

        let count_sql = format!(
            "SELECT COUNT(*) FROM (\
                SELECT 1 FROM dark_frames {where_clause} \
                GROUP BY camera_id, gain, binning, \"offset\", exposure_ms, sensor_temp, creation_day\
             )"
        );
        let total: u32 = {
            let mut stmt = self.conn.prepare(&count_sql)?;
            let n: i64 = if let Some(s) = search {
                stmt.query_row(rusqlite::named_params! { ":search": s }, |row| row.get(0))?
            } else {
                stmt.query_row([], |row| row.get(0))?
            };
            n as u32
        };

        let rows_sql = format!(
            "SELECT camera_id, gain, binning, \"offset\", exposure_ms, sensor_temp, \
                    creation_day AS night, \
                    COUNT(*) AS total_frames, \
                    MIN(captured_at) AS first_captured, \
                    MAX(captured_at) AS last_captured \
             FROM dark_frames {where_clause} \
             GROUP BY camera_id, gain, binning, \"offset\", exposure_ms, sensor_temp, creation_day \
             ORDER BY {sort_col} {sort_dir} \
             LIMIT :limit OFFSET :offset"
        );

        let limit = query.limit as i64;
        let offset = query.offset as i64;

        let mut stmt = self.conn.prepare(&rows_sql)?;
        let rows: Vec<DarkFrameRow> = if let Some(s) = search {
            stmt.query_map(
                rusqlite::named_params! { ":search": s, ":limit": limit, ":offset": offset },
                map_dark_frame_row,
            )?
            .collect::<Result<Vec<_>>>()?
        } else {
            stmt.query_map(
                rusqlite::named_params! { ":limit": limit, ":offset": offset },
                map_dark_frame_row,
            )?
            .collect::<Result<Vec<_>>>()?
        };

        Ok(DarkFramePage { rows, total })
    }

    // drill-down: the individual frames behind one grouped row
    pub fn get_dark_frames_in_group(
        &self,
        camera_id: Uuid,
        gain: u32,
        binning: u32,
        offset: Option<u32>,
        exposure_ms: i64,
        sensor_temp: Option<f64>,
        night: &str,
    ) -> Result<Vec<DarkFrame>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, session_id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, exposure_ms
             FROM dark_frames
             WHERE camera_id = ?1 AND gain = ?2 AND binning = ?3
               AND \"offset\" IS ?4
               AND exposure_ms = ?5
               AND sensor_temp IS ?6
               AND creation_day = ?7
             ORDER BY captured_at ASC",
        )?;
        let rows = stmt
            .query_map(
                params![
                    camera_id.to_string(),
                    gain,
                    binning,
                    offset,
                    exposure_ms,
                    sensor_temp,
                    night
                ],
                map_dark_frame,
            )?
            .collect::<Result<Vec<_>>>()?;
        Ok(rows)
    }

    // ------------ dark flat frames ------------

    pub fn insert_dark_flat_frame(&self, frame: &DarkFlatFrame) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO dark_flat_frames
                (id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, exposure_ms)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
            params![
                frame.id.to_string(),
                frame.hash,
                frame.rel_path,
                frame.file_size_bytes,
                frame.creation_day,
                frame.captured_at,
                frame.imported_at,
                frame.updated_at,
                frame.binning,
                frame.gain,
                frame.offset,
                frame.sensor_set_temp,
                frame.sensor_temp,
                frame.camera_id.to_string(),
                frame.exposure_ms,
            ],
        )?;
        Ok(())
    }

    pub fn remove_dark_flat_frame(&self, id: Uuid) -> Result<()> {
        self.conn.execute(
            "DELETE FROM dark_flat_frames WHERE id = ?1",
            params![id.to_string()],
        )?;
        Ok(())
    }

    pub fn get_dark_flat_frame_by_id(&self, id: Uuid) -> Result<Option<DarkFlatFrame>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, exposure_ms
             FROM dark_flat_frames WHERE id = ?1",
        )?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(map_dark_flat_frame(row)?))
        } else {
            Ok(None)
        }
    }

    // grouped table view: one row per (camera + settings + exposure + night)
    pub fn get_dark_flat_frames(&self, query: &DarkFlatFrameQuery) -> Result<DarkFlatFramePage> {
        let sort_col = match query.sort_by {
            DarkFlatFrameSortKey::Night => "night",
            DarkFlatFrameSortKey::TotalFrames => "total_frames",
            DarkFlatFrameSortKey::Gain => "gain",
            DarkFlatFrameSortKey::Binning => "binning",
            DarkFlatFrameSortKey::Exposure => "exposure_ms",
            DarkFlatFrameSortKey::FirstCaptured => "first_captured",
            DarkFlatFrameSortKey::LastCaptured => "last_captured",
        };
        let sort_dir = match query.sort_dir {
            SortDir::Asc => "ASC",
            SortDir::Desc => "DESC",
        };

        let search = query
            .search
            .as_ref()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty());

        let where_clause = if search.is_some() {
            "WHERE creation_day REGEXP :search \
               OR CAST(gain AS TEXT) REGEXP :search \
               OR CAST(binning AS TEXT) REGEXP :search \
               OR CAST(IFNULL(\"offset\", '') AS TEXT) REGEXP :search \
               OR CAST(exposure_ms AS TEXT) REGEXP :search"
        } else {
            ""
        };

        let count_sql = format!(
            "SELECT COUNT(*) FROM (\
                SELECT 1 FROM dark_flat_frames {where_clause} \
                GROUP BY camera_id, gain, binning, \"offset\", exposure_ms, creation_day\
             )"
        );
        let total: u32 = {
            let mut stmt = self.conn.prepare(&count_sql)?;
            let n: i64 = if let Some(s) = search {
                stmt.query_row(rusqlite::named_params! { ":search": s }, |row| row.get(0))?
            } else {
                stmt.query_row([], |row| row.get(0))?
            };
            n as u32
        };

        let rows_sql = format!(
            "SELECT camera_id, gain, binning, \"offset\", exposure_ms, \
                    creation_day AS night, \
                    COUNT(*) AS total_frames, \
                    MIN(captured_at) AS first_captured, \
                    MAX(captured_at) AS last_captured \
             FROM dark_flat_frames {where_clause} \
             GROUP BY camera_id, gain, binning, \"offset\", exposure_ms, creation_day \
             ORDER BY {sort_col} {sort_dir} \
             LIMIT :limit OFFSET :offset"
        );

        let limit = query.limit as i64;
        let offset = query.offset as i64;

        let mut stmt = self.conn.prepare(&rows_sql)?;
        let rows: Vec<DarkFlatFrameRow> = if let Some(s) = search {
            stmt.query_map(
                rusqlite::named_params! { ":search": s, ":limit": limit, ":offset": offset },
                map_dark_flat_frame_row,
            )?
            .collect::<Result<Vec<_>>>()?
        } else {
            stmt.query_map(
                rusqlite::named_params! { ":limit": limit, ":offset": offset },
                map_dark_flat_frame_row,
            )?
            .collect::<Result<Vec<_>>>()?
        };

        Ok(DarkFlatFramePage { rows, total })
    }

    // drill-down: the individual frames behind one grouped row
    pub fn get_dark_flat_frames_in_group(
        &self,
        camera_id: Uuid,
        gain: u32,
        binning: u32,
        offset: Option<u32>,
        exposure_ms: i64,
        night: &str,
    ) -> Result<Vec<DarkFlatFrame>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, exposure_ms
             FROM dark_flat_frames
             WHERE camera_id = ?1 AND gain = ?2 AND binning = ?3
               AND \"offset\" IS ?4
               AND exposure_ms = ?5
               AND creation_day = ?6
             ORDER BY captured_at ASC",
        )?;
        let rows = stmt
            .query_map(
                params![
                    camera_id.to_string(),
                    gain,
                    binning,
                    offset,
                    exposure_ms,
                    night
                ],
                map_dark_flat_frame,
            )?
            .collect::<Result<Vec<_>>>()?;
        Ok(rows)
    }

    // ------------ flat frames ------------

    pub fn insert_flat_frame(&self, frame: &FlatFrame) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO flat_frames
                (id, session_id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, telescope_id, filter_id, flattener_id, exposure_ms)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)",
            params![
                frame.id.to_string(),
                frame.session_id.to_string(),
                frame.hash,
                frame.rel_path,
                frame.file_size_bytes,
                frame.creation_day,
                frame.captured_at,
                frame.imported_at,
                frame.updated_at,
                frame.binning,
                frame.gain,
                frame.offset,
                frame.sensor_set_temp,
                frame.sensor_temp,
                frame.camera_id.to_string(),
                frame.telescope_id.to_string(),
                frame.filter_id.map(|u| u.to_string()),
                frame.flattener_id.map(|u| u.to_string()),
                frame.exposure_ms,
            ],
        )?;
        Ok(())
    }

    pub fn remove_flat_frame(&self, id: Uuid) -> Result<()> {
        self.conn.execute(
            "DELETE FROM flat_frames WHERE id = ?1",
            params![id.to_string()],
        )?;
        Ok(())
    }

    pub fn get_flat_frame_by_id(&self, id: Uuid) -> Result<Option<FlatFrame>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, session_id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, telescope_id, filter_id, flattener_id, exposure_ms
             FROM flat_frames WHERE id = ?1",
        )?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(map_flat_frame(row)?))
        } else {
            Ok(None)
        }
    }

    // grouped table view: one row per (camera + optics + settings + exposure + night)
    pub fn get_flat_frames(&self, query: &FlatFrameQuery) -> Result<FlatFramePage> {
        let sort_col = match query.sort_by {
            FlatFrameSortKey::Night => "night",
            FlatFrameSortKey::TotalFrames => "total_frames",
            FlatFrameSortKey::Gain => "gain",
            FlatFrameSortKey::Binning => "binning",
            FlatFrameSortKey::Exposure => "exposure_ms",
            FlatFrameSortKey::FirstCaptured => "first_captured",
            FlatFrameSortKey::LastCaptured => "last_captured",
        };
        let sort_dir = match query.sort_dir {
            SortDir::Asc => "ASC",
            SortDir::Desc => "DESC",
        };

        let search = query
            .search
            .as_ref()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty());

        let where_clause = if search.is_some() {
            "WHERE creation_day REGEXP :search \
               OR CAST(gain AS TEXT) REGEXP :search \
               OR CAST(binning AS TEXT) REGEXP :search \
               OR CAST(IFNULL(\"offset\", '') AS TEXT) REGEXP :search \
               OR CAST(exposure_ms AS TEXT) REGEXP :search"
        } else {
            ""
        };

        let count_sql = format!(
            "SELECT COUNT(*) FROM (\
                SELECT 1 FROM flat_frames {where_clause} \
                GROUP BY camera_id, telescope_id, filter_id, gain, binning, \"offset\", exposure_ms, creation_day\
             )"
        );
        let total: u32 = {
            let mut stmt = self.conn.prepare(&count_sql)?;
            let n: i64 = if let Some(s) = search {
                stmt.query_row(rusqlite::named_params! { ":search": s }, |row| row.get(0))?
            } else {
                stmt.query_row([], |row| row.get(0))?
            };
            n as u32
        };

        let rows_sql = format!(
            "SELECT camera_id, telescope_id, filter_id, gain, binning, \"offset\", exposure_ms, \
                    creation_day AS night, \
                    COUNT(*) AS total_frames, \
                    MIN(captured_at) AS first_captured, \
                    MAX(captured_at) AS last_captured \
             FROM flat_frames {where_clause} \
             GROUP BY camera_id, telescope_id, filter_id, gain, binning, \"offset\", exposure_ms, creation_day \
             ORDER BY {sort_col} {sort_dir} \
             LIMIT :limit OFFSET :offset"
        );

        let limit = query.limit as i64;
        let offset = query.offset as i64;

        let mut stmt = self.conn.prepare(&rows_sql)?;
        let rows: Vec<FlatFrameRow> = if let Some(s) = search {
            stmt.query_map(
                rusqlite::named_params! { ":search": s, ":limit": limit, ":offset": offset },
                map_flat_frame_row,
            )?
            .collect::<Result<Vec<_>>>()?
        } else {
            stmt.query_map(
                rusqlite::named_params! { ":limit": limit, ":offset": offset },
                map_flat_frame_row,
            )?
            .collect::<Result<Vec<_>>>()?
        };

        Ok(FlatFramePage { rows, total })
    }

    // drill-down: the individual frames behind one grouped row
    pub fn get_flat_frames_in_group(
        &self,
        camera_id: Uuid,
        telescope_id: Option<Uuid>,
        filter_id: Option<Uuid>,
        gain: u32,
        binning: u32,
        offset: Option<u32>,
        exposure_ms: i64,
        night: &str,
    ) -> Result<Vec<FlatFrame>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, session_id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, telescope_id, filter_id, flattener_id, exposure_ms
             FROM flat_frames
             WHERE camera_id = ?1
               AND telescope_id IS ?2
               AND filter_id IS ?3
               AND gain = ?4 AND binning = ?5
               AND \"offset\" IS ?6
               AND exposure_ms = ?7
               AND creation_day = ?8
             ORDER BY captured_at ASC",
        )?;
        let rows = stmt
            .query_map(
                params![
                    camera_id.to_string(),
                    telescope_id.map(|u| u.to_string()),
                    filter_id.map(|u| u.to_string()),
                    gain,
                    binning,
                    offset,
                    exposure_ms,
                    night
                ],
                map_flat_frame,
            )?
            .collect::<Result<Vec<_>>>()?;
        Ok(rows)
    }

    // ------------ light frames ------------

    pub fn insert_light_frame(&self, frame: &LightFrame) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO light_frames
                (id, session_id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, telescope_id, mount_id, filter_id, flattener_id, exposure_ms, target)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21)",
            params![
                frame.id.to_string(),
                frame.session_id.to_string(),
                frame.hash,
                frame.rel_path,
                frame.file_size_bytes,
                frame.creation_day,
                frame.captured_at,
                frame.imported_at,
                frame.updated_at,
                frame.binning,
                frame.gain,
                frame.offset,
                frame.sensor_set_temp,
                frame.sensor_temp,
                frame.camera_id.to_string(),
                frame.telescope_id.to_string(),
                frame.mount_id.to_string(),
                frame.filter_id.map(|u| u.to_string()),
                frame.flattener_id.map(|u| u.to_string()),
                frame.exposure_ms,
                frame.target,
            ],
        )?;
        Ok(())
    }

    pub fn remove_light_frame(&self, id: Uuid) -> Result<()> {
        self.conn.execute(
            "DELETE FROM light_frames WHERE id = ?1",
            params![id.to_string()],
        )?;
        Ok(())
    }

    pub fn get_light_frame_by_id(&self, id: Uuid) -> Result<Option<LightFrame>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, session_id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, telescope_id, mount_id, filter_id, flattener_id, exposure_ms, target
             FROM light_frames WHERE id = ?1",
        )?;
        let mut rows = stmt.query(params![id.to_string()])?;
        if let Some(row) = rows.next()? {
            Ok(Some(map_light_frame(row)?))
        } else {
            Ok(None)
        }
    }

    // grouped table view: one row per (target + camera + optics + settings + exposure + temp + night)
    pub fn get_light_frames(&self, query: &LightFrameQuery) -> Result<LightFramePage> {
        let sort_col = match query.sort_by {
            LightFrameSortKey::Night => "night",
            LightFrameSortKey::Target => "target",
            LightFrameSortKey::TotalFrames => "total_frames",
            LightFrameSortKey::Gain => "gain",
            LightFrameSortKey::Binning => "binning",
            LightFrameSortKey::Exposure => "exposure_ms",
            LightFrameSortKey::FirstCaptured => "first_captured",
            LightFrameSortKey::LastCaptured => "last_captured",
        };
        let sort_dir = match query.sort_dir {
            SortDir::Asc => "ASC",
            SortDir::Desc => "DESC",
        };

        let search = query
            .search
            .as_ref()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty());

        let where_clause = if search.is_some() {
            "WHERE target REGEXP :search \
               OR creation_day REGEXP :search \
               OR CAST(gain AS TEXT) REGEXP :search \
               OR CAST(binning AS TEXT) REGEXP :search \
               OR CAST(IFNULL(\"offset\", '') AS TEXT) REGEXP :search \
               OR CAST(exposure_ms AS TEXT) REGEXP :search \
               OR CAST(IFNULL(sensor_temp, '') AS TEXT) REGEXP :search"
        } else {
            ""
        };

        let count_sql = format!(
            "SELECT COUNT(*) FROM (\
                SELECT 1 FROM light_frames {where_clause} \
                GROUP BY camera_id, telescope_id, filter_id, target, gain, binning, \"offset\", exposure_ms, sensor_temp, creation_day\
             )"
        );
        let total: u32 = {
            let mut stmt = self.conn.prepare(&count_sql)?;
            let n: i64 = if let Some(s) = search {
                stmt.query_row(rusqlite::named_params! { ":search": s }, |row| row.get(0))?
            } else {
                stmt.query_row([], |row| row.get(0))?
            };
            n as u32
        };

        let rows_sql = format!(
            "SELECT camera_id, telescope_id, filter_id, target, gain, binning, \"offset\", exposure_ms, sensor_temp, \
                    creation_day AS night, \
                    COUNT(*) AS total_frames, \
                    MIN(captured_at) AS first_captured, \
                    MAX(captured_at) AS last_captured \
             FROM light_frames {where_clause} \
             GROUP BY camera_id, telescope_id, filter_id, target, gain, binning, \"offset\", exposure_ms, sensor_temp, creation_day \
             ORDER BY {sort_col} {sort_dir} \
             LIMIT :limit OFFSET :offset"
        );

        let limit = query.limit as i64;
        let offset = query.offset as i64;

        let mut stmt = self.conn.prepare(&rows_sql)?;
        let rows: Vec<LightFrameRow> = if let Some(s) = search {
            stmt.query_map(
                rusqlite::named_params! { ":search": s, ":limit": limit, ":offset": offset },
                map_light_frame_row,
            )?
            .collect::<Result<Vec<_>>>()?
        } else {
            stmt.query_map(
                rusqlite::named_params! { ":limit": limit, ":offset": offset },
                map_light_frame_row,
            )?
            .collect::<Result<Vec<_>>>()?
        };

        Ok(LightFramePage { rows, total })
    }

    // drill-down: the individual frames behind one grouped row
    pub fn get_light_frames_in_group(
        &self,
        camera_id: Uuid,
        telescope_id: Option<Uuid>,
        filter_id: Option<Uuid>,
        target: &str,
        gain: u32,
        binning: u32,
        offset: Option<u32>,
        exposure_ms: i64,
        sensor_temp: Option<f64>,
        night: &str,
    ) -> Result<Vec<LightFrame>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, session_id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, telescope_id, mount_id, filter_id, flattener_id, exposure_ms, target
             FROM light_frames
             WHERE camera_id = ?1
               AND telescope_id IS ?2
               AND filter_id IS ?3
               AND target = ?4
               AND gain = ?5 AND binning = ?6
               AND \"offset\" IS ?7
               AND exposure_ms = ?8
               AND sensor_temp IS ?9
               AND creation_day = ?10
             ORDER BY captured_at ASC",
        )?;
        let rows = stmt
            .query_map(
                params![
                    camera_id.to_string(),
                    telescope_id.map(|u| u.to_string()),
                    filter_id.map(|u| u.to_string()),
                    target,
                    gain,
                    binning,
                    offset,
                    exposure_ms,
                    sensor_temp,
                    night
                ],
                map_light_frame,
            )?
            .collect::<Result<Vec<_>>>()?;
        Ok(rows)
    }
}

// ------------ bias-frame row mappers ------------

// function items (not closures) so they can be reused across query_map calls
fn map_bias_frame(row: &rusqlite::Row) -> Result<BiasFrame> {
    let id_str: String = row.get(0)?;
    let camera_id_str: String = row.get(13)?;
    Ok(BiasFrame {
        id: Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil()),
        hash: row.get(1)?,
        rel_path: row.get(2)?,
        file_size_bytes: row.get(3)?,
        creation_day: row.get(4)?,
        captured_at: row.get(5)?,
        imported_at: row.get(6)?,
        updated_at: row.get(7)?,
        binning: row.get(8)?,
        gain: row.get(9)?,
        offset: row.get(10)?,
        sensor_set_temp: row.get(11)?,
        sensor_temp: row.get(12)?,
        camera_id: Uuid::parse_str(&camera_id_str).unwrap_or_else(|_| Uuid::nil()),
    })
}

fn map_bias_frame_row(row: &rusqlite::Row) -> Result<BiasFrameRow> {
    let camera_id_str: String = row.get(0)?;
    Ok(BiasFrameRow {
        camera_id: Uuid::parse_str(&camera_id_str).unwrap_or_else(|_| Uuid::nil()),
        gain: row.get(1)?,
        binning: row.get(2)?,
        offset: row.get(3)?,
        night: row.get(4)?,
        total_frames: row.get::<_, i64>(5)? as u32,
        first_captured: row.get(6)?,
        last_captured: row.get(7)?,
    })
}

// ------------ dark-frame row mappers ------------

fn map_dark_frame(row: &rusqlite::Row) -> Result<DarkFrame> {
    let id_str: String = row.get(0)?;
    let session_id: Option<String> = row.get(1)?;
    let camera_id_str: String = row.get(14)?;
    Ok(DarkFrame {
        id: Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil()),
        session_id: parse_opt_uuid(session_id),
        hash: row.get(2)?,
        rel_path: row.get(3)?,
        file_size_bytes: row.get(4)?,
        creation_day: row.get(5)?,
        captured_at: row.get(6)?,
        imported_at: row.get(7)?,
        updated_at: row.get(8)?,
        binning: row.get(9)?,
        gain: row.get(10)?,
        offset: row.get(11)?,
        sensor_set_temp: row.get(12)?,
        sensor_temp: row.get(13)?,
        camera_id: Uuid::parse_str(&camera_id_str).unwrap_or_else(|_| Uuid::nil()),
        exposure_ms: row.get(15)?,
    })
}

fn map_dark_frame_row(row: &rusqlite::Row) -> Result<DarkFrameRow> {
    let camera_id_str: String = row.get(0)?;
    Ok(DarkFrameRow {
        camera_id: Uuid::parse_str(&camera_id_str).unwrap_or_else(|_| Uuid::nil()),
        gain: row.get(1)?,
        binning: row.get(2)?,
        offset: row.get(3)?,
        exposure_ms: row.get(4)?,
        sensor_temp: row.get(5)?,
        night: row.get(6)?,
        total_frames: row.get::<_, i64>(7)? as u32,
        first_captured: row.get(8)?,
        last_captured: row.get(9)?,
    })
}

// ------------ dark-flat-frame row mappers ------------

fn map_dark_flat_frame(row: &rusqlite::Row) -> Result<DarkFlatFrame> {
    let id_str: String = row.get(0)?;
    let camera_id_str: String = row.get(13)?;
    Ok(DarkFlatFrame {
        id: Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil()),
        hash: row.get(1)?,
        rel_path: row.get(2)?,
        file_size_bytes: row.get(3)?,
        creation_day: row.get(4)?,
        captured_at: row.get(5)?,
        imported_at: row.get(6)?,
        updated_at: row.get(7)?,
        binning: row.get(8)?,
        gain: row.get(9)?,
        offset: row.get(10)?,
        sensor_set_temp: row.get(11)?,
        sensor_temp: row.get(12)?,
        camera_id: Uuid::parse_str(&camera_id_str).unwrap_or_else(|_| Uuid::nil()),
        exposure_ms: row.get(14)?,
    })
}

fn map_dark_flat_frame_row(row: &rusqlite::Row) -> Result<DarkFlatFrameRow> {
    let camera_id_str: String = row.get(0)?;
    Ok(DarkFlatFrameRow {
        camera_id: Uuid::parse_str(&camera_id_str).unwrap_or_else(|_| Uuid::nil()),
        gain: row.get(1)?,
        binning: row.get(2)?,
        offset: row.get(3)?,
        exposure_ms: row.get(4)?,
        night: row.get(5)?,
        total_frames: row.get::<_, i64>(6)? as u32,
        first_captured: row.get(7)?,
        last_captured: row.get(8)?,
    })
}

// ------------ flat-frame row mappers ------------

fn map_flat_frame(row: &rusqlite::Row) -> Result<FlatFrame> {
    let id_str: String = row.get(0)?;
    let session_id_str: String = row.get(1)?;
    let camera_id_str: String = row.get(14)?;
    let telescope_id_str: String = row.get(15)?;
    let filter_id: Option<String> = row.get(16)?;
    let flattener_id: Option<String> = row.get(17)?;
    Ok(FlatFrame {
        id: Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil()),
        session_id: Uuid::parse_str(&session_id_str).unwrap_or_else(|_| Uuid::nil()),
        hash: row.get(2)?,
        rel_path: row.get(3)?,
        file_size_bytes: row.get(4)?,
        creation_day: row.get(5)?,
        captured_at: row.get(6)?,
        imported_at: row.get(7)?,
        updated_at: row.get(8)?,
        binning: row.get(9)?,
        gain: row.get(10)?,
        offset: row.get(11)?,
        sensor_set_temp: row.get(12)?,
        sensor_temp: row.get(13)?,
        camera_id: Uuid::parse_str(&camera_id_str).unwrap_or_else(|_| Uuid::nil()),
        telescope_id: Uuid::parse_str(&telescope_id_str).unwrap_or_else(|_| Uuid::nil()),
        filter_id: parse_opt_uuid(filter_id),
        flattener_id: parse_opt_uuid(flattener_id),
        exposure_ms: row.get(18)?,
    })
}

fn map_flat_frame_row(row: &rusqlite::Row) -> Result<FlatFrameRow> {
    let camera_id_str: String = row.get(0)?;
    let telescope_id: Option<String> = row.get(1)?;
    let filter_id: Option<String> = row.get(2)?;
    Ok(FlatFrameRow {
        camera_id: Uuid::parse_str(&camera_id_str).unwrap_or_else(|_| Uuid::nil()),
        telescope_id: parse_opt_uuid(telescope_id),
        filter_id: parse_opt_uuid(filter_id),
        gain: row.get(3)?,
        binning: row.get(4)?,
        offset: row.get(5)?,
        exposure_ms: row.get(6)?,
        night: row.get(7)?,
        total_frames: row.get::<_, i64>(8)? as u32,
        first_captured: row.get(9)?,
        last_captured: row.get(10)?,
    })
}

// ------------ light-frame row mappers ------------

fn map_light_frame(row: &rusqlite::Row) -> Result<LightFrame> {
    let id_str: String = row.get(0)?;
    let session_id_str: String = row.get(1)?;
    let camera_id_str: String = row.get(14)?;
    let telescope_id_str: String = row.get(15)?;
    let mount_id_str: String = row.get(16)?;
    let filter_id: Option<String> = row.get(17)?;
    let flattener_id: Option<String> = row.get(18)?;
    Ok(LightFrame {
        id: Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil()),
        session_id: Uuid::parse_str(&session_id_str).unwrap_or_else(|_| Uuid::nil()),
        hash: row.get(2)?,
        rel_path: row.get(3)?,
        file_size_bytes: row.get(4)?,
        creation_day: row.get(5)?,
        captured_at: row.get(6)?,
        imported_at: row.get(7)?,
        updated_at: row.get(8)?,
        binning: row.get(9)?,
        gain: row.get(10)?,
        offset: row.get(11)?,
        sensor_set_temp: row.get(12)?,
        sensor_temp: row.get(13)?,
        camera_id: Uuid::parse_str(&camera_id_str).unwrap_or_else(|_| Uuid::nil()),
        telescope_id: Uuid::parse_str(&telescope_id_str).unwrap_or_else(|_| Uuid::nil()),
        mount_id: Uuid::parse_str(&mount_id_str).unwrap_or_else(|_| Uuid::nil()),
        filter_id: parse_opt_uuid(filter_id),
        flattener_id: parse_opt_uuid(flattener_id),
        exposure_ms: row.get(19)?,
        target: row.get(20)?,
    })
}

fn map_light_frame_row(row: &rusqlite::Row) -> Result<LightFrameRow> {
    let camera_id_str: String = row.get(0)?;
    let telescope_id: Option<String> = row.get(1)?;
    let filter_id: Option<String> = row.get(2)?;
    Ok(LightFrameRow {
        camera_id: Uuid::parse_str(&camera_id_str).unwrap_or_else(|_| Uuid::nil()),
        telescope_id: parse_opt_uuid(telescope_id),
        filter_id: parse_opt_uuid(filter_id),
        target: row.get(3)?,
        gain: row.get(4)?,
        binning: row.get(5)?,
        offset: row.get(6)?,
        exposure: row.get(7)?,
        sensor_temp: row.get(8)?,
        night: row.get(9)?,
        total_frames: row.get::<_, i64>(10)? as u32,
        first_captured: row.get(11)?,
        last_captured: row.get(12)?,
    })
}

// parses an optional uuid stored as TEXT, dropping malformed values
fn parse_opt_uuid(s: Option<String>) -> Option<Uuid> {
    s.and_then(|s| Uuid::parse_str(&s).ok())
}

// registers a REGEXP scalar function backed by the `regex` crate
// the compiled pattern is cached per statement via get_or_create_aux
fn add_regexp_function(conn: &Connection) -> Result<()> {
    conn.create_scalar_function(
        "regexp",
        2,
        FunctionFlags::SQLITE_UTF8 | FunctionFlags::SQLITE_DETERMINISTIC,
        move |ctx| {
            type BoxError = Box<dyn std::error::Error + Send + Sync + 'static>;
            let regexp: Arc<Regex> = ctx
                .get_or_create_aux(0, |vr| -> std::result::Result<_, BoxError> {
                    Ok(Regex::new(vr.as_str()?)?)
                })?;
            let text = ctx
                .get_raw(1)
                .as_str()
                .map_err(|e| rusqlite::Error::UserFunctionError(e.into()))?;
            Ok(regexp.is_match(text))
        },
    )
}

// one-off dummy-data seeder, run explicitly:
//   cargo test --manifest-path src-tauri/Cargo.toml seed_dummy_data -- --ignored --nocapture
// deletes the existing db first so the reworked schema is applied fresh
#[cfg(test)]
mod seed {
    use super::Database;
    use crate::models::equipment::{Camera, Filter, Mount, Telescope};
    use crate::models::imaging_frames::bias_frame::BiasFrame;
    use crate::models::imaging_frames::dark_flat_frame::DarkFlatFrame;
    use crate::models::imaging_frames::dark_frame::DarkFrame;
    use crate::models::imaging_frames::flat_frame::FlatFrame;
    use crate::models::imaging_frames::light_frame::LightFrame;
    use chrono::{NaiveDate, TimeZone, Utc};
    use std::path::PathBuf;
    use uuid::Uuid;

    #[test]
    #[ignore]
    fn seed_dummy_data() {
        let root = PathBuf::from(r"C:\Users\rouve\Documents\Astolog");
        let db_path = root.join(".astrolog").join("astrolog.db");
        // start fresh: we edited migrations in place, so a stale db keeps old columns
        let _ = std::fs::remove_file(&db_path);

        let db = Database::new(&root).expect("open db");

        let cam = Uuid::parse_str("11111111-1111-1111-1111-111111111111").unwrap();
        let scope = Uuid::parse_str("22222222-2222-2222-2222-222222222222").unwrap();
        let mount = Uuid::parse_str("33333333-3333-3333-3333-333333333333").unwrap();
        let filter = Uuid::parse_str("44444444-4444-4444-4444-444444444444").unwrap();

        db.insert_camera(&Camera {
            id: cam,
            brand: "ZWO".into(),
            name: "ASI2600MM Pro".into(),
            pixel_size: 3.76,
            pixel_x: 6248,
            pixel_y: 4176,
            sensor_type: "Mono".into(),
        })
        .unwrap();
        db.insert_telescope(&Telescope {
            id: scope,
            brand: "Sky-Watcher".into(),
            name: "Esprit 100ED".into(),
            telescope_type: "Refractor".into(),
            focal_length: 550,
            aperture: 100,
        })
        .unwrap();
        db.insert_mount(&Mount {
            id: mount,
            brand: "Sky-Watcher".into(),
            name: "EQ6-R Pro".into(),
        })
        .unwrap();
        db.insert_filter(&Filter {
            id: filter,
            brand: "Antlia".into(),
            name: "Ha 3nm".into(),
            filter_type: "Narrowband".into(),
            size: "36mm".into(),
        })
        .unwrap();

        let night = NaiveDate::from_ymd_opt(2026, 6, 7).unwrap();
        let imported = Utc::now();
        let cap = |h: u32, m: u32| Utc.with_ymd_and_hms(2026, 6, 7, h, m, 0).unwrap();
        let flat_session = Uuid::new_v4();
        let light_session = Uuid::new_v4();

        // 3 bias
        for i in 0..3 {
            db.insert_bias_frame(&BiasFrame {
                id: Uuid::new_v4(),
                hash: None,
                rel_path: format!("CALIBRATION/bias/bias_{:03}.fits", i + 1),
                file_size_bytes: 52_000_000,
                creation_day: night,
                captured_at: Some(cap(21, i)),
                imported_at: imported,
                updated_at: None,
                binning: 1,
                gain: 100,
                offset: Some(50),
                sensor_set_temp: Some(-10.0),
                sensor_temp: Some(-10.0),
                camera_id: cam,
            })
            .unwrap();
        }

        // 2 darks (300s, -10 °C, cooled library -> no session)
        for i in 0..2 {
            db.insert_dark_frame(&DarkFrame {
                id: Uuid::new_v4(),
                session_id: None,
                hash: None,
                rel_path: format!("CALIBRATION/darks/dark_{:03}.fits", i + 1),
                file_size_bytes: 52_000_000,
                creation_day: night,
                captured_at: Some(cap(22, i)),
                imported_at: imported,
                updated_at: None,
                binning: 1,
                gain: 100,
                offset: Some(50),
                sensor_set_temp: Some(-10.0),
                sensor_temp: Some(-10.0),
                camera_id: cam,
                exposure_ms: 300_000,
            })
            .unwrap();
        }

        // 2 dark flats (3s)
        for i in 0..2 {
            db.insert_dark_flat_frame(&DarkFlatFrame {
                id: Uuid::new_v4(),
                hash: None,
                rel_path: format!("CALIBRATION/darkflats/darkflat_{:03}.fits", i + 1),
                file_size_bytes: 52_000_000,
                creation_day: night,
                captured_at: Some(cap(8, i)),
                imported_at: imported,
                updated_at: None,
                binning: 1,
                gain: 100,
                offset: Some(50),
                sensor_set_temp: Some(-10.0),
                sensor_temp: Some(-10.0),
                camera_id: cam,
                exposure_ms: 3_000,
            })
            .unwrap();
        }

        // 2 flats (3s, Ha)
        for i in 0..2 {
            db.insert_flat_frame(&FlatFrame {
                id: Uuid::new_v4(),
                session_id: flat_session,
                hash: None,
                rel_path: format!("CALIBRATION/flats/flat_{:03}.fits", i + 1),
                file_size_bytes: 52_000_000,
                creation_day: night,
                captured_at: Some(cap(8, i + 10)),
                imported_at: imported,
                updated_at: None,
                binning: 1,
                gain: 100,
                offset: Some(50),
                sensor_set_temp: Some(-10.0),
                sensor_temp: Some(-10.0),
                camera_id: cam,
                telescope_id: scope,
                filter_id: Some(filter),
                flattener_id: None,
                exposure_ms: 3_000,
            })
            .unwrap();
        }

        // 5 lights (300s, M31, Ha)
        for i in 0..5 {
            db.insert_light_frame(&LightFrame {
                id: Uuid::new_v4(),
                session_id: light_session,
                hash: None,
                rel_path: format!("DATA/M31/light_{:03}.fits", i + 1),
                file_size_bytes: 52_000_000,
                creation_day: night,
                captured_at: Some(cap(23, i)),
                imported_at: imported,
                updated_at: None,
                binning: 1,
                gain: 100,
                offset: Some(50),
                sensor_set_temp: Some(-10.0),
                sensor_temp: Some(-10.0),
                camera_id: cam,
                telescope_id: scope,
                mount_id: mount,
                filter_id: Some(filter),
                flattener_id: None,
                exposure_ms: 300_000,
                target: "M31".into(),
            })
            .unwrap();
        }

        println!("seeded dummy data into {}", db_path.display());
    }
}
