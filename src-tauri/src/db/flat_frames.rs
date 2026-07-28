use super::{parse_opt_uuid, parse_uuid, Database};
use crate::models::imaging_frames::flat_frame::{
    FlatFrame, FlatFramePage, FlatFrameQuery, FlatFrameRow, FlatFrameSortKey,
};
use crate::models::imaging_frames::SortDir;
use regex::Regex;
use rusqlite::{params, Result};
use uuid::Uuid;

impl Database {
    // ------------ flat frames ------------

    pub fn insert_flat_frame(&self, frame: &FlatFrame) -> Result<()> {
        self.conn.execute(
            "INSERT INTO flat_frames
                (id, session_id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, telescope_id, filter_id, flattener_id, exposure_ms)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)
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
                 telescope_id = excluded.telescope_id,
                 filter_id = excluded.filter_id,
                 flattener_id = excluded.flattener_id,
                 exposure_ms = excluded.exposure_ms",
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

        // an invalid regex would error the whole grouped query mid-typing;
        // treat it as "no matches" so the search box degrades gracefully
        if let Some(s) = search {
            if Regex::new(s).is_err() {
                return Ok(FlatFramePage {
                    rows: Vec::new(),
                    total: 0,
                });
            }
        }

        let count_sql = format!(
            "SELECT COUNT(*) FROM (\
                SELECT 1 FROM flat_frames {where_clause} \
                GROUP BY camera_id, telescope_id, filter_id, flattener_id, gain, binning, \"offset\", exposure_ms, creation_day\
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
            "SELECT camera_id, telescope_id, filter_id, flattener_id, gain, binning, \"offset\", exposure_ms, \
                    creation_day AS night, \
                    COUNT(*) AS total_frames, \
                    MIN(captured_at) AS first_captured, \
                    MAX(captured_at) AS last_captured \
             FROM flat_frames {where_clause} \
             GROUP BY camera_id, telescope_id, filter_id, flattener_id, gain, binning, \"offset\", exposure_ms, creation_day \
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
        telescope_id: Uuid,
        filter_id: Option<Uuid>,
        flattener_id: Option<Uuid>,
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
               AND telescope_id = ?2
               AND filter_id IS ?3
               AND flattener_id IS ?4
               AND gain = ?5 AND binning = ?6
               AND \"offset\" IS ?7
               AND exposure_ms = ?8
               AND creation_day = ?9
             ORDER BY captured_at ASC",
        )?;
        let rows = stmt
            .query_map(
                params![
                    camera_id.to_string(),
                    telescope_id.to_string(),
                    filter_id.map(|u| u.to_string()),
                    flattener_id.map(|u| u.to_string()),
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
        id: parse_uuid(&id_str)?,
        session_id: parse_uuid(&session_id_str)?,
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
        telescope_id: parse_uuid(&telescope_id_str)?,
        filter_id: parse_opt_uuid(filter_id)?,
        flattener_id: parse_opt_uuid(flattener_id)?,
        exposure_ms: row.get(18)?,
    })
}

fn map_flat_frame_row(row: &rusqlite::Row) -> Result<FlatFrameRow> {
    let camera_id_str: String = row.get(0)?;
    let telescope_id_str: String = row.get(1)?;
    let filter_id: Option<String> = row.get(2)?;
    let flattener_id: Option<String> = row.get(3)?;
    Ok(FlatFrameRow {
        camera_id: parse_uuid(&camera_id_str)?,
        telescope_id: parse_uuid(&telescope_id_str)?,
        filter_id: parse_opt_uuid(filter_id)?,
        flattener_id: parse_opt_uuid(flattener_id)?,
        gain: row.get(4)?,
        binning: row.get(5)?,
        offset: row.get(6)?,
        exposure_ms: row.get(7)?,
        night: row.get(8)?,
        total_frames: row.get::<_, i64>(9)? as u32,
        first_captured: row.get(10)?,
        last_captured: row.get(11)?,
    })
}
