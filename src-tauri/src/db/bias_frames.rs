use super::{parse_uuid, Database};
use crate::models::imaging_frames::bias_frame::{
    BiasFrame, BiasFramePage, BiasFrameQuery, BiasFrameRow, BiasFrameSortKey,
};
use crate::models::imaging_frames::SortDir;
use regex::Regex;
use rusqlite::{params, Result};
use uuid::Uuid;

impl Database {
    // ------------ bias frames ------------

    pub fn insert_bias_frame(&self, frame: &BiasFrame) -> Result<()> {
        self.conn.execute(
            "INSERT INTO bias_frames
                (id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
             ON CONFLICT(id) DO UPDATE SET
                 hash = excluded.hash,
                 rel_path = excluded.rel_path,
                 file_size_bytes = excluded.file_size_bytes,
                 creation_day = excluded.creation_day,
                 captured_at = excluded.captured_at,
                 imported_at = excluded.imported_at,
                 updated_at = excluded.updated_at,
                 binning = excluded.binning,
                 gain = excluded.gain,
                 \"offset\" = excluded.\"offset\",
                 sensor_set_temp = excluded.sensor_set_temp,
                 sensor_temp = excluded.sensor_temp,
                 camera_id = excluded.camera_id",
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

        // an invalid regex would error the whole grouped query mid-typing;
        // treat it as "no matches" so the search box degrades gracefully
        if let Some(s) = search {
            if Regex::new(s).is_err() {
                return Ok(BiasFramePage {
                    rows: Vec::new(),
                    total: 0,
                });
            }
        }

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
}

// ------------ bias-frame row mappers ------------

// function items (not closures) so they can be reused across query_map calls
fn map_bias_frame(row: &rusqlite::Row) -> Result<BiasFrame> {
    let id_str: String = row.get(0)?;
    let camera_id_str: String = row.get(13)?;
    Ok(BiasFrame {
        id: parse_uuid(&id_str)?,
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
        camera_id: parse_uuid(&camera_id_str)?,
    })
}

fn map_bias_frame_row(row: &rusqlite::Row) -> Result<BiasFrameRow> {
    let camera_id_str: String = row.get(0)?;
    Ok(BiasFrameRow {
        camera_id: parse_uuid(&camera_id_str)?,
        gain: row.get(1)?,
        binning: row.get(2)?,
        offset: row.get(3)?,
        night: row.get(4)?,
        total_frames: row.get::<_, i64>(5)? as u32,
        first_captured: row.get(6)?,
        last_captured: row.get(7)?,
    })
}
