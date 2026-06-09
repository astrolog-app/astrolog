use crate::models::equipment::{Camera, EquipmentList, Filter, Flattener, Mount, Telescope};
use crate::models::imaging_frames::bias_frame::{
    BiasFrame, BiasFramePage, BiasFrameQuery, BiasFrameRow, BiasFrameSortKey,
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
        let mut conn = Connection::open(db_path)?;

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
                    camera_id TEXT NOT NULL,
                    captured_at TEXT NOT NULL,
                    gain INTEGER NOT NULL,
                    binning INTEGER NOT NULL,
                    \"offset\" INTEGER
                );
                CREATE INDEX IF NOT EXISTS idx_bias_frames_camera_captured
                    ON bias_frames(camera_id, captured_at);",
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
        let mut stmt = self
            .conn
            .prepare("SELECT id, brand, name, telescope_type, focal_length, aperture FROM telescopes")?;
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
                (id, hash, rel_path, camera_id, captured_at, gain, binning, \"offset\")
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                frame.id.to_string(),
                frame.hash,
                frame.rel_path,
                frame.camera_id.to_string(),
                frame.captured_at,
                frame.gain,
                frame.binning,
                frame.offset,
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
            "SELECT id, hash, rel_path, camera_id, captured_at, gain, binning, \"offset\"
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
            "WHERE date(captured_at, '-12 hours') REGEXP :search \
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
                GROUP BY camera_id, gain, binning, \"offset\", date(captured_at, '-12 hours')\
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
                    date(captured_at, '-12 hours') AS night, \
                    COUNT(*) AS total_frames, \
                    MIN(captured_at) AS first_captured, \
                    MAX(captured_at) AS last_captured \
             FROM bias_frames {where_clause} \
             GROUP BY camera_id, gain, binning, \"offset\", date(captured_at, '-12 hours') \
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
            "SELECT id, hash, rel_path, camera_id, captured_at, gain, binning, \"offset\"
             FROM bias_frames
             WHERE camera_id = ?1 AND gain = ?2 AND binning = ?3
               AND \"offset\" IS ?4
               AND date(captured_at, '-12 hours') = ?5
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
}

// ------------ bias-frame row mappers ------------

// function items (not closures) so they can be reused across query_map calls
fn map_bias_frame(row: &rusqlite::Row) -> Result<BiasFrame> {
    let id_str: String = row.get(0)?;
    let camera_id_str: String = row.get(3)?;
    Ok(BiasFrame {
        id: Uuid::parse_str(&id_str).unwrap_or_else(|_| Uuid::nil()),
        hash: row.get(1)?,
        rel_path: row.get(2)?,
        camera_id: Uuid::parse_str(&camera_id_str).unwrap_or_else(|_| Uuid::nil()),
        captured_at: row.get(4)?,
        gain: row.get(5)?,
        binning: row.get(6)?,
        offset: row.get(7)?,
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

// registers a REGEXP scalar function backed by the `regex` crate
// the compiled pattern is cached per statement via get_or_create_aux
fn add_regexp_function(conn: &Connection) -> Result<()> {
    conn.create_scalar_function(
        "regexp",
        2,
        FunctionFlags::SQLITE_UTF8 | FunctionFlags::SQLITE_DETERMINISTIC,
        move |ctx| {
            type BoxError = Box<dyn std::error::Error + Send + Sync + 'static>;
            let regexp: Arc<Regex> = ctx.get_or_create_aux(0, |vr| -> std::result::Result<_, BoxError> {
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
