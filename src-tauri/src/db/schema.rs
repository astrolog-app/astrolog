use rusqlite_migration::{Migrations, M};

// the migration list is append-only: add new M::up entries at the end, never
// edit or reorder existing ones once real user data exists. foreign keys live
// in the create-table statements; PRAGMA foreign_keys is enabled on the
// connection after migrations (see Database::init)
pub(super) fn migrations() -> Migrations<'static> {
    Migrations::new(vec![
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
                    camera_id TEXT NOT NULL,
                    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE RESTRICT
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
                    CHECK (session_id IS NOT NULL OR sensor_temp IS NOT NULL),
                    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE RESTRICT
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
                    exposure_ms INTEGER NOT NULL,
                    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE RESTRICT
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
                    exposure_ms INTEGER NOT NULL,
                    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE RESTRICT,
                    FOREIGN KEY (telescope_id) REFERENCES telescopes(id) ON DELETE RESTRICT,
                    FOREIGN KEY (filter_id) REFERENCES filters(id) ON DELETE RESTRICT,
                    FOREIGN KEY (flattener_id) REFERENCES flatteners(id) ON DELETE RESTRICT
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
                    target TEXT NOT NULL,
                    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE RESTRICT,
                    FOREIGN KEY (telescope_id) REFERENCES telescopes(id) ON DELETE RESTRICT,
                    FOREIGN KEY (mount_id) REFERENCES mounts(id) ON DELETE RESTRICT,
                    FOREIGN KEY (filter_id) REFERENCES filters(id) ON DELETE RESTRICT,
                    FOREIGN KEY (flattener_id) REFERENCES flatteners(id) ON DELETE RESTRICT
                );
                CREATE INDEX IF NOT EXISTS idx_light_frames_camera_day
                    ON light_frames(camera_id, creation_day);",
        ),
    ])
}
