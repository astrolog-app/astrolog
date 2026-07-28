use regex::Regex;
use rusqlite::functions::FunctionFlags;
use rusqlite::{Connection, Result};
use std::error::Error;
use std::path::PathBuf;
use std::sync::Arc;
use uuid::Uuid;

use super::schema;

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

        schema::migrations().to_latest(&mut conn)?;

        // enforce foreign keys at runtime — sqlite defaults this off and it is
        // per-connection, so set it on every open. equipment is inserted before
        // any frame references it, so the constraints never trip during setup
        conn.execute_batch("PRAGMA foreign_keys = ON;")?;

        Ok(Self { conn })
    }
}

// converts a TEXT-stored uuid, surfacing corruption as a db error instead of
// silently collapsing to nil() (which would also collide as a HashMap key)
pub(crate) fn parse_uuid(s: &str) -> Result<Uuid> {
    Uuid::parse_str(s).map_err(|e| {
        rusqlite::Error::FromSqlConversionFailure(0, rusqlite::types::Type::Text, Box::new(e))
    })
}

// parses an optional uuid stored as TEXT, propagating malformed values as errors
pub(crate) fn parse_opt_uuid(s: Option<String>) -> Result<Option<Uuid>> {
    s.map(|s| parse_uuid(&s)).transpose()
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
