use std::collections::HashMap;
use std::path::Path;

use chrono::{DateTime, Utc};
use rusqlite::{Connection, Row};
use uuid::Uuid;

use crate::models::equipment::{
    Camera, EquipmentList, EquipmentNote, Filter, Flattener, Mount, Telescope,
};

/// Open the database at `path`, ensuring the schema exists.
pub fn open(path: &Path) -> rusqlite::Result<Connection> {
    let conn = Connection::open(path)?;
    conn.pragma_update(None, "foreign_keys", true)?;
    migrate(&conn)?;
    Ok(conn)
}

/// Create all tables if they don't exist yet.
fn migrate(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS telescopes (
            id            TEXT PRIMARY KEY,
            brand         TEXT NOT NULL,
            name          TEXT NOT NULL,
            focal_length  INTEGER NOT NULL,
            aperture      INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS cameras (
            id             TEXT PRIMARY KEY,
            brand          TEXT NOT NULL,
            name           TEXT NOT NULL,
            pixel_size     REAL NOT NULL,
            pixel_x        INTEGER NOT NULL,
            pixel_y        INTEGER NOT NULL,
            is_monochrome  INTEGER NOT NULL,
            is_dslr        INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS mounts (
            id     TEXT PRIMARY KEY,
            brand  TEXT NOT NULL,
            name   TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS filters (
            id           TEXT PRIMARY KEY,
            brand        TEXT NOT NULL,
            name         TEXT NOT NULL,
            filter_type  TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS flatteners (
            id      TEXT PRIMARY KEY,
            brand   TEXT NOT NULL,
            name    TEXT NOT NULL,
            factor  REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS equipment_notes (
            id            TEXT PRIMARY KEY,
            equipment_id  TEXT NOT NULL,
            date          TEXT NOT NULL,
            note          TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_equipment_notes_equipment_id
            ON equipment_notes (equipment_id);
        ",
    )
}

/// Load the full equipment list from the database into memory.
pub fn load_equipment(conn: &Connection) -> rusqlite::Result<EquipmentList> {
    // Notes are stored flat and grouped by the equipment they belong to.
    let notes = load_notes(conn)?;

    let mut list = EquipmentList::new();

    let mut stmt = conn.prepare("SELECT id, brand, name, focal_length, aperture FROM telescopes")?;
    let rows = stmt.query_map([], |row| {
        let id = parse_uuid(row, 0)?;
        Ok(Telescope {
            id,
            brand: row.get(1)?,
            name: row.get(2)?,
            notes: notes.get(&id).cloned().unwrap_or_default(),
            focal_length: row.get(3)?,
            aperture: row.get(4)?,
        })
    })?;
    for t in rows {
        let t = t?;
        list.telescopes.insert(t.id, t);
    }

    let mut stmt = conn.prepare(
        "SELECT id, brand, name, pixel_size, pixel_x, pixel_y, is_monochrome, is_dslr FROM cameras",
    )?;
    let rows = stmt.query_map([], |row| {
        let id = parse_uuid(row, 0)?;
        Ok(Camera {
            id,
            brand: row.get(1)?,
            name: row.get(2)?,
            notes: notes.get(&id).cloned().unwrap_or_default(),
            pixel_size: row.get(3)?,
            pixel_x: row.get(4)?,
            pixel_y: row.get(5)?,
            is_monochrome: row.get(6)?,
            is_dslr: row.get(7)?,
        })
    })?;
    for c in rows {
        let c = c?;
        list.cameras.insert(c.id, c);
    }

    let mut stmt = conn.prepare("SELECT id, brand, name FROM mounts")?;
    let rows = stmt.query_map([], |row| {
        let id = parse_uuid(row, 0)?;
        Ok(Mount {
            id,
            brand: row.get(1)?,
            name: row.get(2)?,
            notes: notes.get(&id).cloned().unwrap_or_default(),
        })
    })?;
    for m in rows {
        let m = m?;
        list.mounts.insert(m.id, m);
    }

    let mut stmt = conn.prepare("SELECT id, brand, name, filter_type FROM filters")?;
    let rows = stmt.query_map([], |row| {
        let id = parse_uuid(row, 0)?;
        Ok(Filter {
            id,
            brand: row.get(1)?,
            name: row.get(2)?,
            notes: notes.get(&id).cloned().unwrap_or_default(),
            filter_type: row.get(3)?,
        })
    })?;
    for f in rows {
        let f = f?;
        list.filters.insert(f.id, f);
    }

    let mut stmt = conn.prepare("SELECT id, brand, name, factor FROM flatteners")?;
    let rows = stmt.query_map([], |row| {
        let id = parse_uuid(row, 0)?;
        Ok(Flattener {
            id,
            brand: row.get(1)?,
            name: row.get(2)?,
            notes: notes.get(&id).cloned().unwrap_or_default(),
            factor: row.get(3)?,
        })
    })?;
    for f in rows {
        let f = f?;
        list.flatteners.insert(f.id, f);
    }

    Ok(list)
}

/// Load every note, grouped by the equipment id it is attached to.
fn load_notes(conn: &Connection) -> rusqlite::Result<HashMap<Uuid, HashMap<Uuid, EquipmentNote>>> {
    let mut stmt = conn.prepare("SELECT id, equipment_id, date, note FROM equipment_notes")?;
    let rows = stmt.query_map([], |row| {
        let equipment_id = parse_uuid(row, 1)?;
        let date = parse_date(row, 2)?;
        Ok((
            equipment_id,
            EquipmentNote {
                id: parse_uuid(row, 0)?,
                date,
                note: row.get(3)?,
            },
        ))
    })?;

    let mut grouped: HashMap<Uuid, HashMap<Uuid, EquipmentNote>> = HashMap::new();
    for row in rows {
        let (equipment_id, note) = row?;
        grouped.entry(equipment_id).or_default().insert(note.id, note);
    }
    Ok(grouped)
}

fn parse_uuid(row: &Row, idx: usize) -> rusqlite::Result<Uuid> {
    let raw: String = row.get(idx)?;
    Uuid::parse_str(&raw)
        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(idx, rusqlite::types::Type::Text, Box::new(e)))
}

fn parse_date(row: &Row, idx: usize) -> rusqlite::Result<DateTime<Utc>> {
    let raw: String = row.get(idx)?;
    DateTime::parse_from_rfc3339(&raw)
        .map(|d| d.with_timezone(&Utc))
        .map_err(|e| rusqlite::Error::FromSqlConversionFailure(idx, rusqlite::types::Type::Text, Box::new(e)))
}
