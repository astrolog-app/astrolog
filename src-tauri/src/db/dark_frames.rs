use super::{parse_opt_uuid, parse_uuid, Database};
use crate::models::imaging_frames::dark_frame::{
    DarkFrame, DarkFramePage, DarkFrameQuery, DarkFrameRow, DarkFrameSortKey,
};
use crate::models::imaging_frames::SortDir;
use regex::Regex;
use rusqlite::{params, Result};
use uuid::Uuid;

impl Database {
    // ------------ dark frames ------------

    pub fn insert_dark_frame(&self, frame: &DarkFrame) -> Result<()> {
        self.conn.execute(
            "INSERT INTO dark_frames
                (id, session_id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, exposure_ms)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)
             ON CONFLICT(id) DO UPDATE SET
                 session_id = excluded.session_id,
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
                 camera_id = excluded.camera_id,
                 exposure_ms = excluded.exposure_ms",
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

        // an invalid regex would error the whole grouped query mid-typing;
        // treat it as "no matches" so the search box degrades gracefully
        if let Some(s) = search {
            if Regex::new(s).is_err() {
                return Ok(DarkFramePage {
                    rows: Vec::new(),
                    total: 0,
                });
            }
        }

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
}

// ------------ dark-frame row mappers ------------

fn map_dark_frame(row: &rusqlite::Row) -> Result<DarkFrame> {
    let id_str: String = row.get(0)?;
    let session_id: Option<String> = row.get(1)?;
    let camera_id_str: String = row.get(14)?;
    Ok(DarkFrame {
        id: parse_uuid(&id_str)?,
        session_id: parse_opt_uuid(session_id)?,
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
        camera_id: parse_uuid(&camera_id_str)?,
        exposure_ms: row.get(15)?,
    })
}

fn map_dark_frame_row(row: &rusqlite::Row) -> Result<DarkFrameRow> {
    let camera_id_str: String = row.get(0)?;
    Ok(DarkFrameRow {
        camera_id: parse_uuid(&camera_id_str)?,
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
