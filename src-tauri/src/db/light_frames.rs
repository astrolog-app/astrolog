use super::{parse_opt_uuid, parse_uuid, Database};
use crate::models::imaging_frames::light_frame::{
    LightFrame, LightFramePage, LightFrameQuery, LightFrameRow, LightFrameSortKey,
};
use crate::models::imaging_frames::SortDir;
use regex::Regex;
use rusqlite::{params, Result};
use uuid::Uuid;

impl Database {
    // ------------ light frames ------------

    pub fn insert_light_frame(&self, frame: &LightFrame) -> Result<()> {
        self.conn.execute(
            "INSERT INTO light_frames
                (id, session_id, hash, rel_path, file_size_bytes, creation_day, captured_at, imported_at, updated_at, binning, gain, \"offset\", sensor_set_temp, sensor_temp, camera_id, telescope_id, mount_id, filter_id, flattener_id, exposure_ms, target)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21)
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
                 mount_id = excluded.mount_id,
                 filter_id = excluded.filter_id,
                 flattener_id = excluded.flattener_id,
                 exposure_ms = excluded.exposure_ms,
                 target = excluded.target",
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

        // an invalid regex would error the whole grouped query mid-typing;
        // treat it as "no matches" so the search box degrades gracefully
        if let Some(s) = search {
            if Regex::new(s).is_err() {
                return Ok(LightFramePage {
                    rows: Vec::new(),
                    total: 0,
                });
            }
        }

        let count_sql = format!(
            "SELECT COUNT(*) FROM (\
                SELECT 1 FROM light_frames {where_clause} \
                GROUP BY camera_id, telescope_id, mount_id, filter_id, flattener_id, target, gain, binning, \"offset\", exposure_ms, sensor_temp, creation_day\
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
            "SELECT camera_id, telescope_id, mount_id, filter_id, flattener_id, target, gain, binning, \"offset\", exposure_ms, sensor_temp, \
                    creation_day AS night, \
                    COUNT(*) AS total_frames, \
                    MIN(captured_at) AS first_captured, \
                    MAX(captured_at) AS last_captured \
             FROM light_frames {where_clause} \
             GROUP BY camera_id, telescope_id, mount_id, filter_id, flattener_id, target, gain, binning, \"offset\", exposure_ms, sensor_temp, creation_day \
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
        telescope_id: Uuid,
        mount_id: Uuid,
        filter_id: Option<Uuid>,
        flattener_id: Option<Uuid>,
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
               AND telescope_id = ?2
               AND mount_id = ?3
               AND filter_id IS ?4
               AND flattener_id IS ?5
               AND target = ?6
               AND gain = ?7 AND binning = ?8
               AND \"offset\" IS ?9
               AND exposure_ms = ?10
               AND sensor_temp IS ?11
               AND creation_day = ?12
             ORDER BY captured_at ASC",
        )?;
        let rows = stmt
            .query_map(
                params![
                    camera_id.to_string(),
                    telescope_id.to_string(),
                    mount_id.to_string(),
                    filter_id.map(|u| u.to_string()),
                    flattener_id.map(|u| u.to_string()),
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
        mount_id: parse_uuid(&mount_id_str)?,
        filter_id: parse_opt_uuid(filter_id)?,
        flattener_id: parse_opt_uuid(flattener_id)?,
        exposure_ms: row.get(19)?,
        target: row.get(20)?,
    })
}

fn map_light_frame_row(row: &rusqlite::Row) -> Result<LightFrameRow> {
    let camera_id_str: String = row.get(0)?;
    let telescope_id_str: String = row.get(1)?;
    let mount_id_str: String = row.get(2)?;
    let filter_id: Option<String> = row.get(3)?;
    let flattener_id: Option<String> = row.get(4)?;
    Ok(LightFrameRow {
        camera_id: parse_uuid(&camera_id_str)?,
        telescope_id: parse_uuid(&telescope_id_str)?,
        mount_id: parse_uuid(&mount_id_str)?,
        filter_id: parse_opt_uuid(filter_id)?,
        flattener_id: parse_opt_uuid(flattener_id)?,
        target: row.get(5)?,
        gain: row.get(6)?,
        binning: row.get(7)?,
        offset: row.get(8)?,
        exposure: row.get(9)?,
        sensor_temp: row.get(10)?,
        night: row.get(11)?,
        total_frames: row.get::<_, i64>(12)? as u32,
        first_captured: row.get(13)?,
        last_captured: row.get(14)?,
    })
}
